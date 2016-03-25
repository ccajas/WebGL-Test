/**
 * Management for all the application's EntitySystems
 * @class
 * @name SystemMgr
 */

SystemMgr = (function()
{
	/**
	 * SystemMgr construtor - Setup Component groups
	 *
	 * @memberOf SystemMgr
	 * @param {Array.<Object>} componentLists object containing all lists of Components by type
	 */

	function SystemMgr(componentLists)
	{
		this.entitySystems = []; // Array of Systems (and maybe drawable Systems)
		this.componentMgr = new ComponentManager(componentLists);

		// Alias to componentMgr
		this.entities = '';// function() { return this.componentMgr; }
		this.totalEntities = this.componentMgr.totalEntities;
		this.called = false;
	}

	/**
	 * Add Systems through an array
	 *
	 * @memberOf SystemMgr
	 * @param {Array.<EntitySystem>} systems the array of EntitySystems
	 */

	SystemMgr.prototype.addSystems = function(systems)
	{
		// The order in which systems are added makes a difference in how components interact.
		// The only exception are systems that mainly use Draw().

		var length = this.entitySystems.length;

		systems.forEach(function(system)
		{
			// Avoid inserting duplicates
			var exists = false;

			for (var i = 0; i < length; i++)
			{
				if (this.entitySystems[i].handle === system.handle)
				{
					exists = true;
					console.log('oops! dupe found');
					break;
				}
			}

			if (!exists)
			{
				system.setComponents(this.componentMgr);
				this.entitySystems.push(system);
			}

		}, this);
	}

	/**
	 * Add a System by looking for a local script first, based on name
	 *
	 * @memberOf SystemMgr
	 * @param {String} systemName name of the EntitySystem to look for
	 * @param {String} dir directory name for the EntitySystem scripts
	 * @param {Object} content reference to the ContentManager
	 */

	SystemMgr.prototype.addSystem = function(systemName, dir, content)
	{
		// Look for a system script first
		var path = dir + systemName +'.js';
		var self = this;

		// Load content
		var script = content.load('Script')(path,
		{ 
			load: function() 
			{
				//do stuff with the script
				console.log('script loaded!');
				var loadedSystem = window[systemName];
				self.addSystems
				(
					[ new loadedSystem(systemName) ]
				);
			},

			error: function()
			{
				console.log('Failed to find script! Create system "'+ systemName +'"');
				self.addSystems
				(
					[ new System(systemName) ]
				);
			}
		});
	}

	/**
	 * Remove a System by name
	 *
	 * @memberOf SystemMgr
	 * @param {String} systemName the name of the EntitySystem to be removed
	 */

	SystemMgr.prototype.remove = function(systemName)
	{
		var length = this.entitySystems.length;

		for (var i = 0; i < length; i++)
		{
			if (this.entitySystems[i].handle === systemName)
			{
				this.entitySystems.splice(i, 1);
				break;
			}
		}

		// Unset the global variable for this System if it exists
		if (typeof (window[systemName]) !== 'undefined')
			delete window[systemName];
	}

	/**
	 * Process Components with each System
	 *
	 * @memberOf SystemMgr
	 * @param {number} elapsed the elapsed frame time, in seconds
	 */

	SystemMgr.prototype.processComponents = function(elapsed)
	{
		this.entitySystems.forEach(function(system)
		{
			// Amount of entities might have changed since this step
			system.process(elapsed, this.componentMgr.next);
			system.updateCount();
			this.componentMgr.removeEntities();

		}, this);
	}

	return SystemMgr;

})();

/**
 * Aliase for {@link SystemMgr}
 * @class
 */

var SystemManager = SystemMgr;
