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

        this.entitySystems.forEach(function(system)
        {
            //if (system is DrawableEntitySystem)
            //    drawableEntitySystems.Add(system as DrawableEntitySystem);
            
            entitySystems.Add(system);         
        });
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
            system.process(elapsed, this.componentMgr.TotalEntities);
            system.updateEntityCount();
            this.componentMgr.removeEntities();
        });
    }

    return SystemMgr;

})();

/**
 * Aliase for {@link SystemMgr}
 * @class
 */

var SystemManager = SystemMgr;
