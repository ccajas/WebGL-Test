
/**
 * A manager for all Components
 * @class
 * @name ComponentMgr
 */

ComponentMgr = (function()
{
	'use strict';

	/**
	 * ComponentMgr constructor
	 *
	 * @function
	 * @memberOf ComponentMgr
	 */
	function ComponentMgr() 
	{
		// The next entity in the list
		this.next = 0;

		// Component and template groups
		this.components      = [];
		this.entityTemplates = {}
	}

	/**
	 * Wrapper to add entity templates
	 *
	 * @function
	 * @memberOf ComponentMgr
	 * @param {String} templateName name of the template
	 * @param {EntityTemplate} template entity template
	 */

	ComponentMgr.addEntityTemplate = function(templateName, template)
	{
		this.entityTemplates.push({ name: templateName, template: template });
	}

	/**
	 * Create entity from a template from its name
	 *
	 * @function
	 * @memberOf ComponentMgr
	 * @param {String|EntityTemplate} templateName name of the template, 
	 * or an EntityTemplate to create from
	 * @return [Object] the new entity, if created from a template name
	 */

	ComponentMgr.createEntityFromTemplate = function(templateName)
	{
		// Create from the template's name
		if (typeof templateName === 'string')
		{
			var template = null,
				entity   = null;

			// Check if a valid template exists first
			if (this.entityTemplates.hasOwnProperty(templateName))
			{
				template = this.entityTemplates.templateName;

				// Call method to create new template using the next available ID
				entity = copyTemp.DeepClone(template);

				// Add each component
				for (comp in entity.cmpList)
					this.components[comp.type][this.next] = comp;
			}

			return entity;
		}
		// Create from an external EntityTemplate
		else
		{
			// Add each component
			for (comp in newTemp.cmpList)
				this.components[comp.type][this.next] = comp;
		}

		// Finish adding components for entity
		this.next++;
	}

	/**
	 * Disable an entity's Components by its ID
	 *
	 * @function
	 * @memberOf ComponentMgr
	 * @param {number} entityID the entity's ID
	 */

	ComponentMgr.disableEntity = function(entityID)
	{
		// Check every list for proper updating
		for (cmpArray in this.components.groups)
		{
			if (cmpArray[entityID] != null)
				cmpArray[entityID].live = false;
		}
	}

	/**
	 * Remove entities that no longer have any live Components
	 *
	 * @function
	 * @memberOf ComponentMgr
	 */

	ComponentMgr.removeEntities = function()
	{
		var total = this.next;

		for (var entity = total - 1; entity >= 0; --entity)
		{
			var remove = true;

			// Check every array if all components aren't live
			for (cmpArray in this.components)
			{
				if (cmpArray[entity] != null && cmpArray[entity].live)
					remove = false;
			}

			if (remove)
			{
				// Overwrite this entity's compnents
				var last = this.next - 1;
				foreach (cmpArray in this.components)
				{
					// Update entity IDs
					cmpArray[entity] = cmpArray[last];
					cmpArray[last] = null;

					if (cmpArray[entity] != null)
						cmpArray[entity].SetOwnerEntity(entity);
				}

				// Reduce entity count
				this.next--;
			}
		}
		// Finished removing entities
	}

	return ComponentMgr;

})();

/**
* Aliase for {@link ComponentMgr}
* @class
*/

var ComponentManager = ComponentMgr;
