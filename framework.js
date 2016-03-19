/*! WebGL_test - ver. 0.1.0 */
var s="Shader",initGL=function(a,b){gl=null;try{gl=a.getContext("webgl")||a.getContext("experimental-webgl")}catch(c){}return gl||alert(b),gl},loadShaders=function(a,b){var c=a[s+"-vs"],d=a[s+"-fs"];return shp=gl.createProgram(),gl.attachShader(shp,c),gl.attachShader(shp,d),gl.linkProgram(shp),gl.getProgramParameter(shp,gl.LINK_STATUS)||console.error(b),gl.useProgram(shp),shp},createShader=function(a,b,c){var d=a==s+"-vs"?gl.createShader(gl.VERTEX_SHADER):a==s+"-fs"?gl.createShader(gl.FRAGMENT_SHADER):null;return d?(gl.shaderSource(d,b),gl.compileShader(d),gl.getShaderParameter(d,gl.COMPILE_STATUS)?d:(console.error(c+gl.getShaderInfoLog(d)),null)):null},createTexture=function(a){var b=gl.createTexture();return gl.bindTexture(gl.TEXTURE_2D,b),gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,255,255])),gl.bindTexture(gl.TEXTURE_2D,b),gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,a),gl.generateMipmap(gl.TEXTURE_2D),b},initBuffers=function(a){for(var b=gl.createBuffer(),c=a.faces.length,d=[],e=0;c>e;e++)for(var f=0;3>f;f++){var g=a.vert(e,f),h=g[0],i=g[1],j=g[2];d.push(h[0],h[1],h[2]),d.push(j[0],j[1],j[2]),d.push(i[0],i[1])}return gl.bindBuffer(gl.ARRAY_BUFFER,b),gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW),b},resize=function(a,b){var c=a.clientWidth,d=a.clientHeight;a.width==c&&a.height==d||(a.width=c,a.height=d,gl.viewport(0,0,a.width,a.height),b([a.width,a.height]))},createAttribSetters=function(a){for(var b={},c=gl.getProgramParameter(a,gl.ACTIVE_ATTRIBUTES),d=function(a){return function(b){gl.enableVertexAttribArray(a),gl.vertexAttribPointer(a,b.size,b.type||gl.FLOAT,!1,b.stride||0,b.offset||0)}},e=0;c>e;e++){var f=gl.getActiveAttrib(a,e);if(!f){console.error("missing attribute data! Index: "+e);break}var g=gl.getAttribLocation(a,f.name);b[f.name]=d(g)}return b},glTypes=function(a){return[a.FLOAT,a.FLOAT_VEC2,a.FLOAT_VEC3,a.FLOAT_VEC4,a.INT,a.INT_VEC2,a.INT_VEC3,a.INT_VEC4,a.FLOAT_MAT2,a.FLOAT_MAT3,a.FLOAT_MAT4,a.SAMPLER_2D,a.SAMPLER_CUBE]},createUniformSetters=function(a){for(var b={},c=gl.getProgramParameter(a,gl.ACTIVE_UNIFORMS),d=0,e=["1f","2fv","3fv","4fv","1i","2iv","3iv","4iv","2fv","3fv","4fv","1i"],f=function(a,b){var c=gl.getUniformLocation(a,b.name),f=b.type,g=(b.size>1&&"[0]"==b.name.substr(-3),8),h=11,i=glTypes(gl).indexOf(f);return-1==i?null:h>i?function(a){return g>i?gl["uniform"+e[i]](c,a):gl["uniformMatrix"+e[i]](c,!1,a)}:function(a,b){return function(d){gl.uniform1i(c,b),gl.activeTexture(gl.TEXTURE0+b),gl.bindTexture(a,d)}}(f==gl.SAMPLER_2D?gl.TEXTURE_2D:gl.TEXTURE_CUBE_MAP,d++)},g=0;c>g;++g){var h=gl.getActiveUniform(a,g);if(!h){console.error("missing uniform data! Index: "+g);break}var i=h.name;"[0]"==i.substr(-3)&&(i=i.substr(0,i.length-3)),b[i]=f(a,h)}return b};Component=function(){"use strict";function a(a,b){this.entityID=b||0,this.live=!0}return a.prototype.clone=function(){return JSON.parse(JSON.stringify(this))},a}(),ComponentManager=function(){"use strict";var a=0,b=[],c={},d={};return d.addEntityTemplate=function(a,b){c.push({name:a,template:b})},d.createEntityFromTemplate=function(d){if("string"==typeof d){var e=null,f=null;if(c.hasOwnProperty(d)){e=copyTemp=c.templateName,f=copyTemp.DeepClone(nextEntity);for(comp in f.cmpList)b[comp.type][a]=comp}return f}for(comp in newTemp.cmpList)b[comp.type][a]=comp;a++},d.disableEntity=function(a){for(cmpArray in b.groups)null!=cmpArray[a]&&(cmpArray[a].live=!1)},d.removeEntities=function(){for(var c=a,d=c-1;d>=0;--d){var e=!0;for(cmpArray in b)null!=cmpArray[d]&&cmpArray[d].live&&(e=!1);if(e){var f=a-1;foreach(cmpArray in b),cmpArray[d]=cmpArray[f],cmpArray[f]=null,null!=cmpArray[d]&&cmpArray[d].SetOwnerEntity(d),a--}}},d}(),ComponentMgr=ComponentManager,ComponentType=function(){"use strict";function a(a,b){this.name=a,this.type=b,this.data={}}return a}(),EntitySystem=function(){"use strict";function a(a){this.totalEntities=0,this.componentMgr=a,this.components=a.components}return a.prototype.updateCount=function(){this.totalEntities=componentMgr.TotalEntities},a.prototype.process=function(a,b){return this.totalEntities},a}(),EntityTemplate=function(){"use strict";function a(a,b){this.cmpList=[],this.name=a,this.bitMask=0;for(comp in b)this.cmpList.push(comp),this.bitmask|=1<<comp.type}return a.prototype.getComponent=function(a){if((this.bitmask&1<<a)==1<<a){var b=this.cmpList.filter(function(b){return b.type==a});return b?b[0]:null}return null},a.prototype.deepClone=function(b){b=b||-1;var c=new a;for(comp in this.compList)c.componentList.push(comp.clone());return c},a}(),Vue.component("viewport",{data:function(){return{smallBtn:"color:red; font-weight:bold;",e_noGL:"Unable to initialize WebGL. Your browser may not support it, or it's disabled in your browser settings."}},compiled:function(){console.log("Viewport loaded");var a=this.$el;initGL(a,this.e_noGL)&&(startTime=new Date,lastFrame=Date.now(),console.log("GL is loaded"),gl.clearColor(.11,.11,.11,1),gl.enable(gl.DEPTH_TEST),gl.depthFunc(gl.LEQUAL),gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT))},template:'<canvas id="draw"><div>{{ e_noGL }}</div></canvas>'});var vm=new Vue({el:"#app",data:{newItem:"",todo_data:null,todos:null,componentTypes:[]},compiled:function(){var a=this,b=0;this.todo_data=JSON.parse(localStorage.getItem("todo_data")),this.todos=null!=this.todo_data?this.todo_data:[{text:"Add some todos",data:{}}],this.todos.forEach(function(c){a.componentTypes.push(new ComponentType(c.text,++b))}),console.log(this.componentTypes)},methods:{addComponent:function(){var a=this.newItem.trim();a&&(this.todos.push({text:a,data:{}}),this.newItem="",this.saveStorage())},removeComponent:function(a){this.todos.splice(a,1),this.saveStorage()},addSubList:function(a){var b=this.newItem.trim();if(b){var c=this.todos[a];console.log(c.data),c.data[b]={},c.data[b].type="type",this.todos.splice(a,1),this.todos.push({text:c.text,data:c.data}),this.newItem="",this.saveStorage()}console.log(this.todos)},saveStorage:function(){localStorage.setItem("todo_data",JSON.stringify(this.todos))}}});