
Vue.config.debug = false;

Vue.component('viewport', 
{
	data: function()
	{
		return {
			componentTypes: this.$parent.componentTypes,
			systems: this.$parent.systems
		}
	},
	compiled: function()
	{
		console.log('Viewport loaded');
		var canvas = this.$el;
		// Set the first Screens into motion

		// Todo: Add text nodes for info output
		//console.log('components:', this.componentTypes);

		// Set up the System Manager
		var componentLists = [];
		var systemMgr = new SystemManager(componentLists);

		if (componentLists.length < 1)
			console.log('No component lists found!');

		// Start the app!
		var app = new App(canvas);		
	},
	template: '<canvas id="draw"><div>{{ e_noGL }}</div></canvas>'
});

/* Editable text component */

Vue.component('editable',
{
	props:['textContent'],
	data: function()
	{
		return {
			textModified: '',
			viewable: false
		}
	},
	methods: 
	{
		// Handle keydown event
		keyEdit: function(e)
		{
			this.textModified = e.target.innerText;		
			if (e.keyCode == 9)
			{
				document.execCommand('styleWithCSS', false, null);
				document.execCommand('indent', true, null);
				e.preventDefault();
			}
		},

		save: function() 
		{
			if (this.textModified.trim())
				this.$dispatch('saveCode', this.textModified);
		}
	},

	// Re-update syntax highlight
	// Make this component viewable upon changing
	watch:
	{
		textContent: function()
		{
			// Hide if original text received is blank
			this.textModified = this.textContent;
			this.viewable     = (this.textContent == '') ? false : true;
			Prism.highlightAll();
		}
	}
});

/* Detail View component */

Vue.component('detailview',
{
	props: ['item','name'],
	data: function()
	{
		return {
			itemFull: ''
		}
	},
	methods: 
	{
		deleteItem: function(idx) 
		{
			console.log(idx, this.item.data);
			this.item.data = [];
			console.log(idx, this.item);
			this.$dispatch('saveItem', idx, this.item);
		}
	},
	watch:
	{
		item: function()
		{
			this.itemFull = JSON.stringify(this.item);
		}
	}
});

/* Section list Item component */

Vue.component('listitem',
{
	props: {
		'level': Number,
		'index': Number,
		'item' : { type: Object },
		'icon' : String
	},
	template: '#listitem-template',
	data: function()
	{
		return {
			selected: false
		}
	},
	computed: {
		hasData: function () {
			return this.item.data && this.item.data.length > 0;
		}
	},
	events: 
	{
		removeDataItem: function (index)
		{
			console.log('remove item', index);
			this.item.data.splice(index, 1);
		}
	},
	methods:
	{
		addSub: function()
		{
			console.log(this.item);
			this.item.data = this.item.data || [];
			this.item.data.push({name: 'NewItem', meta: 'type', data: [] } );
		},

		remove: function()
		{
			// If this data list is empty,
			// go up one level and dispatch there
			if (!this.hasData)
				this.$dispatch('removeDataItem', this.index);
		}
	}
});

/* Editable item component */

Vue.component('item', 
{
	props: ['value','meta'],
	template: '#item-editable',
	data: function()
	{
		return {
			selected: false
		}
	},
	methods:
	{
		select: function()
		{
			this.selected = true;
			this.$els.field.style.display = 'inline';
			this.$els.field.focus();
		},
		deselect: function()
		{
			this.selected = false;
			this.$els.field.style.display = 'none';
		},

		// Called on blur event when done editing item
		update: function(idx)
		{
			this.selected = false;
			this.$els.field.style.display = 'none';
			console.log('updated item '+ idx, this.item);
			//this.$dispatch('saveItem', idx, this.item);
		}
	}
});

/* Main Vue instance */

var vm = new Vue(
{
	el: '#app',
	data: 
	{
		newItem: '',
		component_data: null,
		system_data: null,

		// Info for editable text area
		editorText: 'Add your text here!',
		currIndex: -1,

		// Data for ECS
		componentTypes: [],
		systems: [],
		section: '',
		sections: [
			{text: 'Component', 	 icon: '&#xf01c;', color: '#fb0' },
			{text: 'System', 		 icon: '&#xf04e;', color: '#bf7' },
			{text: 'EntityTemplate', icon: '&#xf020;', color: '#7ff' },
			{text: 'ScreenElement',  icon: '&#xf11e;', color: '#0bf' }
		],

		// Current section settings
		selectedName: '',
		sectionData: {
 			name: '',
 			meta: '',
            data: []
		},
	},

	compiled: function()
	{
		var self = this;

		// Set initial component type and section
		var type = 0;
		this.section = this.sections[0];

		// Setup data groups
		this.component_data = JSON.parse(localStorage.getItem('component_data')) || 
			{ name: 'Components', data: [] }

		this.system_data    = JSON.parse(localStorage.getItem('system_data')) || 
			{ name: 'Systems', data: [] }

		// Reference for the current data being managed
		this.sectionData = this[this.section.text.toLowerCase() + '_data'];

		// Create the componentTypes from LocalStorage
		this.component_data.forEach(function(t)
		{
			self.componentTypes.push(new ComponentType(t.text, t.type));
		});
	},
	events:
	{
		// Sub items for extra data
		addSubItem: function(index)
		{
			var item = this.sectionData[index];
			var type = item.type;

			// Replace the sub-item data
			item.data.push({'newItem': 'type'});
			//this.section_data.splice(index, 1);
			//this.section_data.push({ name: cmp.name, type: type, data: cmp.data });	
			//this.newItem = '';
			this.saveStorage(this.sectionData);
		},

		// Remove an item from the root level
		removeItem: function(index) 
		{
			this.sectionData.splice(index, 1);
			this.saveStorage(this.sectionData);
		},

		// Save item updates to localStorage
		saveItem: function(item, key)
		{
			this.sectionData[key] = item;
			this.saveStorage(this.sectionData);
		},

		// Save JSON code for item
		saveCode: function(data)
		{
			var jsonData;

			try {
				jsonData = JSON.parse(data);
			} 
			catch (e) 
			{
				// TODO: display nicer error on web page
				console.error('Invalid JSON data:', e);
				return false;
			}

			console.log('saving code to index '+ this.currIndex, jsonData);
			console.log(this.sectionData[this.currIndex]);

			// Update and save the data
			this.sectionData[this.currIndex] = jsonData;
			this.saveStorage(this.sectionData);
		}
	},
	methods: 
	{
		setView: function(view) 
		{
			// Hide text editor if section changed
			if (view.text != this.section.text)
				this.editorText = '';

			this.section = view;
			this.sectionData = this[view.text.toLowerCase() + '_data'];
		},

		// Add item to the root level
		addItem: function() 
		{
			var text = this.newItem.trim();
			if (text)
			{
				var nextType = this.sectionData.length + 1;
				this.sectionData.data.push({ name: text, type: nextType, data: [] });
				this.newItem = '';
				this.saveStorage(this.sectionData);
			}
		},
/*
		// View JSON code from item
		viewCode: function(index)
		{
			// Format the text to be more readable
			var text = JSON.stringify(this.sectionData[index], null, 4);
			this.editorText = text;
			this.currIndex  = index;

			// Get top level data (excluding objects)
			var item = this.sectionData[index];
			var self = this;
			this.tl_data = {}

			Object.keys(item).forEach(function(key) 
			{
				if (typeof(item[key]) !== 'object')
					self.tl_data[key] = item[key]
			});
		},*/

		// Save data to browser's localStorage
		saveStorage: function(data)
		{
			var name = this.section.text.toLowerCase() + '_data';
			localStorage.setItem(name, JSON.stringify(data));
		}
	},
});
