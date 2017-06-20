Ext.ui.ImageUploadField = Ext.extend(Ext.form.TextField, {
	autoCreate : {
		cls : 'x-form-field-wrap x-form-file-wrap',
		style : 'position:relative;height:auto;'
	},
	setValue : function(new_value) {
		this.value = new_value;
		if (this.rendered) {
			if (new_value == undefined || new_value == null) {
				this.img.dom.src = this.defaultUrl || Ext.BLANK_IMAGE_URL;
			} else {
				this.img.dom.src = new_value;
			}
			this.img.on("load", function() {
				this.fireEvent("imgload");
			}, this, {
				single : true
			});
		}
	},
	initComponent : function() {
		Ext.ui.ImageUploadField.superclass.initComponent.apply(this, arguments);
		var me = this;
		this.on("imgload", function() {
			this.reAlign();
		});
	},
	initValue : function() {
		this.setValue(this.value);
	},
	getValue : function() {
		return this.value||this.fileField.dom.value;
	},
	getRawValue : function() {
		return this.value||this.fileField.dom.value;
	},

	reAlign : function() {
		this.button.el.anchorTo(this.el, "r-r");
		this.fileField.anchorTo(this.el, "r-r");
	},
	onRender : function(ct) {
		Ext.ui.ImageUploadField.superclass.onRender.apply(this, arguments);
		this.img = this.el.createChild({
			tag : 'img',
			src : Ext.BLANK_IMAGE_URL,
			height : this.imgHeight || 50,
			style : 'border:1px solid #cfcfcf;'
		});
		this.img.on("load", function() {
			this.fireEvent("imgload");
		}, this, {
			single : true
		});

		this.fileField = this.el.createChild({
			tag : 'input',
			type : 'file',
			style : 'position: absolute;right: 0;-moz-opacity: 0;filter:alpha(opacity: 0);opacity: 0;z-index: 2;z-index:999;',
			name : this.name
		});
		var btnCfg = this.buttonConfig || {};
		this.button = new Ext.Button(Ext.apply(btnCfg, {
			renderTo : this.el,
			text : btnCfg.text || '浏览',
			cls : 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
		}));
		this.button.el.setStyle("position", "absolute");
		this.reAlign();
		this.fileField.on({
			scope : this,
			change : function() {
				this.setValue(this.getFileFieldValue());
				this.fireEvent('fileselected', this, this.getFileFieldValue());
			}
		});

	},
	// 得到浏览器版本
	getOs : function() {
		var OsObject = "";
		if (navigator.userAgent.indexOf("MSIE") > 0) {
			return "MSIE";
		}
		if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
			return "Firefox";
		}
		if (isSafari = navigator.userAgent.indexOf("Safari") > 0) {
			return "Safari";
		}
		if (isCamino = navigator.userAgent.indexOf("Camino") > 0) {
			return "Camino";
		}
		if (isMozilla = navigator.userAgent.indexOf("Gecko/") > 0) {
			return "Gecko";
		}
	},

	getFileFieldValue : function() {
		// IE浏览器获取图片路径
	    function getImgUrlByMSIE(fileid) {
			return document.getElementById(fileid).value;
		}
		// 非IE浏览器获取图片路径
		function getImgUrlByUnMSIE(fileid) {
			var f = document.getElementById(fileid).files[0];
			return window.URL.createObjectURL(f);
		}
		var imgsrc = "";
		var fid = this.fileField.id;
		if ("MSIE" == this.getOs()) {
			imgsrc = getImgUrlByMSIE(fid);
		} else {
			imgsrc = getImgUrlByUnMSIE(fid);
		}
		return imgsrc;
	},
	setImgWidth : function(w) {
		if (w) {
			this.img.setWidth(w);
		}
	},
	setWidth : function(w) {
		this.setImgWidth(w);
		Ext.ui.ImageUploadField.superclass.setWidth.apply(this, arguments);
	},

	setSize : function(w, h) {
		// support for standard size objects
		if (typeof w == 'object') {
			h = w.height;
			w = w.width;
		}
		Ext.ui.ImageUploadField.superclass.setSize.apply(this, arguments);
		this.reAlign();
		this.setImgWidth(w);
	}

});

Ext.reg('imageuploadfield', Ext.ui.ImageUploadField);
