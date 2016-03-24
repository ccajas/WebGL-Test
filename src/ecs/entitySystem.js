 
/**
 * Base class for an entity System
 * @class
 * @name EntitySystem
 */

EntitySystem = (function()
{
	'use strict';
	
	/**
	 * EntitySystem constructor, setup from the ComponentManager
	 *
	 * @memberOf EntitySystem
	 * @param {String} handle the name for this EntitySystem
	 * @param {ComponentManager} componentManager manager to get Components from
	 */

	function EntitySystem(handle, componentManager)
	{
		this.handle 	   = handle;
		this.totalEntities = 0;
		this.componentMgr  = componentManager;
		this.components    = componentManager.components;
	}

	/**
	 * Update the number of entities
	 *
	 * @memberOf EntitySystem
	 */

	EntitySystem.prototype.updateCount = function()
	{
		this.totalEntities = componentMgr.TotalEntities;
	}

	/**
	 * Update the number of entities
	 *
	 * @memberOf EntitySystem
	 * @param {number} elapsed the elapsed frame time, in seconds
	 * @param {number} totalEntities the total number of active entities
	 * @return {number} number of active entities after processing
	 */

	EntitySystem.prototype.process = function(elapsed, totalEntities)
	{
		return this.totalEntities;
	}

	return EntitySystem;

})();


/**
* Aliase for {@link EntitySystem}
* @class
*/

var System = EntitySystem;
