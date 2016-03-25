
Vue.config.debug = false;

Vue.component('viewport', 
{
	props: {
		'app' 	 	: { type: Object },
		'newSystem' : String,
		'newCtype'	: String
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
	},
	computed:
	{
		newCtype: function()
		{
			// Send new info
			this.newCtype = this.app.notify.newComponentType;
			this.$dispatch('updateInfo', 'Added component type '+ this.newCtype);
		},

		newSystem: function()
		{
			// Send new info
			this.newSystem = this.app.notify.newSystem;
			this.$dispatch('updateInfo', 'Added new system "'+ this.newSystem +'"');
		}
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
			this.newSystem 	= this.app.notify.newSystem;
			this.newCtype  	= this.app.notify.newComponentTypes;
			this.app.init();

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
			{ 
				name: 'Component', 	  
				icon: ['&#xf01c;', '&#xf0ab;'], 
				color: '#fb0',
				src: []
			},
			{ 
				name: 'System',	  
				icon: ['&#xf04e;', '&#xf01c;'], 
				color: '#bf7',
				src: ['Component']
			},
			{ 
				name: 'EntityTemplate', 
				icon: ['&#xf020;', '&#xf01c;'], 
				color: '#7ff',
				src: ['Component']
			},
			{ 
				name: 'ScreenElement',  
				icon: ['&#xf11e;', '&#xf04e;'],
				color: '#0bf',
				src: ['System']
			},
			{
				name: 'Asset',
				icon: ['&#xf10a;', '&#xf10a;'],
				color: '#70f',
				src: []
			}
		],

		// Current section settings
		sectionData: {
 			name: '',
            data: []
		},
	},

	compiled: function()
	{
		var type = 0;
		var self = this;

		// Setup data groups
		this.sections.forEach(function(section)
		{
			var name = section.name.toLowerCase() + '_data';
			self[name] = JSON.parse(localStorage.getItem(name)) || 
				{ name: section.name +'s', data: [] }

		});

		// Setup data sources
		this.sections.forEach(function(section)
		{
			// Replace strings with arrays for data sources
			if (section.src[0])
			{
				var name = section.src[0].toLowerCase() + '_data';
				section.src = self[name].data;
			}
		});

		// Set default component type and section
		this.section = this.sections[0];

		// Reference for the current data being managed
		this.sectionData = this[this.section.name.toLowerCase() + '_data'];
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
			console.log(this.component_data);

			// Add ECS data to the app
			this.component_data.data.forEach(function(t){
				self.app.componentTypes.push(ComponentType.call(this, t.name));
			});

			this.system_data.data.forEach(function(t) {
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
					this.app.componentTypes.push(ComponentType.call(this, text));

				if (this.section.name == 'System')
					this.app.addSystem(text);

				if (this.section.name == 'Asset')
					this.app.addContent(text);
			}
		}
	},
});
