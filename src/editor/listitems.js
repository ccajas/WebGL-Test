
/* Section list Item component */

Vue.component('listitem',
{
	props: {
		'level'  : Number,
		'index'  : Number,
		'section': { type: Object },
		'item'   : { type: Object }
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
			return this.item.data && this.item.data.length > 0;
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
		'lv'   : Number,
		'src'  : { type: Array }
	},
	template: '#item-editable',
	data: function()
	{
		return {
			values: [],
			srcValues: [],
			tempValue: '',
			selected: false
		}
	},
	computed: 
	{
		hasSrc: function() 
		{
			var pos = this.lv - 1;
			return this.src && this.src[pos] && this.src[pos].length > 0;
		},

		// Split value to find metadata/item type
		values: function() 
		{
			// Load value from index if source is founc
			if (this.hasSrc 
				&& !isNaN(parseFloat(this.value)) 
				&& isFinite(this.value))
			{
				// Test for decimal numbers only
				return this.src[this.lv - 1][this.value].name.split(' ');
			}

			return this.value.split(' ');
		}
	},
	methods:
	{
		select: function()
		{
			this.selected  = true;
			this.tempValue = this.value;

			// Focus the field
			this.$els.field.style.display = 'inline';
			this.$els.field.focus();
		},

		deselect: function()
		{
			// Return the original value
			this.selected = false;
			this.value    = this.tempValue;

			this.$els.field.style.display = 'none';
		},

		updateCombo: function()
		{
			if (!this.hasSrc) return;

			// Reset found values
			this.srcValues = [];
			var valueNames = [];
			var src = this.src[this.lv - 1];

			for (key in src)
			{
				if (src[key].name.indexOf(this.value) !== -1)
				{
					var name = src[key].name;
					this.srcValues.push({ 'name': name, 'key' : key });
					valueNames.push(name);
				}
			}

			// Update status bar as a hint to matching item names
			this.$dispatch('updateInfo', valueNames.join(', '));
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
				if (this.hasSrc)
				{
					this.value = (this.srcValues.length > 0) ? 
						this.srcValues[0].key : 
						this.tempValue;
				}
				else
					this.value = text.replace(/ +/g, ' ');

				this.tempValue = this.value;
				this.$dispatch('updateName', this.value, this.idx);
			}
		}
	}
});
