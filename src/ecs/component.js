
/**
 * An Entity Component
 * @class
 * @name Component
 */

Component = (function()
{
	'use strict';
	
	/**
	 * Component constructor
	 *
	 * @memberOf Component
	 * @param {number} [id] ID of the entity this belongs to
	 */

	function Component(type, id)
	{
		this.entityID = id || 0;
		this.live = true;
	}

	/**
	 * Clones a Component
	 *
	 * @memberOf Component
	 * @return the cloned Component
	 */

	Component.prototype.clone = function()
	{
		// JSON trick to quickly clone
		return (JSON.parse(JSON.stringify(this)));
	}

	return Component;

})();
