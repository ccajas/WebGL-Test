
/**
 * @class Main application
 * @name App
 */

App = (function()
{
	'use strict';

	function App(canvas)
	{
		this.init(canvas);
	}

	// Internal variables
	var startTime,
		elapsed,
		lastFrame;

	// Screen handling
	var currentScreen,
		nextScreen;

	// GL error messages
	var e_noGL = "Unable to initialize WebGL. Your browser may not support it, or it's "+
				 "disabled in your browser settings.";

	// Mouse events

	// Only detect mouse movement when button is pressed
/*
	App.onMouseMove = function(event) 
	{
		if (!mouseDown) return;

		var newX = event.clientX;
		var newY = event.clientY;

		thetaX += (newX - lastMouseX) / (m.PI * 90);
		thetaY += (newY - lastMouseY) / (m.PI * 60);

		lastMouseX = newX;
		lastMouseY = newY;
	}*/

	App.prototype =
	{
		init: function(canvas) 
		{
			var canvas = canvas || document.getElementById("draw");

			// Set the first Screens into motion
			//var screen = new InputScreen(null, 'screen 1');
			//var screen2 = new InputScreen(null, 'screen 2');

			// Add text nodes for info output
			//infoEl.appendChild(infoNode);
			
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

		// Draw the scene

		update: function(canvas)
		{
			// Update current time
			elapsed = (Date.now() - lastFrame) / 1000;
			lastFrame = Date.now();
			var time = lastFrame / 5000;

			// Check for screen
            if (currentScreen == null)
            {
                // Something went wrong
                // Show purple screen of doom
				gl.clearColor(0.11, 0.11, 0.11, 1.0);
				gl.enable(gl.DEPTH_TEST);
				gl.depthFunc(gl.LEQUAL);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            }
            // Update screens
            else
                nextScreen = currentScreen.update(elapsed, canvas);

            // Swap screen for the next frame
            if (nextScreen != currentScreen)
                currentScreen = nextScreen;

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
