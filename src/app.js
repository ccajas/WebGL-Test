
Vue.component('viewport', 
{
	data: function()
	{
		return {
			smallBtn: 'color:red; font-weight:bold;',
			e_noGL: "Unable to initialize WebGL. Your browser may not support it, or it's "+
				 "disabled in your browser settings.",

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
		console.log('components:', this.componentTypes);

		// Set up the System Manager
		var componentLists = [];
		var systemMgr = new SystemManager(componentLists);

		// Set timer and update
		startTime = new Date();
		lastFrame = Date.now();

		//this.update(canvas);
		console.log('GL is loaded');

		if (componentLists.length < 1)
			console.log('No component lists found!');

		if (initGL(canvas, this.e_noGL))
		{
			// TODO: Initialize first screen

			// Clear screen and set Z-buffer
			gl.clearColor(0.11, 0.11, 0.11, 1.0);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
	},
	template: '<canvas id="draw"><div>{{ e_noGL }}</div></canvas>'
});

/* Editable text component */

Vue.component('editable', 
{
	data: function()
	{
		return {
			textContent: 'enter your text here'
		}
	},
	compiled: function()
	{
		// Set the first Screens into motion

		// Todo: Add text nodes for info output
	},
	template: '<div class="textedit" contenteditable="true" spellcheck="false">'+
		'{{ textContent }}</div>'
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

		componentTypes: [],
		systems: [],
		section: '',
		sections: ['Component','System','ScreenElement','EntityTemplate']
	},
	compiled: function()
	{
		var self = this;

		// Set initial component type and section
		var type = 0;
		this.section = this.sections[0];

		// Setup data groups
		this.component_data = JSON.parse(localStorage.getItem('component_data')) || [];
		this.system_data        = JSON.parse(localStorage.getItem('system_data'))    || [];

		// Reference for the current data being managed
		this.section_data = this[this.section.toLowerCase() + '_data'];

		// Create the componentTypes from LocalStorage
		this.component_data.forEach(function(t)
		{
			self.componentTypes.push(new ComponentType(t.text, ++type));
		});
	},
	methods: 
	{
		setView: function(view) 
		{
			this.section = view;
			this.section_data = this[view.toLowerCase() + '_data'];
		},

		addItem: function() 
		{
			var text = this.newItem.trim();
			if (text)
			{
				this.section_data.push({ text: text, data: {} });
				this.newItem = '';
				this.saveStorage();
			}
		},
		removeItem: function(index) 
		{
			this.section_data.splice(index, 1);
			this.saveStorage();
		},

		// Sub items for extra data
		addSubItem: function(index)
		{
			var text = this.newItem.trim();
			if (text)
			{
				var cmp = this.section_data[index];
				console.log(cmp.data);
				cmp.data[text] = { }
				cmp.data[text].type = 'type';

				this.section_data.splice(index, 1);
				this.section_data.push({ text: cmp.text, data: cmp.data });	
				this.newItem = '';
				this.saveStorage();
			}
		},

		// Save data to browser's localStorage
		saveStorage: function()
		{
			localStorage.setItem('component_data', JSON.stringify(this.component_data));
			localStorage.setItem('system_data',    JSON.stringify(this.system_data));
		}
	},
});
