
/**
 * A manager for all Components
 * @class
 * @name ComponentManager
 */

ComponentManager = (function()
{
	'use strict';

	// The next entity in the list
	var next = 0;

	// Component and template groups
	var components = [];
	var entityTemplates = {};

	/**
	 * ComponentManager constructor
	 *
	 * @function
	 * @memberOf ComponentManager
	 */
	var ComponentManager = {}

	/**
	 * Wrapper to add entity templates
	 *
	 * @function
	 * @memberOf ComponentManager
	 * @param {String} templateName name of the template
	 * @param {EntityTemplate} template entity template
	 */

	ComponentManager.addEntityTemplate = function(templateName, template)
	{
		entityTemplates.push({ name: templateName, template: template });
	}

	/**
	 * Create entity from a template from its name
	 *
	 * @function
	 * @memberOf ComponentManager
	 * @param {String|EntityTemplate} templateName name of the template, 
	 * or an EntityTemplate to create from
	 * @return [Object] the new entity, if created from a template name
	 */

	ComponentManager.createEntityFromTemplate = function(templateName)
	{
		// Create from the template's name
		if (typeof templateName === 'string')
		{
			var template = null,
				entity   = null;

			// Check if a valid template exists first
			if (entityTemplates.hasOwnProperty(templateName))
			{
				template = copyTemp = entityTemplates.templateName;

				// Call method to create new template using the next available ID
				entity = copyTemp.DeepClone(nextEntity);

				// Add each component
				for (comp in entity.cmpList)
					components[comp.type][next] = comp;
			}

			return entity;
		}
		// Create from an external EntityTemplate
		else
		{
			// Add each component
			for (comp in newTemp.cmpList)
				components[comp.type][next] = comp;
		}

		// Finish adding components for entity
		next++;
	}

	/**
	 * Disable an entity's Components by its ID
	 *
	 * @function
	 * @memberOf ComponentManager
	 * @param {number} entityID the entity's ID
	 */

	ComponentManager.disableEntity = function(entityID)
	{
		// Check every list for proper updating
		for (cmpArray in components.groups)
		{
			if (cmpArray[entityID] != null)
				cmpArray[entityID].live = false;
		}
	}

	/**
	 * Remove entities that no longer have any live Components
	 *
	 * @function
	 * @memberOf ComponentManager
	 */

	ComponentManager.removeEntities = function()
	{
		var total = next;

		for (var entity = total - 1; entity >= 0; --entity)
		{
			var remove = true;

			// Check every array if all components aren't live
			for (cmpArray in components)
			{
				if (cmpArray[entity] != null && cmpArray[entity].live)
					remove = false;
			}

			if (remove)
			{
				// Overwrite this entity's compnents
				var last = next - 1;
				foreach (cmpArray in components)
				{
					// Update entity IDs
					cmpArray[entity] = cmpArray[last];
					cmpArray[last] = null;

					if (cmpArray[entity] != null)
						cmpArray[entity].SetOwnerEntity(entity);
				}

				// Reduce entity count
				next--;
			}
		}
		// Finished removing entities
	}

	return ComponentManager;

})();

/**
* Aliases for {@link ComponentManager}
* @class
*/

ComponentMgr = ComponentManager;
