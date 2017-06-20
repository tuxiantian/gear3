Ext.ui.ImageField = Ext.extend(Ext.ui.BrowseField, {
	autoCreate : {
		tag : 'SPAN',
		style : 'display:inline-block;vertical-align:middle;'
	},
	triggerClass : 'x-form-pop-trigger x-form-img-pop',
	setValue : function(new_value) {
		this.value = new_value;
		if (this.rendered) {
			if (new_value == undefined || new_value == null) {
				this.img.dom.src = this.defaultUrl||Ext.BLANK_IMAGE_URL;
				this.hiddenField.dom.value = '';
			} else {
				this.img.dom.src = new_value;
				this.hiddenField.dom.value = new_value;
			}
			this.img.on("load", function() {
				this.fireEvent("imgload");
			}, this, {
				single : true
			});
		}
	},
	initComponent : function() {
		Ext.ui.ImageField.superclass.initComponent.apply(this, arguments);
		var me = this;
		this.on("imgload", function() {
			me.trigger.setStyle({
				"top" : (me.el.getHeight() / 2 - me.trigger.getHeight() / 2)
			});
		});
	},
	initValue : function() {
		this.setValue(this.value);
	},
	getValue : function() {
		return this.hiddenField.dom.value;
	},
	getRawValue : function() {
		return this.hiddenField.dom.value;
	},
	onRender : function(ct) {
		Ext.ui.ImageField.superclass.onRender.apply(this, arguments);
		this.hiddenField = ct.createChild({
			tag : 'input',
			type : 'hidden',
			name : this.name
		});
		this.img = this.el.createChild({
			tag : 'img',
			src : Ext.BLANK_IMAGE_URL,
			height:this.imgHeight||50,
			style : 'border:1px solid #cfcfcf;'
		});
		this.img.on("load", function() {
			this.fireEvent("imgload");
		}, this, {
			single : true
		})
	},
	setImgWidth : function(w) {
		if (w) {
			this.img.setWidth(w);
		}
	},
	setWidth : function(w) {
		this.setImgWidth(w);
		Ext.ui.ImageField.superclass.setWidth.apply(this, arguments);

	},

	setSize : function(w, h) {
		// support for standard size objects
		if (typeof w == 'object') {
			h = w.height;
			w = w.width;
		}
		Ext.ui.ImageField.superclass.setSize.apply(this, arguments);
		this.setImgWidth(w);

	}

});

Ext.reg('imagefield', Ext.ui.ImageField);
