
/**
 * A template for Components by type
 * @class
 * @name ComponentType
 */

ComponentType = (function()
{
	'use strict';
	
	/**
	 * ComponentType constructor
	 *
	 * @memberOf ComponentType
	 * @param {String} name the name of the type
	 * @param {number} type Enum type for this Component
	 */

	function ComponentType(name, type)
	{
		this.name = name;
		this.type = type;
		this.data = { }
	}

	return ComponentType;

})();
