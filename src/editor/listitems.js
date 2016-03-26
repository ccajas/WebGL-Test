
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
		},

		error: function(value)
		{
			console.log('broadcasting '+ value)
			if (this.item.name == value)
				console.log('dispatched error to '+ value);
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
			return this.lv > 1 && this.src && this.src.length > 0;
		},

		// Split value to find metadata/item type
		values: function() 
		{
			// Load value from index if source is found
			if (this.hasSrc 
				&& !isNaN(parseFloat(this.value)) 
				&& isFinite(this.value))
			{
				// Test for decimal numbers only
				return this.src[this.value].name.split(' ');
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

		updateSrc: function()
		{
			if (!this.hasSrc) return;

			// Reset found values
			this.srcValues = [];
			var valueNames = [];

			for (key in this.src)
			{
				var match = this.value.toLowerCase();

				if (this.src[key].name.toLowerCase().indexOf(match) !== -1)
				{
					var name = this.src[key].name;
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
					var key = this.srcValues[0].key;
					this.value = (this.srcValues.length > 0) ? 
						this.srcValues[0].key : 
						this.tempValue;
					
					// Add source data recursively
					var src = this.src[this.lv - 1];
					this.$dispatch('updateSrcData', src[key]);
				}
				else
					this.value = text.replace(/ +/g, ' ');

				this.tempValue = this.value;
				this.$dispatch('updateName', this.value);
			}
		}
	}
});
