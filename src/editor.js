
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
	template: '<canvas id="draw"></canvas>'
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

/* Section list Item component */

Vue.component('listitem',
{
	props: {
		'level': Number,
		'index': Number,
		'item' : { type: Object },
		'icon' : String,
		'src'  : Array
	},
	template: '#listitem-template',
	data: function()
	{
		return {
			open: true,
			selected: false
		}
	},
	computed: 
	{
		hasData: function () 
		{
			var hasData =  this.item.data && this.item.data.length > 0;		
			this.icon = hasData || this.level < 2 ? this.icon : '&#xf0ab;';

			return hasData;
		}
	},
	events:
	{
		removeDataItem: function (index)
		{
			console.log('remove item', index);
			this.item.data.splice(index, 1);
		},

		updateName: function(value, index)
		{
			this.item.name = value;
			console.log(this.item);
			this.$dispatch('saveStorage');
		}
	},
	methods:
	{
		addSub: function()
		{
			this.item.data = this.item.data || [];
			this.item.data.push({name: 'NewItem type', data: [] } );
			this.$dispatch('saveStorage');
		},

		remove: function()
		{
			// Go up one level and remove item from data list
			this.$dispatch('removeDataItem', this.index);
			this.$dispatch('saveStorage');
		}
	}
});

/* Editable item component */

Vue.component('item', 
{
	props: {
		'value': String,
		'idx'  : Number,
		'src'  : { type: Array }
	},
	template: '#item-editable',
	data: function()
	{
		return {
			values: [],
			selected: false
		}
	},
	computed: 
	{
		hasSrc: function () {
			return this.src && this.src.length > 0;
		},

		// Split value to find metadata/item type
		values: function() {
			return this.value.split(' ');
		}
	},
	methods:
	{
		select: function()
		{
			this.selected = true;

			if (!this.hasSrc)
			{
				this.$els.field.style.display = 'inline';
				this.$els.field.focus();
			}
		},
		deselect: function()
		{
			this.selected = false;

			if (!this.hasSrc)
			{
				this.$els.field.style.display = 'none';
			}
		},

		// Called on blur event when done editing item
		update: function()
		{
			this.selected = false;
			this.$els.field.style.display = 'none';

			// Remove extra spaces and update
			this.value = this.value.replace(/ +/g, ' ').trim();
			this.$dispatch('updateName', this.value, this.idx);
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

		// Set initial component type and section
		var type = 0;
		this.section = this.sections[0];

		// Setup data groups
		this.component_data = JSON.parse(localStorage.getItem('component_data')) || 
			{ name: 'Components', data: [] }

		this.system_data    = JSON.parse(localStorage.getItem('system_data')) || 
			{ name: 'Systems', data: [] }

		// Reference for the current data being managed
		this.sectionData = this[this.section.name.toLowerCase() + '_data'];

		// Attach sources for data entry
		this.sections[0].src = [];
		this.sections[1].src = this.component_data.data;

		console.log('sections', this.sections);

		// Create the componentTypes from LocalStorage
		this.component_data.data.forEach(function(t)
		{
			self.componentTypes.push(new ComponentType(t.name));
		});

		console.log('componentTypes', this.componentTypes);
	},
	events:
	{
		// Save current section's data to browser's localStorage
		saveStorage: function()
		{
			var name = this.section.name.toLowerCase() + '_data';
			localStorage.setItem(name, JSON.stringify(this.sectionData));
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
			}
		}
	},
});
