
Vue.component('viewport', 
{
	data: function()
	{
		return {
			smallBtn: 'color:red; font-weight:bold;',
			e_noGL: "Unable to initialize WebGL. Your browser may not support it, or it's "+
				 "disabled in your browser settings."
		}
	},
	compiled: function()
	{
		console.log('Viewport loaded');
		var canvas = this.$el;
		// Set the first Screens into motion

		// Todo: Add text nodes for info output

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

/* Main Vue instance */

var vm = new Vue(
{
	el: '#app',
	data: 
	{
		newItem: '',
		todo_data: null,
		todos: null,
		componentTypes: []
	},
	compiled: function()
	{
		var self = this;
		var type = 0;

		this.todo_data = JSON.parse(localStorage.getItem('todo_data'));
		this.todos = (this.todo_data != null) ? this.todo_data : [
			{ text: 'Add some todos', data: {} }
		];

		// Create the componentTypes from LocalStorage
		this.todos.forEach(function(t)
		{
			self.componentTypes.push(new ComponentType(t.text, ++type));
		});

		console.log(this.componentTypes);
	},
	methods: 
	{
		addComponent: function() 
		{
			var text = this.newItem.trim();
			if (text)
			{
				this.todos.push({ text: text, data: {} });
				this.newItem = '';
				this.saveStorage();
			}
		},
		removeComponent: function(index) 
		{
			this.todos.splice(index, 1);
			this.saveStorage();
		},

		// Sub lists for extra data
		addSubList: function(index)
		{
			var text = this.newItem.trim();
			if (text)
			{
				var cmp = this.todos[index];
				console.log(cmp.data);
				cmp.data[text] = { }
				cmp.data[text].type = 'type';

				this.todos.splice(index, 1);
				this.todos.push({ text: cmp.text, data: cmp.data });	
				this.newItem = '';
				this.saveStorage();
			}

			console.log(this.todos);
		},

		// Save data to browser's localStorage
		saveStorage: function()
		{
			localStorage.setItem('todo_data', JSON.stringify(this.todos));
		}
	},
});
