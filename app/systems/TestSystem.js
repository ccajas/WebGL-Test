
/**
 * A test System that inherits from EntitySystem
 * @class
 * @name TestSystem
 */

TestSystem = (function()
{
	/**
	 * TestSystem constructor
	 *
	 * @memberOf TestSystem
	 * @param {String} handle the name for this EntitySystem
	 * @param {ComponentManager} componentManager manager to get Components from
	 */

	function TestSystem(handle, componentManager) 
	{
		EntitySystem.call(this, handle, componentManager);
		console.log('TestSystem object', this);
	}

	// Inherit EntitySystem properties

	TestSystem.prototype = Object.create(EntitySystem.prototype,
	{
		// Specific functions for TestScreen object
		process:
		{
			value: function(elapsed)
			{
				// Display some info
				console.log('TestSystem is processing');

				return EntitySystem.prototype.process.call(this, elapsed);
			}
		}
	});

	return TestSystem;

})();
