
var Viewport = Vue.extend(
{
	data: function()
	{
		return 
		{
			// GL error messages
			e_noGL: "Unable to initialize WebGL. Your browser may not support it, or it's "+
				 "disabled in your browser settings."
		}
	},
	ready: function()
	{
		console.log('Viewport loaded');
		console.log(this.$els);
		var canvas = this.$parent.$els.draw;
		// Set the first Screens into motion

		// Todo: Add text nodes for info output
		
		if (initGL(canvas, this.e_noGL))
		{
			// Initialize first screen
			//currentScreen = new TestScreen(null, 'a test screen');

			// Set timer and update
			startTime = new Date();
			lastFrame = Date.now();
			
			//this.update(canvas);
			console.log('GL is loaded');

			// Clear screen and set Z-buffer
			gl.clearColor(0.0, 0.35, 1.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
	},
	//template: '<canvas id="draw"><div>Test</div></canvas>'
});

Vue.component('viewport', Viewport);

var vm = new Vue(
{
	el: '#app',
	data: 
	{
		newTodo: '',
		todo_data: null,
		todos: null
	},
	created: function()
	{
		this.todo_data = JSON.parse(localStorage.getItem('todo_data'));
		this.todos = (this.todo_data != null) ? this.todo_data : [
			{ text: 'Add some todos' }
		];
		console.log(this.todos);
	},
	methods: 
	{
		addTodo: function() 
		{
			var text = this.newTodo.trim()
			if (text)
			{
				this.todos.push({ text: text })
				this.newTodo = '';
			}
			this.saveStorage();
		},
		removeTodo: function(index) 
		{
			this.todos.splice(index, 1);
			this.saveStorage();
		},
		saveStorage: function()
		{
			localStorage.setItem('todo_data', JSON.stringify(this.todos));
		}
	}
});
