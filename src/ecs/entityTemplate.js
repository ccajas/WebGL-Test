
/**
 * A template to build entities from
 * @class
 * @name EntityTemplate
 */

EntityTemplate = (function()
{
	'use strict';
	
	/**
	 * EntityTemplate constructor
	 *
	 * @memberOf EntityTemplate
	 * @param {String} name the template name
	 * @param {Array.<Component>} components group of components to build from
	 */

	function EntityTemplate(name, components)
	{
		this.cmpList = [];
		this.name    = name;
		this.bitMask = 0;

		for (comp in components)
		{
			this.cmpList.push(comp);
			this.bitmask |= 1 << comp.type;
		}    
	}

	/**
	 * Get Component based on type
	 *
	 * @memberOf EntityTemplate
	 * @param {number} type the Component type
	 * @return {Component} component of this type
	 */

	EntityTemplate.prototype.getComponent = function(type)
	{
		if ((this.bitmask & 1 << type) == 1 << type)
		{
			var comp = this.cmpList.filter(
				function(c) { return c.type == type; }
			);
			return comp ? comp[0] : null;
		}
		return null;
	}

	/**
	 * Make a deep copy of the template, with entity ID
	 *
	 * @memberOf EntityTemplate
	 * @param {number} [id] the entity ID
	 * @return {EntityTemplate} the cloned template
	 */
	
	EntityTemplate.prototype.deepClone = function(id)
	{
		id = id || -1;
		var clone = new EntityTemplate();

		// Clone list of components
		for (comp in this.compList)
			clone.componentList.push(comp.clone())

		return clone;
	}

	return EntityTemplate;

})();
