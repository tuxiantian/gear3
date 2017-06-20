Ext.ns('Ext.ui');
Ext.ui.ComBoPanel = function(config) {
	config = config || {};
	this.maxHeight = config.maxHeight || config.height || this.maxHeight;
	this.store = new Ext.data.SimpleStore({
				fields : [],
				data : [[]]
			});
	this.selectedClass = '';
	this.mode = 'local';
	this.triggerAction = 'all';
	this.onSelect = Ext.emptyFn;
	var displayFields = config.displayFields || this.displayFields || [];
	this.initFieldCache(displayFields);
	Ext.ui.ComBoPanel.superclass.constructor.apply(this, arguments);
	this._version=0;
};

Ext.extend(Ext.ui.ComBoPanel, Ext.form.ComboBox, {
			separator : ',',
			forceSelection : true,
			selectFirstRow:true,
			initEvents : function() {
				Ext.ui.ComBoPanel.superclass.initEvents.apply(this, arguments);
				this.keyNav.tab = false;
			},
			wrapConfig : function(fields, handler) {
				handler = handler || function(config) {
					delete config.display;
				};
				for (var i = 0; i < fields.length; i++) {
					if (this.fieldCache[fields[i].name]) {
						handler(fields[i]);
					}
				}
				return fields;
			},
			initFieldCache : function(displayFields) {
				this.fieldCache = {};
				for (var i = 0; i < displayFields.length; i++) {
					this.fieldCache[displayFields[i]] = true;
				}
			},
			listPanel : {
				xtype : 'panel',
				title : '请初始化 listPanel 属性',
				html : 'listPanel配置可以是任何的Panel 或者panel 的子类'
			},
			initComponent : function() {
				Ext.ui.ComBoPanel.superclass.initComponent.apply(this, arguments);
				this.addEvents('reset');
				this.queryDelay = 500;
			},
			listIsGrid : false,
			initList : function() {
				if (!this.list) {
					var cls = 'x-combo-list';

					this.list = new Ext.Layer({
								shadow : this.shadow,
								cls : [cls, this.listClass].join(' '),
								constrain : false
							});

					var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
					this.list.setWidth(lw);
					this.list.swallowEvent('mousewheel');
					this.assetHeight = 0;

					this.innerList = this.list.createChild({
								cls : cls + '-inner'
							});
					if (!this.listPanel.rendered) {
						Ext.applyIf(this.listPanel, {
									width : lw,
									height : this.maxHeight,
									border : false,
									autoScroll : true,
									onQuery : Ext.emptyFn,
									onRest : Ext.emptyFn
								});
						if (this.listPanel.xtype) {
							this.listPanel = Ext.ComponentMgr.create(this.listPanel, this.listPanel.xtype);
						}
						if (this.listPanel instanceof Ext.grid.GridPanel) {
							this.listIsGrid = true;
						}
						this.listPanel.render(this.innerList);
						this.onlistPanelCreate();

					}
					if (this.resizable) {
						this.resizer = new Ext.Resizable(this.list, {
									pinned : true,
									handles : 'se'
								});
						this.resizer.on('resize', function(r, w, h) {
									this.maxHeight = h - this.handleHeight - this.list.getFrameWidth('tb') - this.assetHeight;
									this.listWidth = w;
									this.innerList.setWidth(w - this.list.getFrameWidth('lr'));
									this.restrictHeight();
								}, this);
					}
				}

			},
			onlistPanelCreate : function() {
				var combo = this;
				this.listPanel.getCombo = function() {
					return combo;
				};
				this.on("reset", this.listPanel.onReset||Ext.emptyFn, this.listPanel);
				this.on("beforequery", this.listPanel.onQuery||Ext.emptyFn, this.listPanel);
				if (this.listIsGrid && this.selectFirstRow) {
					this.listPanel.store.on({
								load : {
									fn : function() {
										this.getSelectionModel().selectFirstRow();
									},
									scope : this.listPanel
								}
							});
				}
			},
			// private
			initEvents : function() {
				Ext.form.ComboBox.superclass.initEvents.call(this);
				this.keyNav = new Ext.KeyNav(this.el, {
							"up" : function(e) {
								this.inKeyMode = true;
								this.selectPrev();
							},
							"down" : function(e) {
								if (!this.isExpanded()) {
									this.onTriggerClick();
								} else {
									this.inKeyMode = true;
									this.selectNext();
								}
							},
							"enter" : function(e) {
								this.onViewClick();
							},
							"esc" : function(e) {
								this.collapse();
							},
							scope : this,
							doRelay : function(foo, bar, hname) {
								if (hname == 'down' || this.scope.isExpanded()) {
									return Ext.KeyNav.prototype.doRelay.apply(this, arguments);
								}
								return true;
							},

							forceKeyDown : true
						});
				this.queryDelay = Math.max(this.queryDelay || 10, this.mode == 'local' ? 10 : 250);
				this.dqTask = new Ext.util.DelayedTask(this.initQuery, this);
				if (this.typeAhead) {
					this.taTask = new Ext.util.DelayedTask(this.onTypeAhead, this);
				}
				if (this.editable !== false && !this.enableKeyEvents) {
					this.el.on("keyup", this.onKeyUp, this);
				}
			},
			onViewClick : function() {
				this.fireEvent("enter", this, this.listPanel);
			},
			selectPrev : function() {
				if (this.listIsGrid) {
					this.listPanel.getSelectionModel().selectPrevious();
					var me = this;
					// fuck ie
					setTimeout(function() {
								me.focus();
							}, 10);
				}
			},
			selectNext : function() {
				if (this.listIsGrid) {
					this.listPanel.getSelectionModel().selectNext();
					var me = this;
					// fuck ie
					setTimeout(function() {
								me.focus();
							}, 10);
				}
			},
			select : Ext.emptyFn,
			beforeBlur : function() {
				if (this.getValue() == '') {
					this.setRawValue('');
				}
			},
			getCurrentVersion:function(){			
			   return this._version;
			},
			increaseVersion:function(){
			    this._version++;			    
			    return this._version;
			   
			},
			setValue : function(value, text,version) {  
				if(Ext.type(version)=='number'){
				    if(version<this.getCurrentVersion()){
				       return;
				    }					
				}				
				var arg = arguments;
				if (arg.length == 1) {
					this.setRawValue(value);
				}
				if (arg.length >= 2) {
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
					return this.getRawValue();
				}
			},
			validateValue : function(value) {
				// console.log(value);
				if (value.length < 1 || value === this.emptyText) { // if it's
					// blank
					if (this.allowBlank) {
						this.clearInvalid();
						return true;
					} else {
						this.markInvalid(this.blankText);
						return false;
					}
				}

				if (this.hiddenName && this.hiddenField) {
					if (this.forceSelection && this.hiddenField.value.length < 1) {
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
			reset : function() {				
			    Ext.ui.ComBoPanel.superclass.reset.apply(this, arguments);				
				this.setRawValue('');
				if (this.hiddenField) {
					this.hiddenField.value = '';
				}
				this.value = '';
				this.fireEvent("reset", this);
			},
			doQuery : function(q, forceAll) {
				if (q === undefined || q === null) {
					q = '';
				}
				var qe = {
					query : q,
					forceAll : forceAll,
					combo : this,
					cancel : false
				};
				q = qe.query;
				forceAll = qe.forceAll;
				if (forceAll === true || (q.length >= this.minChars)) {
					if (this.lastQuery !== q) {
						this.lastQuery = q;
						if (this.fireEvent('beforequery', qe) === false || qe.cancel) {
							return false;
						}
					}
				}
				this.expand();
			}
		});

Ext.reg('combopanel', Ext.ui.ComBoPanel);