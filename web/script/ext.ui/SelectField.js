Ext.ns('Ext.ui');
Ext.ui.SelectField = Ext.extend(Ext.form.TwinTriggerField, {
	initComponent : function() {
		Ext.ui.SelectField.superclass.initComponent.call(this);
		var me = this;
		this.on('specialkey', function(f, e) {
			if (e.getKey() == e.ENTER) {
				this.onTrigger2Click();
				if (me.stopEnterPropagation === true) {
					e.stopEvent();
				}
			}
		}, this);
		this.addEvents("pop");
	},
	stopEnterPropagation : false,// use for editor model
	validationEvent : false,
	validateOnBlur : false,
	trigger1Class : 'x-form-clear-trigger',
	trigger2Class : 'x-form-search-trigger',
	hideTrigger1 : true,
	onTrigger1Click : function() {
		this.setValue('', '');
		this.triggers[0].hide();
	},
	onTrigger2Click : function() {
		var v = this.getRawValue();
		if (v.length > 1) {
			this.triggers[0].show();
		}
		this.fireEvent("pop", this, this);
	},
	// private
	onRender : function(ct, position) {
		Ext.ui.SelectField.superclass.onRender.call(this, ct, position);
		if (this.hiddenName) {
			this.hiddenField = this.el.insertSibling({
				tag : 'input',
				type : 'hidden',
				name : this.hiddenName,
				id : (this.hiddenId || this.hiddenName)
			}, 'before', true);
			// prevent input submission
			this.el.dom.removeAttribute('name');
		}
	},
	setValue : function(value, text) {
		var arg = arguments;
		if (arg.length == 1) {
			this.setRawValue(value);
		}
		if (arg.length == 2) {
			this.setRawValue(text);
		}
		if (this.hiddenField) {
			this.hiddenField.value = value;
		}
		this.value = value;
	},
	getValue : function() {
		if (Ext.isNotBlank(this.value)) {
			return this.value + '';
		} else {
			return this.getRawValue() || '';
		}
	},
	validateValue : function(value) {
		//console.log(value);
		if (value.length < 1 || value === this.emptyText) { // if it's blank
			if (this.allowBlank) {
				this.clearInvalid();
				return true;
			} else {
				this.markInvalid(this.blankText);
				return false;
			}
		}

		if (this.hiddenName) {
			if (this.hiddenField.value.length < 1) {
				this.markInvalid("你没选中任何值!");
				return false;
			}
		}

		if (value.length < this.minLength) {
			this.markInvalid(String.format(this.minLengthText, this.minLength));
			return false;
		}
		if (value.length > this.maxLength) {
			this.markInvalid(String.format(this.maxLengthText, this.maxLength));
			return false;
		}
		if (this.vtype) {
			var vt = Ext.form.VTypes;
			if (!vt[this.vtype](value, this)) {
				this.markInvalid(this.vtypeText || vt[this.vtype + 'Text']);
				return false;
			}
		}
		if (typeof this.validator == "function") {
			var msg = this.validator(value);
			if (msg !== true) {
				this.markInvalid(msg);
				return false;
			}
		}
		if (this.regex && !this.regex.test(value)) {
			this.markInvalid(this.regexText);
			return false;
		}
		return true;
	},
	validateBlur : function(e) {
		return this.validateValue(this.getValue());
	}
});

Ext.reg('selectfield', Ext.ui.SelectField);