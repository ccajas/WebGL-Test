
/**
 * Transition for use in ScreenElements
 * @class
 * @name Transition
 */

Transition = (function()
{
	'use strict';
	
	/**
	 * Transition constructor with optional on/off times
	 *
	 * @memberOf Transition
	 * @param {number} [onTime] length of time to transition on, in seconds
	 * @param {number} [offTime] length of time to transition off, in seconds
	 */

	function Transition(onTime, offTime)
	{
		this.onTime  = onTime  || 1;
		this.offTime = offTime || 1;
		this.waitTime = 0;

		// Current position of the transition, ranging from 0 (fully active, no transition)
		// to 1 (transitioned fully off from the screen)
		this.position = 1;
	}

	// Prototype to make Transition objects from

	/**
	 * Updates the screen's transition
	 *
	 * @memberOf Transition
	 * @param {number} elapsed the elapsed step time, in seconds
	 * @param {number} setTime transition time to divide elapsed time against
	 * @param {number} direction how to move the transition (1 = off, -1 = on)
	 * @return {bool} state whether it is still transitioning or not
	 */

	Transition.prototype.updating = function(elapsed, setTime, direction)
	{
		// Determine how much to transition by
		var tDelta = (setTime == 0) ? 1 : elapsed / setTime;
		this.position += tDelta * direction;

		// Check if the transition has reached its end
		// 1 = entered, 0 = exited
		if ((direction < 0 && this.position <= 0) ||
			(direction > 0 && this.position >= 1))
		{
			// Clamp value
			this.position = Math.max(0, Math.min(this.position, 1));
			return false;
		}

		// Otherwise we are still busy transitioning
		return true;
	}

	return Transition;

})();