
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
		this.systemManager 	= new SystemManager();

		// Screen handling
		this.currentScreen = null;
		this.nextScreen = null;

		// Content handling
		this.content = new ContentManager();

		// App notificatons
		this.notify =
		{
			newSystem: '',
			newComponentType: ''
		}
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

		addSystem: function(systemName)
		{
			// Look for a system script first
			var dir = 'app/systems/';
			var out = '';
			
			this.systemManager.addSystem(systemName, dir, this.content, out);
			this.notify.newSystem = systemName;

			console.log(out);
			return out;
		},

		addContent: function(fileName, type)
		{
			// Look in the assets folder first
			var dir = 'app/assets/';
			var path = dir + fileName;
			var out = this.content.load('Model')(path, path);

			return out;
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

            // Update the systems
            this.systemManager.processComponents(elapsed);

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
