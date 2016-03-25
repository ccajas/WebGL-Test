
Vue.config.debug = false;

Vue.component('viewport', 
{
	props: {
		'app' : { type: Object }
	},
	template: '<canvas id="draw"></canvas>',
	data: function()
	{
		return {
			componentTypes: this.$parent.componentTypes,
			systems: this.$parent.systems
		}
	},
	compiled: function()
	{
		// Setup app
		this.app = new App(null);

		console.log('Viewport loaded', this.app);
	},
	watch:
	{
		// Initialize the app
		app: function()
		{
			var canvas = this.$el;

			// Set up the System Manager
			var componentLists = [];
			var systemMgr = new SystemManager(componentLists);

			if (componentLists.length < 1)
				console.log('No component lists found!');

			// Start the app!
			this.app.canvas = canvas;
			this.app.init();

			console.log('app started');

			// Send back new ECS data
			this.$dispatch('updateECS', this.app);
		}
	}
});

/* Editable text component */

Vue.component('editabletext',
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

/* Main Vue instance */

var vm = new Vue(
{
	el: '#app',
	data: 
	{
		newItem: '',
		info: 'WebGL test',
		component_data: null,
		system_data: null,
		app: {},

		// Data for ECS
		section: {},
		sections: [
			{ name: 'Component', 	  icon: '&#xf01c;', color: '#fb0' },
			{ name: 'System', 		  icon: '&#xf04e;', color: '#bf7' },
			{ name: 'EntityTemplate', icon: '&#xf020;', color: '#7ff' },
			{ name: 'ScreenElement',  icon: '&#xf11e;', color: '#0bf' }
		],

		// Current section settings
		sectionData: {
 			name: '',
            data: []
		},
	},

	compiled: function()
	{
		var self = this;

		// Set default component type and section
		var type = 0;
		this.section = this.sections[0];

		// Setup data groups
		this.sections.forEach(function(section)
		{
			var name = section.name.toLowerCase() + '_data';
			self[name] = JSON.parse(localStorage.getItem(name)) || 
				{ name: section.name +'s', data: [] }
		});

		// Reference for the current data being managed
		this.sectionData = this[this.section.name.toLowerCase() + '_data'];

		// Attach sources for data entry
		this.sections[1].src = this.component_data.data;

		console.log(this.app);
	},
	events:
	{
		// Save current section's data to browser's localStorage
		saveStorage: function()
		{
			var name = this.section.name.toLowerCase() + '_data';
			localStorage.setItem(name, JSON.stringify(this.sectionData));
		},

		// Update info bar
		updateInfo: function(msg)
		{
			this.info = msg;
		},

		updateECS: function(app)
		{
			this.app = app;
			console.log('Update ECS');

			var self = this;

			// Add ECS data to the app
			this.component_data.data.forEach(function(t)
			{
				console.log(self.app);
				self.app.componentTypes.push(new ComponentType(t.name));
			});

			this.system_data.data.forEach(function(t)
			{
				self.app.addSystem(t.name);
			});

			// Display any error messages
			if (this.app.currentScreen == null)
				this.$emit('updateInfo', 'No screens found!');
		}
	},
	methods: 
	{
		setView: function(view) 
		{
			// Hide text editor if section changed
			if (view.text != this.section.name)
				this.editorText = '';

			this.section = view;
			this.sectionData = this[view.name.toLowerCase() + '_data'];
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
				this.$emit('saveStorage');

				// Add appropriate object based on section
				if (this.section.name == 'Component')
					this.app.componentTypes.push(new ComponentType(text));

				if (this.section.name == 'System')
					this.app.addSystem(text);
			}
		}
	},
});
