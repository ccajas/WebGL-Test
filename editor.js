/*! WebGL_test - ver. 0.1.0 */
Vue.config.debug=!1,Vue.component("viewport",{data:function(){return{componentTypes:this.$parent.componentTypes,systems:this.$parent.systems}},compiled:function(){console.log("Viewport loaded");var a=this.$el,b=[];new SystemManager(b);b.length<1&&console.log("No component lists found!");new App(a)},template:'<canvas id="draw"><div>{{ e_noGL }}</div></canvas>'}),Vue.component("editable",{props:["textContent"],data:function(){return{textModified:"",viewable:!1}},methods:{keyEdit:function(a){this.textModified=a.target.innerText,9==a.keyCode&&(document.execCommand("styleWithCSS",!1,null),document.execCommand("indent",!0,null),a.preventDefault())},save:function(){this.textModified.trim()&&this.$dispatch("saveCode",this.textModified)}},watch:{textContent:function(){this.textModified=this.textContent,this.viewable=""!=this.textContent,Prism.highlightAll()}}}),Vue.component("detailview",{props:["item","name"],data:function(){return{itemFull:""}},methods:{deleteItem:function(a){console.log(a,this.item.data),this.item.data=[],console.log(a,this.item),this.$dispatch("saveItem",a,this.item)}},watch:{item:function(){this.itemFull=JSON.stringify(this.item)}}}),Vue.component("listitem",{props:{level:Number,index:Number,item:{type:Object},icon:String},template:"#listitem-template",data:function(){return{selected:!1}},computed:{hasData:function(){return this.item.data&&this.item.data.length>0}},events:{removeDataItem:function(a){console.log("remove item",a),this.item.data.splice(a,1)}},methods:{addSub:function(){console.log(this.item),this.item.data=this.item.data||[],this.item.data.push({name:"NewItem",meta:"type",data:[]})},remove:function(){this.hasData||this.$dispatch("removeDataItem",this.index)}}}),Vue.component("item",{props:["value","meta"],template:"#item-editable",data:function(){return{selected:!1}},methods:{select:function(){this.selected=!0,this.$els.field.style.display="inline",this.$els.field.focus()},deselect:function(){this.selected=!1,this.$els.field.style.display="none"},update:function(a){this.selected=!1,this.$els.field.style.display="none",console.log("updated item "+a,this.item)}}});var vm=new Vue({el:"#app",data:{newItem:"",component_data:null,system_data:null,editorText:"Add your text here!",currIndex:-1,componentTypes:[],systems:[],section:"",sections:[{text:"Component",icon:"&#xf01c;",color:"#fb0"},{text:"System",icon:"&#xf04e;",color:"#bf7"},{text:"EntityTemplate",icon:"&#xf020;",color:"#7ff"},{text:"ScreenElement",icon:"&#xf11e;",color:"#0bf"}],selectedName:"",sectionData:{name:"",meta:"",data:[]}},compiled:function(){var a=this;this.section=this.sections[0],this.component_data=JSON.parse(localStorage.getItem("component_data"))||{name:"Components",data:[]},this.system_data=JSON.parse(localStorage.getItem("system_data"))||{name:"Systems",data:[]},this.sectionData=this[this.section.text.toLowerCase()+"_data"],this.component_data.forEach(function(b){a.componentTypes.push(new ComponentType(b.text,b.type))})},events:{addSubItem:function(a){var b=this.sectionData[a];b.type;b.data.push({newItem:"type"}),this.saveStorage(this.sectionData)},removeItem:function(a){this.sectionData.splice(a,1),this.saveStorage(this.sectionData)},saveItem:function(a,b){this.sectionData[b]=a,this.saveStorage(this.sectionData)},saveCode:function(a){var b;try{b=JSON.parse(a)}catch(c){return console.error("Invalid JSON data:",c),!1}console.log("saving code to index "+this.currIndex,b),console.log(this.sectionData[this.currIndex]),this.sectionData[this.currIndex]=b,this.saveStorage(this.sectionData)}},methods:{setView:function(a){a.text!=this.section.text&&(this.editorText=""),this.section=a,this.sectionData=this[a.text.toLowerCase()+"_data"]},addItem:function(){var a=this.newItem.trim();if(a){var b=this.sectionData.length+1;this.sectionData.data.push({name:a,type:b,data:[]}),this.newItem="",this.saveStorage(this.sectionData)}},saveStorage:function(a){var b=this.section.text.toLowerCase()+"_data";localStorage.setItem(b,JSON.stringify(a))}}});