
/**
 * Element that stores a screen state
 * @class
 * @name ScreenElement
 */

ScreenElement = (function()
{
	'use strict';
	
	/**
	 * ScreenElement constructor with default settings
	 *
	 * @memberOf ScreenElement
	 * @param {ScreenElement} [previous] ScreenElement to set as the previous one
	 * @param {String} [handle] name for this ScreenElement
	 */

	function ScreenElement(previous, handle)
	{
		// Previous screen that this one came from
		this.previous = previous || null;

		// Transition for this screen
		this.tr = new Transition(0, 0);

		// List of children screen elements, and ones to be removed
		this.children = [];
		this.toBeRemoved = [];

		// Other screen element attributes
		this.status = 'waiting';
		this.handle = handle || 'screen_default';
		this.disabled = false;
	}

	// Prototype to make Screens from
	/**
	 * Checks and update transition state for all related ScreenElements
	 *
	 * @memberOf ScreenElement
	 * @param {number} elapsed the elapsed step time, in seconds
	 * @return {ScreenElement} This ScreenElement or a previous one, depending on status
	 */

	ScreenElement.prototype.updateState = function(elapsed)
	{
		// Set transition on its first frame
		if (this.status == 'waiting') this.status = 't_on';

		if (this.status == 't_on')
		{
			// Transition on and become active if necessary
			if (this.tr.updating(elapsed, this.tr.onTime, -1))
				this.status = 't_on';
			else
				this.status = 'active';
		}

		if (this.status == 't_off')
		{
			// Exiting screens should transition off
			if (!this.tr.updating(elapsed, this.tr.offTime, 1))
			{
				// When the transition finishes, unload and return to the previous screen
				//UnloadContent();
				this.status = 'finished';
				return this.previous;
			}
		}

		return this;
	}

	/**
	 * Checks whether the screen is active and can respond to user input
	 *
	 * @memberOf ScreenElement
	 * @return {bool} true if active, false if inactive
	 */

	ScreenElement.prototype.isActive = function()
	{
		return (this.status == 't_on' || this.status == 'active');
	}

	/**
	 * Tell the screen to transition off
	 *
	 * @memberOf ScreenElement
	 */

	ScreenElement.prototype.exit = function()
	{
		this.status = 't_off';
	}

	/**
	 * Tell the screen to transition on again
	 *
	 * @memberOf ScreenElement
	 */

	ScreenElement.prototype.reset = function()
	{
		this.status = 't_on';
		this.tr.position = 1;
	}

	/**
	 * Updates the ScreenState, running its logic and updating state
	 *
	 * @memberOf ScreenElement
	 * @param {number} elapsed the elapsed step time, in seconds
	 * @return {ScreenElement} This ScreenElement or a previous one, via the updateState function
	 */

	ScreenElement.prototype.update = function(elapsed)
	{
		// First update children Screens (if any)
		this.children.forEach(function(screen)
		{
			screen.update(elapsed);

			// Check again if some screens need to be removed
			if (screen.status == 'finished')
				this.toBeRemoved.push(screen);
		});

		// Remove any finished child screens
		this.toBeRemoved.forEach(function(screen)
		{
			var idx = children.indexOf(screen);
			children.splice(idx, 1);
		});

		// Clear the removed queue
		this.toBeRemoved = [];

		return this.updateState(elapsed);
	}

	return ScreenElement;

})();