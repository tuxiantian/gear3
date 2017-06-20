Ext.ns('Ext.ui');
Ext.ui.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
	initComponent : function() {
		Ext.ui.SearchField.superclass.initComponent.call(this);
		var me = this;
		this.on('specialkey', function(f, e) {
			if (e.getKey() == e.ENTER) {
				this.onTrigger2Click();
				if (me.stopEnterPropagation === true) {
					e.stopEvent();
				}
			}
		}, this);
		this.addEvents("search");
	},
	stopEnterPropagation : false,// use for editor model
	validationEvent : false,
	validateOnBlur : false,
	trigger1Class : 'x-form-clear-trigger',
	trigger2Class : 'x-form-search-trigger',
	hideTrigger1 : true,
	hasSearch : false,
	paramName : 'query',
	defaultParams : {
		start : 0,
		limit : 10
	},
	onTrigger1Click : function() {
		if (this.hasSearch) {
			this.el.dom.value = '';
			this.triggers[0].hide();
			this.hasSearch = false;
			this.fireEvent("search", this.hasSearch, this);
			/*
			 * this.store.baseParams = this.store.baseParams || {};
			 * this.store.baseParams[this.paramName] = '';
			 * this.store.reload({params:this.defaultParams});
			 */

		}
	},
	onTrigger2Click : function() {
		var v = this.getRawValue();
		if (v.length < 1) {
			this.onTrigger1Click();
			return;
		}
		this.hasSearch = true;
		this.triggers[0].show();
		this.fireEvent("search", this.hasSearch, this);
		/*
		 * this.store.baseParams = this.store.baseParams || {};
		 * this.store.baseParams[this.paramName] = v;
		 * this.store.reload({params:this.defaultParams});
		 */

	},getValue:function(){		
		 return new String(Ext.ui.SearchField.superclass.getValue.apply(this,arguments)).trim();
	}
});
Ext.reg('searchfield', Ext.ui.SearchField);