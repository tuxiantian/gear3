(function() {
	var _onRender = Ext.form.Field.prototype.onRender;
	var _onResize = Ext.form.Field.prototype.onResize;
	var _reset = Ext.form.Field.prototype.reset;
	var _onDestroy = Ext.form.Field.prototype.onDestroy;
	var _onDisable = Ext.form.Field.prototype.onDisable;
	var _onEnable = Ext.form.Field.prototype.onEnable;

	var _initComponent = Ext.form.Field.prototype.initComponent;

	var isNullOrUndefined = function(obj) {
		return (typeof obj == 'undefined' || obj == null);
	};
	var isFunction = function(f) {
		return typeof f == 'function';
	};
	
	 function toggleReadOnlyStyle ( ) {				  
			if (this.rendered) {		
				var value=this.readOnly===true;
				if (!isNullOrUndefined(this.readOnly)) {
					var el = this.getEl();
					el.dom.setAttribute('readOnly', value);
					el.dom.readOnly = value;
					var label = el.up('.x-form-item');
					if (label) {
						label = label.down('.x-form-item-label');
					}
					if (label) {
						// backup the old style
						this._readOnlyBackGroundColor=this._readOnlyBackGroundColor||el.getStyle("background-color");
						this._readOnlyBackGroundImage=this._readOnlyBackGroundImage||el.getStyle("background-image");					
						if (value) {
							label.applyStyles(this.defaultLabelIfReadOnlyStyle);
						} else {
							this.removeStyleByString(label, this.defaultLabelIfReadOnlyStyle);
							label.applyStyles(this.lastLabelStyle);
						}
					}		
					
					if (value) {					
						el.setStyle("background-color",this.readOnlyBackGroundColor||this._readOnlyBackGroundColor);							
						el.setStyle("background-image","none");
					} else {
						if(this._readOnlyBackGroundColor){
							el.setStyle("background-color",this._readOnlyBackGroundColor);
						}
						if(this._readOnlyBackGroundImage){
							el.setStyle("background-image",this._readOnlyBackGroundImage);
						}
					}
				}
			}
	}
	Ext.override(Ext.form.Field, {
		getForm : function() {
			var form;
			if (this.ownerCt) {
				this.ownerCt.bubble(function(container) {
					if (container.form) {
						form = container.form;
						return false;
					}
				}, this);
			}
			return form;
		},
		removeStyleByString : function(el, removeCssText) {
			var oldMap = this.cssTextToMap(el.dom.style.cssText.toUpperCase());
			var removeMap = this.cssTextToMap(removeCssText.toUpperCase());
			for (var p in removeMap) {
				delete oldMap[p];
			}
			var newCssText = '';
			for (p in oldMap) {
				newCssText = newCssText + p + ':' + oldMap[p] + ';';
			}
			el.dom.style.cssText = newCssText;

		},
		readOnlyBackGroundColor :  '#e0e0e0',
		cssTextToMap : function(cssText) {
			var re = /\s?([a-z\-]*)\:\s?([^;]*);?/gi;
			var matches;
			var map = {};
			while ((matches = re.exec(cssText)) != null) {
				map[matches[1]] = matches[2];
			}
			return map;
		},
		setReadOnly : function(value) {
			this.readOnly = value;
			toggleReadOnlyStyle.call(this);			
		},
		disableTrigger : function() {
			this.setTriggerDisable(true);
		},
		enableTrigger : function() {
			this.setTriggerDisable(false);
		},
		setTriggerDisable : function(triggerDisabled) {
			this.triggerDisabled = triggerDisabled;
		},
		initInterceptTrigger : function() {
			var f = this;
			if (isFunction(f.expand))
				f.expand = f.expand.createInterceptor(function() {
					return !f.triggerDisabled;
				});
			if (isFunction(f.onTriggerClick))
				f.onTriggerClick = f.onTriggerClick.createInterceptor(function() {
					return !f.triggerDisabled;
				});
			if (isFunction(f.onClick))
				f.onClick = f.onClick.createInterceptor(function() {
					if (f.triggerDisabled) {
						this.el.dom.checked = f.checked;
					}
					return !f.triggerDisabled;
				});
			if (isFunction(f.setValue) && f instanceof Ext.form.Checkbox)
				f.setValue = f.setValue.createInterceptor(function() {
					return !f.triggerDisabled;
				});
		},
		initComponent : function() {
			_initComponent.apply(this, arguments);
			this.decorateTheLabelIfReadOnly();
			this.decorateTheLabelIfNotAllowBlank();
			this.on("render",function(){				
				toggleReadOnlyStyle.call(this);				
			});
		},
		onRender : function(ct, position) {
			_onRender.apply(this, arguments);
			// create the appended fields
			var ac = this.appenders || [];
			this.appenders = ac;
			var me=this;
			if (ac.length > 0) {
				var form = me.getForm();
				// create a wrap for all the fields including the one created
				// above
				me.wrap = me.el.wrap({
					tag : 'div'
				});
				// also, wrap the field create above with the same div as the
				// appending fields
				me.el.wrap({
					tag : 'div',
					style : 'float: left;'
				});
				for (var i = 0, len = ac.length; i < len; i++) {
					// if the append field has append fields, delete this
					delete ac[i].appenders;
					// create a div wrapper with the new field within it.
					var cell = me.wrap.createChild({
						tag : 'div',
						style : 'float: left;'
					});
					var field = new Ext.ComponentMgr.create(ac[i], 'button');
					ac[i] = field;
					field.parentCell = cell;
					field.master = me;
					// render the field
					field.render(cell);
					if (form && field.isFormField) {
						form.items.add(field);
					}
				}

				if (ac.length) {
					me.wrap.createChild({
						tag : 'div',
						cls : 'x-form-clear'
					});
				}
			}
			// 等待子孙组建把tag 初始化好
			setTimeout(function(){				
				// 添加删除×
				if (me.enableSearch) {
					var input = me.el.hasClass('x-form-field') ? me.el : me.el.select('.x-form-field', true);
					if (input) {
						var div = input.wrap({
							tag : 'span',
							cls : 'x-form-field-wrap',
							style : 'position: relative;display:inline-block;'
						});
						var cross = div.createChild({
							tag : 'span',
							style : "position:absolute;top:0;right:0;display:none;",
							html : '<img class="x-form-trigger x-form-clear-trigger " src="' + Ext.BLANK_IMAGE_URL + '">'
						});
						var img = cross.first();
						img.addClassOnOver('x-form-trigger-over');
						img.addClassOnClick('x-form-trigger-click');
						me.cross = cross;
						me.cross.on("click", me.onCrossClick, me);

						me.on('specialkey', function(f, e) {
							if (e.getKey() == e.ENTER) {
								me.onEnterKey();
							}
						}, me);
					}
				}				
				
			},1);


			if (this.qtip) {
				if (this.wrap) {
					this.wrap.set({
						qtip : this.qtip
					});
				}
				if (this.el) {
					this.el.set({
						qtip : this.qtip
					});
				}
			}
			this.initInterceptTrigger();
			if(this.readOnly===true){
			   this.setReadOnly(true);
			}
		},
		// bold the fieldLabel if allowBlank=false setted
		defaultLabelIfNotAllowBlankStyle : '',
		decorateTheLabelIfNotAllowBlank : function() {
			if (this.allowBlank === false && Ext.isBlank(this.labelStyle)) {
				this.labelStyle = this.defaultLabelIfNotAllowBlankStyle;
				this.fieldLabel = this.fieldLabel + '<span style="color:#D30B0A;">*</span>';
			}
		},
		defaultLabelIfReadOnlyStyle : '',
		decorateTheLabelIfReadOnly : function() {
			this.lastLabelStyle = this.labelStyle;
			if (this.readOnly === true) {
				this.labelStyle = this.defaultLabelIfReadOnlyStyle;
			}
		},
		onCrossClick : function() {
			this.reset();
			this.fireEvent("search", false, this);
			this.hideCross();
		},
		onEnterKey : function() {
			var v = this.getRawValue();
			if (v.length < 1) {
				this.onCrossClick();
				return;
			}
			this.showCross();
			this.fireEvent("search", true, this);
		},
		showCross : function() {
			this.cross.show();
			if (this instanceof Ext.form.TriggerField) {
				// if subclass already has a trriger move 17px to the left
				this.cross.setStyle("right", 17);
			}
		},
		hideCross : function() {
			this.cross.hide();
		},
		hasAppender : function() {
			return this.appenders && this.appenders.length > 0;
		},
		eachAppender : function(fn) {
			if (this.hasAppender()) {
				Ext.each(this.appenders, fn);
			}
		},
		reset : function() {
			_reset.apply(this, arguments);
		},
		// private
		onResize : function(w, h) {
			_onResize.call(this, w, h);
			if (this.hasAppender()) {
				this.wrap.setWidth(w);
				var appenderLen = 0;
				this.eachAppender(function(item) {
					appenderLen = appenderLen + item.parentCell.getWidth();
				});
				var w = this.wrap.getWidth() - appenderLen;
				w = w < 20 ? 20 : w;// in case miniWidth
				this.el.setWidth(w);
			}
		},
		// private
		onDestroy : function() {
			_onDestroy.apply(this, arguments);
			this.eachAppender(function(item) {
				Ext.destroy(item);
			});
			if (this.hasAppender()) {
				Ext.destroy(this.wrap);
			}
		},
		onDisable : function() {
			_onDisable.apply(this, arguments);
			this.eachAppender(function(item) {
				item.disable();
			});
		},

		onEnable : function() {
			_onEnable.apply(this, arguments);
			this.eachAppender(function(item) {
				item.enable();
			});

		}
	});
	// convenient form FromPanel

	Ext.form.FormPanel.prototype.setReadOnly = function(value) {
		this.cascade(function(c) {
			if (c.isFormField) {
				c.setReadOnly(value);
				c.setTriggerDisable(true);
			}
			if (c instanceof Ext.Panel) {
				var top = c.getTopToolbar();
				var bottom = c.getBottomToolbar();
				if (top) {
					top.setDisabled(value);
				}
				if (bottom) {
					bottom.setDisabled(value);
				}
			}
		});
	};

	Ext.override(Ext.form.HtmlEditor, {
		setReadOnly : function(readOnly) {
			if (readOnly) {
				this.syncValue();
				var roMask = this.wrap.mask();
				roMask.dom.style.filter = "alpha(opacity=0);"; // IE
				roMask.dom.style.opacity = "0"; // Mozilla
				roMask.dom.style.background = "white";
				roMask.dom.style.overflow = "scroll";
				this.el.dom.readOnly = true;
			} else {
				if (this.rendered) {
					this.wrap.unmask();
				}
				this.el.dom.readOnly = false;
			}
		}
	});

})();
