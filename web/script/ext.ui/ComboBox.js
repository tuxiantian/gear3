Ext.ns('Ext.ui');
/*
 * @cfg{boolean}selectFirst 是否选中第一行
 */
Ext.ui.ComboBox = function(config) {
	config = Ext.applyAll(this.defaultConfig, config);
	config.store = config.store || new Ext.ui.CommonStore(config.storeConfig || {
		data : []
	});
	Ext.ui.ComboBox.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ui.ComboBox, Ext.form.ComboBox, {
			defaultConfig : {
				typeAhead : true,
				mode : 'local',
				triggerAction : 'all',
				emptyText : '请选择...',
				displayField : 'TEXT',
				valueField : 'ID',
				selectFirst : false,
				selectOnFocus : true
			},
			initComponent : function() {
				Ext.ui.ComboBox.superclass.initComponent.call(this);
				var me = this;
				if (this.mode == 'local') {
					if (this.store.getTotalCount() > 0) {// use local data
						this.on('render', function() {
									me.setDefault(me.store);
								});
					} else {// retrive remote data
						this.store.on('load', this.setDefault, this);
					}
				}
			},
			onRender : function() {
				Ext.ui.ComboBox.superclass.onRender.apply(this, arguments);
				this.el.on("keyup", function(e) {
							if (e.getKey() == Ext.EventObject.BACKSPACE) {
								if (this.getRawValue() == '') {
									this.fireEvent("empty", this);
								}
							}
						}, this);

			},
			setDefault : function(store) {
				if (!this.selectFirst) {
					return;
				}
				if (store.getTotalCount() > 0) {
					var value;
					if (typeof this.value != 'undefined' && this.value != '') {
						value=this.value;
					} else {
						value=store.getAt(0).get(this.valueField);
					}
					this.setValue(value);
					store.un('load', this.setDefault);
					var me=this;
					var record=null;
					store.each(function(r){
						if(r.get(me.valueField)==value){						
							record=r;
						}						
					});	
					this.fireEvent("select",this,record);
				}
			},
			setValue : function(value, text) {
				var arg = arguments;
				if (arg.length == 1) {
					var text = value;
					if (this.valueField) {
						var r = this.findRecord(this.valueField, value);						
						if (r) {
							text = r.data[this.displayField];
							value=r.data[this.valueField]; // fix '' ==0   bug							
						} else if (this.valueNotFoundText !== undefined) {
							text = this.valueNotFoundText;
						}
					}
					this.lastSelectionText = text;
					if (this.hiddenField) {
						this.hiddenField.value = value;
					}
					Ext.form.ComboBox.superclass.setValue.call(this, text);
					this.value = value;
				} else if (arg.length == 2) {
					this.value = value;
					this.setRawValue(text);
					this.lastSelectionText=text;
					if (this.hiddenField) {
						this.hiddenField.value = value;
					}
				}
			},
			reset : function() {
				Ext.ui.ComboBox.superclass.reset.apply(this, arguments);
				this.setDefault(this.store);
			}
		});

Ext.reg('combobox', Ext.ui.ComboBox);
