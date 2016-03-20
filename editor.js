/*! WebGL_test - ver. 0.1.0 */
Vue.component("viewport",{data:function(){return{smallBtn:"color:red; font-weight:bold;",e_noGL:"Unable to initialize WebGL. Your browser may not support it, or it's disabled in your browser settings.",componentTypes:this.$parent.componentTypes,systems:this.$parent.systems}},compiled:function(){console.log("Viewport loaded");var a=this.$el;console.log("components:",this.componentTypes);var b=[];new SystemManager(b);startTime=new Date,lastFrame=Date.now(),console.log("GL is loaded"),b.length<1&&console.log("No component lists found!"),initGL(a,this.e_noGL)&&(gl.clearColor(.11,.11,.11,1),gl.enable(gl.DEPTH_TEST),gl.depthFunc(gl.LEQUAL),gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT))},template:'<canvas id="draw"><div>{{ e_noGL }}</div></canvas>'}),Vue.component("editable",{data:function(){return{textContent:"enter your text here"}},compiled:function(){},template:'<div class="textedit" contenteditable="true" spellcheck="false">{{ textContent }}</div>'});var vm=new Vue({el:"#app",data:{newItem:"",component_data:null,system_data:null,componentTypes:[],systems:[],section:"",sections:["Component","System","ScreenElement","EntityTemplate"]},compiled:function(){var a=this,b=0;this.section=this.sections[0],this.component_data=JSON.parse(localStorage.getItem("component_data"))||[],this.system_data=JSON.parse(localStorage.getItem("system_data"))||[],this.section_data=this[this.section.toLowerCase()+"_data"],this.component_data.forEach(function(c){a.componentTypes.push(new ComponentType(c.text,++b))})},methods:{setView:function(a){this.section=a,this.section_data=this[a.toLowerCase()+"_data"]},addItem:function(){var a=this.newItem.trim();a&&(this.section_data.push({text:a,data:{}}),this.newItem="",this.saveStorage())},removeItem:function(a){this.section_data.splice(a,1),this.saveStorage()},addSubItem:function(a){var b=this.newItem.trim();if(b){var c=this.section_data[a];console.log(c.data),c.data[b]={},c.data[b].type="type",this.section_data.splice(a,1),this.section_data.push({text:c.text,data:c.data}),this.newItem="",this.saveStorage()}},saveStorage:function(){localStorage.setItem("component_data",JSON.stringify(this.component_data)),localStorage.setItem("system_data",JSON.stringify(this.system_data))}}});