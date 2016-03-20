
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

		if (initGL(canvas, this.e_noGL))
		{
			// TODO: Initialize first screen

			// Set timer and update
			startTime = new Date();
			lastFrame = Date.now();

			//this.update(canvas);
			console.log('GL is loaded');

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
		comptypes_data: null,
		system_data: null,

		componentTypes: [],
		systems: [],
		section: 'component'
	},
	compiled: function()
	{
		var self = this;
		var type = 0;

		this.comptypes_data = JSON.parse(localStorage.getItem('component_data'));
		this.system_data = JSON.parse(localStorage.getItem('system_data'));

		// Create the componentTypes from LocalStorage
		this.comptypes_data.forEach(function(t)
		{
			self.componentTypes.push(new ComponentType(t.text, ++type));
		});
	},
	methods: 
	{
		setView: function(view) 
		{
			this.section = view;
		},

		addComponent: function() 
		{
			var text = this.newItem.trim();
			if (text)
			{
				this.comptypes_data.push({ text: text, data: {} });
				this.newItem = '';
				this.saveStorage();
			}
		},
		removeComponent: function(index) 
		{
			this.comptypes_data.splice(index, 1);
			this.saveStorage();
		},

		// Sub lists for extra data
		addSubList: function(index)
		{
			var text = this.newItem.trim();
			if (text)
			{
				var cmp = this.comptypes_data[index];
				console.log(cmp.data);
				cmp.data[text] = { }
				cmp.data[text].type = 'type';

				this.comptypes_data.splice(index, 1);
				this.comptypes_data.push({ text: cmp.text, data: cmp.data });	
				this.newItem = '';
				this.saveStorage();
			}

			console.log(this.comptypes_data);
		},

		// Save data to browser's localStorage
		saveStorage: function()
		{
			localStorage.setItem('component_data', JSON.stringify(this.comptypes_data));
		}
	},
});
