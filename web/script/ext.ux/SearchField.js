Ext.form.SearchField = Ext.extend(Ext.form.TriggerField, {
	triggerClass : 'x-form-search-trigger',
	hiddenName : null,
	defaultAutoCreate : {tag: "input", type: "text", size: "16", autocomplete: "off"},
	onRender : function(ct, position) {
		Ext.form.SearchField.superclass.onRender.call(this, ct, position);
		if (this.hiddenName) {
			this.hiddenField = this.el.insertSibling( {
				tag : 'input',
				type : 'hidden',
				name : this.hiddenName,
				id : (this.hiddenId || this.hiddenName)
			}, 'before', true);
			this.hiddenField.value = this.hiddenValue !== undefined
					? this.hiddenValue
					: this.value !== undefined ? this.value : '';
			this.el.dom.removeAttribute('name');		
		}
		if(Ext.isGecko){   
            this.el.dom.setAttribute('autocomplete', 'off');   
        }  
	},
	onTriggerClick : function() {
		if (!this.win) {
			var win = UI.getPersonSelect( {
				title : '选人',
				width : 800,
				height : 400,
				groupType : ['Hr', 'My', 'Gp']
			});
			win.on('submit', function(record) {
				var hiddenValue=[],displayValue=[];
				if (record.length > 0) {
					for (var i = 0;i < record.length; i++) {
						hiddenValue.push(record[i].get('ID'));
						displayValue.push(record[i].get('USERNAME'));
					}
					if(this.hiddenField){
						this.hiddenField.value=hiddenValue.join(",");
					}
					this.setValue(displayValue.join(","));
					return true;
				} else {
					alert('对不起,请至少选择一条记录!');
					return false;
				}
			},this);
			this.win = win;
		}
		this.win.show();
	}
});
Ext.reg('searchfield', Ext.form.SearchField);