

Ext.PopTree = Ext.extend(Ext.Component, {
		hideEl : false,
		swallowKeys : true,
		/**
		 * @cfg {Ext.form.Field} tree
		 * The Field object (or descendant) or config object for tree
		 */
		/**
		 * @cfg {Boolean} allowBlur
		 * True to {@link #completeEdit complete the editing process} if in edit mode when the
		 * tree is blurred. Defaults to <tt>true</tt>.
		 */
		allowBlur : true,
		/**
		 * @cfg {Boolean/String} autoSize
		 * True for the editor to automatically adopt the size of the underlying tree, "width" to adopt the width only,
		 * or "height" to adopt the height only, "none" to always use the tree dimensions. (defaults to false)
		 */
		/**
		 * @cfg {Boolean} revertInvalid
		 * True to automatically revert the tree value and cancel the edit when the user completes an edit and the tree
		 * validation fails (defaults to true)
		 */
		/**
		 * @cfg {Boolean} ignoreNoChange
		 * True to skip the edit completion process (no save, no events fired) if the user completes an edit and
		 * the value has not changed (defaults to false).  Applies only to string values - edits for other data types
		 * will never be ignored.
		 */
		/**
		 * @cfg {Boolean} hideEl
		 * False to keep the bound element visible while the editor is displayed (defaults to true)
		 */
		/**
		 * @cfg {Mixed} value
		 * The data value of the underlying tree (defaults to "")
		 */
		value : "",
		/**
		 * @cfg {String} alignment
		 * The position to align to (see {@link Ext.Element#alignTo} for more details, defaults to "c-c?").
		 */
		alignment : "tl-tr?",
		/**
		 * @cfg {Array} offsets
		 * The offsets to use when aligning (see {@link Ext.Element#alignTo} for more details. Defaults to <tt>[0, 0]</tt>.
		 */
		offsets : [0, 0],
		/**
		 * @cfg {Boolean/String} shadow "sides" for sides/bottom only, "frame" for 4-way shadow, and "drop"
		 * for bottom-right shadow (defaults to "frame")
		 */
		shadow : "frame",
		/**
		 * @cfg {Boolean} constrain True to constrain the editor to the viewport
		 */
		constrain : false,
		/**
		 * @cfg {Boolean} swallowKeys Handle the keydown/keypress events so they don't propagate (defaults to true)
		 */
		swallowKeys : true,
		/**
		 * @cfg {Boolean} completeOnEnter True to complete the edit when the enter key is pressed. Defaults to <tt>true</tt>.
		 */
		completeOnEnter : true,
		/**
		 * @cfg {Boolean} cancelOnEsc True to cancel the edit when the escape key is pressed. Defaults to <tt>true</tt>.
		 */
		cancelOnEsc : true,
		/**
		 * @cfg {Boolean} updateEl True to update the innerHTML of the bound element when the update completes (defaults to false)
		 */
		updateEl : false,

		initComponent : function () {
			Ext.PopTree.superclass.initComponent.call(this);
			this.addEvents(
				"specialkey");
		},

		// private
		onRender : function (ct, position) {
			this.el = new Ext.Layer({
					shadow : this.shadow,
					parentEl : ct,
					shim : this.shim,
					shadowOffset : this.shadowOffset || 4,
					id : this.id,
					constrain : this.constrain
				});
			if (this.zIndex) {
				this.el.setZIndex(this.zIndex);
			}
			this.el.setStyle("overflow", Ext.isGecko ? "auto" : "hidden");
			this.tree.render(this.el).show();

			this.mon(Ext.getDoc(), {
				scope : this,
				mousewheel : this.onBlur,
				mousedown : this.onBlur
			});
		},

		// private
		onSpecialKey : function (tree, e) {
			this.fireEvent('specialkey', tree, e);
		},

		// private
		onBlur : function (e) {
			if (!e.within(this.el)) {
				this.hide();
			}
		},

		// private
		doAutoSize : function () {
			if (this.autoSize) {
				var sz = this.boundEl.getSize(),
				fs = this.tree.getSize();

				switch (this.autoSize) {
				case "width":
					this.setSize(sz.width, fs.height);
					break;
				case "height":
					this.setSize(fs.width, sz.height);
					break;
				case "none":
					this.setSize(fs.width, fs.height);
					break;
				default:
					this.setSize(sz.width, sz.height);
				}
			}
		},

		/**
		 * Sets the height and width of this editor.
		 * @param {Number} width The new width
		 * @param {Number} height The new height
		 */
		setSize : function (w, h) {
			delete this.tree.lastSize;
			this.tree.setSize(w, h);
			if (this.el) {
				// IE7 in strict mode doesn't size properly.
				if (Ext.isGecko2 || Ext.isOpera || (Ext.isIE7 && Ext.isStrict)) {
					// prevent layer scrollbars
					this.el.setSize(w, h);
				}
				this.el.sync();
			}
		},

		/**
		 * Realigns the editor to the bound tree based on the current alignment config value.
		 * @param {Boolean} autoSize (optional) True to size the tree to the dimensions of the bound element.
		 */
		realign : function (autoSize) {
			if (autoSize === true) {
				this.doAutoSize();
			}
			this.el.alignTo(this.boundEl, this.alignment, this.offsets);
		},

		// private
		onShow : function () {
			this.el.show();
			if (this.hideEl !== false) {
				this.boundEl.hide();
			}
			this.tree.show().focus(false, true);
		},
		setTimeoutHide : function () {
		    if(this._timeoutId){
			   return;
			}
			var me = this;
			this._timeoutId = setTimeout(function () {
					me.hide();
					delete me._timeoutId;
				}, 1200);

		},
		clearTimeout : function () {
			if (this._timeoutId) {
				clearTimeout(this._timeoutId);
				delete this._timeoutId;
			}
		},
		popUp : function (target) {
			this.boundEl = target.el || Ext.get(target);
			if (!this.rendered) {
				this.render(this.parentEl || document.body);
				this.mon(this.el, {
					scope : this,
					mouseleave : function () {
						this.hide();
					},
					mouseenter : function () {
						this.clearTimeout();
					}
				});
			}
			this.show();
			this.realign(true);
			this.setTimeoutHide();
		},
		// private
		onHide : function () {
			this.el.hide();
			if (this.hideEl !== false) {
				this.boundEl.show();
			}
		},

		beforeDestroy : function () {
			Ext.getDoc().un('mousewheel', this.onBlur, this);
			Ext.getDoc().un('mousedown', this.onBlur, this);
			Ext.destroyMembers(this, 'tree');
			delete this.parentEl;
			delete this.boundEl;
		}
	});
