
/* Section list Item component */

Vue.component('listitem',
{
	props: {
		'level'  : Number,
		'index'  : Number,
		'section': { type: Object },
		'item'   : { type: Object },
		'src'    : Array
	},

	template: '#listitem-template',
	data: function()
	{
		return {
			hover: false,
			open: true,
			selected: false
		}
	},
	computed: 
	{
		hasData: function () 
		{
			var hasData = this.item.data && this.item.data.length > 0;		
			//if (!hasData && this.level > 1) this.section.icon = '&#xf0ab;';

			return hasData;
		}
	},
	events:
	{
		removeDataItem: function (index)
		{
			this.item.data.splice(index, 1);
		},

		updateName: function(value, index)
		{
			this.item.name = value;
			this.$dispatch('saveStorage');
		}
	},
	methods:
	{
		info: function()
		{
			this.$dispatch('updateInfo', this.item.name);
		},

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

Vue.component('editable', 
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
			tempValue: '',
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
			this.selected  = true;
			this.tempValue = this.value;

			if (!this.hasSrc)
			{
				this.$els.field.style.display = 'inline';
				this.$els.field.focus();
			}
		},

		deselect: function()
		{
			// Return the original value
			this.selected = false;
			this.value    = this.tempValue;

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
			var text = this.value.trim();

			// Only update if text isn't left blank
			if (text)
			{
				this.value = text.replace(/ +/g, ' ');
				this.tempValue = this.value;
				this.$dispatch('updateName', this.value, this.idx);
			}
		}
	}
});
