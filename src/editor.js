
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
	compiled: function()
	{
		// Set the first Screens into motion

		// Todo: Add text nodes for info output
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

		save: function () 
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
		tl_data: {},
		section_data: null
	},

	compiled: function()
	{
		var self = this;

		// Set initial component type and section
		var type = 0;
		this.section = this.sections[0];

		// Setup data groups
		this.component_data = JSON.parse(localStorage.getItem('component_data')) || [];
		this.system_data    = JSON.parse(localStorage.getItem('system_data'))    || [];

		// Reference for the current data being managed
		this.section_data = this[this.section.text.toLowerCase() + '_data'];
		console.log(this.section_data);

		// Create the componentTypes from LocalStorage
		this.component_data.forEach(function(t)
		{
			self.componentTypes.push(new ComponentType(t.text, t.type));
		});
	},
	events:
	{
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
			console.log(this.section_data[this.currIndex]);

			// Update and save the data
			this.section_data[this.currIndex] = jsonData;
			this.saveStorage(this.section_data);
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
			this.section_data = this[view.text.toLowerCase() + '_data'];
		},

		// Add item to the root level
		addItem: function() 
		{
			var text = this.newItem.trim();
			if (text)
			{
				var nextType = this.section_data.length + 1;
				this.section_data.push({ name: text, type: nextType, data: {} });
				this.newItem = '';
				this.saveStorage(this.section_data);
			}
		},

		// Remove an item from the root level
		removeItem: function(index) 
		{
			this.section_data.splice(index, 1);
			this.saveStorage(this.section_data);
		},

		// Sub items for extra data
		addSubItem: function(index)
		{
			var text = this.newItem.trim();
			if (text)
			{
				var cmp  = this.section_data[index];
				var type = cmp.type;

				console.log(cmp.data);
				cmp.data[text] = { }
				cmp.data[text].type = 'type';

				// Replace the sub-item data
				this.section_data.splice(index, 1);
				this.section_data.push({ name: cmp.name, type: type, data: cmp.data });	
				this.newItem = '';
				this.saveStorage(this.section_data);
			}
		},

		// View JSON code from item
		viewCode: function(index)
		{
			// Format the text to be more readable
			var text = JSON.stringify(this.section_data[index], null, 4);
			this.editorText = text;
			this.currIndex  = index;

			// Get top level data (excluding objects)
			var item = this.section_data[index];
			var self = this;
			this.tl_data = {}

			Object.keys(item).forEach(function(key) 
			{
				if (typeof(item[key]) !== 'object')
					self.tl_data[key] = item[key]
			});
		},

		// Save data to browser's localStorage
		saveStorage: function(data)
		{
			var name = this.section.text.toLowerCase() + '_data';
			localStorage.setItem(name, JSON.stringify(data));
		}
	},
});
