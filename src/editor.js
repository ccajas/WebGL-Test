
Vue.config.debug = true;

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

		// Start the app
		var app = new App(canvas);		
	},
	template: '<canvas id="draw"><div>{{ e_noGL }}</div></canvas>'
});

/* Editable text component */

Vue.component('editable', 
{
	props:['textContent','viewable'],
	compiled: function()
	{
		// Set the first Screens into motion

		// Todo: Add text nodes for info output
		console.log(this.$el);

		this.$el.onkeydown = function(e)
		{
			if (e.keyCode == 9)
			{
				document.execCommand('styleWithCSS', false, null);
				document.execCommand('indent', true, null);
				e.preventDefault();
			}
		}
	},

	// Re-update syntax highligt
	watch:
	{
		textContent: function()
		{
			console.log(this.textContent);
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

		// Editable text area
		viewEditor: false,
		editorText: 'Add your text here!',

		// Data for ECS
		componentTypes: [],
		systems: [],
		section: '',
		sections: [
			{text: 'Component', 	 icon: '&#xf01c;'},
			{text: 'System', 		 icon: '&#xf04c;'},
			{text: 'EntityTemplate', icon: '&#xf020;'},
			{text: 'ScreenElement',  icon: '&#xf11e;'}
		],
		section_data: null,
		curr_section: null,
		curr_icon: null,
	},
	compiled: function()
	{
		var self = this;

		// Set initial component type and section
		var type = 0;
		this.curr_section = this.sections[0].text;
		this.curr_icon    = this.sections[0].icon;

		// Setup data groups
		this.component_data = JSON.parse(localStorage.getItem('component_data')) || [];
		this.system_data    = JSON.parse(localStorage.getItem('system_data'))    || [];

		// Reference for the current data being managed
		this.section_data = this[this.curr_section.toLowerCase() + '_data'];
		console.log(this.section_data);

		// Create the componentTypes from LocalStorage
		this.component_data.forEach(function(t)
		{
			self.componentTypes.push(new ComponentType(t.text, t.type));
		});
	},
	methods: 
	{
		setView: function(view) 
		{
			this.curr_section = view.text;
			this.curr_icon	  = view.icon;
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
		viewJSON: function(index)
		{
			this.viewEditor = true;

			// Format the text to be more readable
			var text = JSON.stringify(this.section_data[index], null, 4);
			this.editorText = text;
		},

		// Save data to browser's localStorage
		saveStorage: function(data)
		{
			var name = this.section.toLowerCase() + '_data';
			localStorage.setItem(name, JSON.stringify(data));
		}
	},
});
