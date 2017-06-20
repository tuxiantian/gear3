Ext.layout.ColumnFieldLayout = Ext.extend(Ext.layout.ContainerLayout, {
			// private
			monitorResize : true,

			/**
			 * @cfg {String} extraCls An optional extra CSS class that will be
			 *      added to the container (defaults to 'x-column'). This can be
			 *      useful for adding customized styles to the container or any
			 *      of its children using standard CSS rules.
			 */
			extraCls : '',

			scrollOffset : 0,

			// private
			isValidParent : function(c, target) {
				return true;
			},

			fieldAdjustWidth : function(tag, w) {
				return w;
			},
			// private
			renderItem : function(c, position, target) {
				if (c && !c.rendered) {
					var pos = target.dom.childNodes[position];
					c._wrapper = target.createChild({
								tag : "div",
								style : 'text-align:center;',
								cls : 'x-column'
							}).insertBefore(pos);
				}
				if (c instanceof Ext.form.Field) {
					c.adjustWidth = this.fieldAdjustWidth;
				}
				if (c instanceof Ext.form.Hidden) {
					c.width = 0;
					Ext.layout.ColumnFieldLayout.superclass.renderItem.call(this, c, position, target);
				} else {
					Ext.layout.ColumnFieldLayout.superclass.renderItem.call(this, c, 0, c._wrapper);
				}
				// store some layout-specific calculations
				c.columnFit = {
					hasAbsWidth : false, // whether the component has
					// absolute height
					// (in pixels)
					relWidth : 0, // relative height, in pixels (if
					// applicable)
					calcRelWidth : 0, // calculated relative height (used when
					// element
					// is resized)
					calcAbsWidth : 0
					// calculated absolute height
				};
				// handle the button

				if (c instanceof Ext.Button) {
					c.width = c.getEl().getWidth();
				}

				// process height config option
				if (typeof c.width == 'number') {
					// set absolute height
					if (c.setWidth) {
						c.setWidth(c.width - c.getEl().getMargins('lr'));
					}
					c.columnFit.hasAbsWidth = true;

				} else if (typeof c.width == "string" && c.width.indexOf("%")) {
					// store relative (given in percent) height
					c.columnFit.relWidth = parseInt(c.width);
				}
			},

			// private
			onLayout : function(ct, target) {
				var cs = ct.items.items, len = cs.length, c, i, maxHeight = 0;

				if (!this.innerCt) {
					target.addClass('x-column-layout-ct');

					// the innerCt prevents wrapping and shuffling while
					// the container is resizing
					this.innerCt = target.createChild({
								cls : 'x-column-inner',
								style : 'zoom:1;'
							});
					this.innerCt.createChild({
								cls : 'x-clear'
							});
				}
				var size = Ext.isIE && target.dom != Ext.getBody().dom ? target.getStyleSize() : target.getViewSize();
				this.renderAll(ct, this.innerCt);

				if (size.width < 1 && size.height < 1) { // display none?
					return;
				}
				var w = size.width - target.getPadding('lr') - this.scrollOffset, h = size.height - target.getPadding('tb'), pw = w;

				this.innerCt.setWidth(w);
				// some columns can be percentages while others are fixed
				// so we need to make 2 passes
				var noWidthCount = 0, relWidthSum = 0, percentage = 100;
				for (i = 0; i < len; i++) {
					c = cs[i];
					if (c.columnFit.hasAbsWidth) {
						pw -= ((c.getSize ? c.getSize().width : c.getEl().getWidth()) + c.getEl().getMargins('lr'));
					} else {
						if (!c.columnFit.relWidth) {
							noWidthCount++;
						}
					}
				}
				pw = pw < 0 ? 0 : pw;

				// sum the reWidth
				for (i = 0; i < len; i++) {
					c = cs[i];
					if (c.columnFit.relWidth) {
						relWidthSum += c.columnFit.relWidth;
					}

					// count maxHeight
					maxHeight = Math.max(c.getSize ? c.getSize().height : 0, maxHeight);
				}

				// alert(maxHeight);
				// juge percentage great then 100% if so
				if (relWidthSum > percentage) {
					percentage = relWidthSum;
				}
				// count rest width
				var freeWidth = pw - Math.floor(relWidthSum / percentage * pw);

				for (i = 0; i < len; i++) {
					c = cs[i];
					if (!c.columnFit.hasAbsWidth) {
						if (c.columnFit.relWidth) {
							c.setSize(Math.floor(c.columnFit.relWidth / percentage * pw) - c.getEl().getMargins('lr'), undefined);
						} else {
							if (freeWidth) {
								c.setSize(Math.floor(freeWidth / noWidthCount) - c.getEl().getMargins('lr'), undefined);
							}
						}
					} else {
						// c.setSize(undefined, h);
					}
					if (c._wrapper && c._wrapper.getHeight() < maxHeight) {
						// c._wrapper.setHeight(maxHeight);
					}

				}

			}

		});

Ext.Container.LAYOUTS['columnfield'] = Ext.layout.ColumnFieldLayout;

Ext.ns("Ext.ui");
Ext.ui.Spacer = Ext.extend(Ext.BoxComponent, {
			autoEl : {
				tag : 'div',
				html : '&nbsp;'
			},
			width : 3
		});

Ext.reg('spacer', Ext.ui.Spacer);
Ext.ui.ColumnField = Ext.extend(Ext.Container, {
			isFormField : true,
			autoEl : {
				tag : "div",
				'cls' : 'x-form-field',
				style : '_zoom:1;'
			},
			// private
			adjustSize : function(w, h) {
				var s = Ext.form.Field.superclass.adjustSize.call(this, w, h);
				s.width = this.adjustWidth(this.el.dom.tagName, s.width);
				return s;
			},
			// 3px bug for ie
			adjustWidth : function(tag, w) {
				if (typeof w == 'number' && !Ext.isWebKit) {
					if (Ext.isIE) {
						if (!Ext.isStrict) {
							return w - 3;
						}
						if (Ext.isStrict) {
							return w - (Ext.isIE6 ? 4 : 1);
						}

					}
				}
				return w;
			},
			layout : 'columnfield',
			isValid : function() {
				var valid = true;
				this.items.each(function(f) {
							if (!f.validate()) {
								valid = false;
							}
						});
				return valid;
			},
			validate : function() {
				var valid = true;
				this.items.each(function(f) {
							if (f.isFormField && !f.validate()) {
								valid = false;
							}
						});
				return valid;
			},
			reset : function() {
				this.items.each(function(f) {
							if (f.reset) {
								f.reset();
							}
						});
			},
			findField : function(id) {
				var field = this.items.get(id);
				if (!(field && typeof field == 'object')) {
					this.items.each(function(f) {
								if (f.isFormField && (f.dataIndex == id || f.id == id || f.getName() == id)) {
									field = f;
									return false;
								}
							});
				}
				return field;
			},
			disable : function() {
				this.items.each(function(f) {
							f.disable();
						});

			},
			enable : function() {
				this.items.each(function(f) {
							f.enable();
						});
			}
		});

Ext.reg('columnfield', Ext.ui.ColumnField);
