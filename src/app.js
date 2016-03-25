
/**
 * @class Main application
 * @name App
 */

App = (function()
{
	'use strict';

	function App(canvas) 
	{
		this.canvas = canvas;

		// Data for ECS
		this.componentTypes = [];
		this.systems = [];
		this.componentMgr = new ComponentManager();
		console.log('componentMgr', this.componentMgr);

		// Screen handling
		this.currentScreen = null;
		this.nextScreen = null;

		// Content handling
		this.content = new ContentManager();
	}

	// Internal variables
	var startTime,
		elapsed,
		lastFrame;

	// GL error messages
	var e_noGL = "Unable to initialize WebGL. Your browser may not support it, or it's "+
				 "disabled in your browser settings.";

	App.prototype =
	{
		init: function() 
		{
			var canvas = this.canvas || document.getElementById("draw");

			// Setup GL context			
			if (initGL(canvas, e_noGL))
			{
				// Initialize first screen
				//currentScreen = new TestScreen(null, 'a test screen');
				console.log('GL is loaded');

				// Set timer and update
				startTime = new Date();
				lastFrame = Date.now();
				
				this.update(canvas);
			}
		},

		addSystem: function(name)
		{
			// Look for a system script first
			var dir  = 'app/systems/';
			var path = dir + name +'.js';
			var self = this;

			// Load content
			var script = this.content.load('Script')(path, '_'+ name);

			script.onload = function() 
			{
				//do stuff with the script
				console.log('script loaded!');
				var loadedSystem = window[name];

				console.log(loadedSystem);
				self.systems.push(new loadedSystem(name, self.componentMgr));	
			}

			// If script isn't found, make the System and file from scratch
			script.onerror = function()
			{
				console.log('Failed to find script! Create system "'+ name +'"');
				self.systems.push(new System(name, self.componentMgr));	

				// Create the script
				var script = 
					name +' = (function()'+
					'{'+
					'	function TestSystem(handle, componentManager)'+
					'	{'+
					'		EntitySystem.call(this, handle, componentManager)'+
					'		console.log(\''+ name +' object\', this);'+
					'	}'+
					'	'+ name +'.prototype = Object.create(EntitySystem.prototype,'+
					'	{'+
					'		process:'+
					'		{'+
					'			value: function(elapsed)'+
					'			{'+
					'				// Display some info'+
					'				console.log(\''+ name +' is processing\');'+

					'				return EntitySystem.prototype.process.call(this, elapsed);'+
					'			}'+
					'		}'+
					'	});'+

					'	return TestSystem;'+

					'})();';

				var blob = new Blob([script], {type : 'text/javascript'});
				var reader = new FileReader();
				
				reader.addEventListener("loadend", function() {
					console.log('blob content', reader.result);
				   // reader.result contains the contents of blob as a typed array
				});
				reader.readAsArrayBuffer(blob);
			
				//console.log('blob', blob);
				console.log('systems', self.systems);
			}
		},

		// Draw the scene

		update: function(canvas)
		{
			// Update current time
			elapsed = (Date.now() - lastFrame) / 1000;
			lastFrame = Date.now();
			var time = lastFrame / 5000;

			// Check for screen
            if (this.currentScreen == null)
            {
                // Something went wrong
                // Show purple screen of doom
				gl.clearColor(0.21, 0.21, 0.21, 1.0);
				gl.enable(gl.DEPTH_TEST);
				gl.depthFunc(gl.LEQUAL);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            }
            // Update screens
            else
                this.nextScreen = this.currentScreen.update(elapsed, canvas);

            // Swap screen for the next frame
            if (this.nextScreen != this.currentScreen)
                this.currentScreen = this.nextScreen;

            // Get next frame
			var self = this;
			requestAnimationFrame(function animFrame() {
				self.update(canvas);
			});
		}
	}

	return App;

})();

// Start the application
//var app = new App();
