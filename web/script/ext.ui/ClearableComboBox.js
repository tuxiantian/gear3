Ext.ns('Ext.ui');
/*
 * @event {afterclear}
 * @extends Ext.ui.ComboBox
 * 
 */
Ext.ui.ClearableComboBox = Ext.extend(Ext.ui.ComboBox, {
			initComponent : function() {
				Ext.ui.ClearableComboBox.superclass.initComponent.call(this);
				this.triggerConfig = {
					tag : 'span',
					cls : 'x-form-twin-triggers',
					style : 'padding-right:2px', // padding needed to prevent
					// IE from clipping 2nd
					// trigger button
					cn : [{
								tag : "img",
								src : Ext.BLANK_IMAGE_URL,
								cls : "x-form-trigger x-form-clear-trigger"
							}, {
								tag : "img",
								src : Ext.BLANK_IMAGE_URL,
								cls : "x-form-trigger"
							}]
				};
			},

			getTrigger : function(index) {
				return this.triggers[index];
			},
			onSelect : function(record, index) {
				Ext.ui.ClearableComboBox.superclass.onSelect.call(this, record,
						index);
				this.triggers[0].show();
			},
			initTrigger : function() {
				var ts = this.trigger.select('.x-form-trigger', true);
				this.wrap.setStyle('overflow', 'hidden');
				var triggerField = this;
				ts.each(function(t, all, index) {
							t.hide = function() {
								var w = triggerField.wrap.getWidth();
								this.dom.style.display = 'none';
								triggerField.el.setWidth(w
										- triggerField.trigger.getWidth());
							};
							t.show = function() {
								var w = triggerField.wrap.getWidth();
								this.dom.style.display = '';
								triggerField.el.setWidth(w
										- triggerField.trigger.getWidth());
							};
							var triggerIndex = 'Trigger' + (index + 1);

							if (this['hide' + triggerIndex]) {
								t.dom.style.display = 'none';
							}
							t.on("click", this['on' + triggerIndex + 'Click'],
									this, {
										preventDefault : true
									});
							t.addClassOnOver('x-form-trigger-over');
							t.addClassOnClick('x-form-trigger-click');
						}, this);
				this.triggers = ts.elements;
				this.triggers[0].hide();
			},
			onTrigger1Click : function() {
				this.reset();
				this.fireEvent("afterclear", this);
				this.triggers[0].hide();
			}, // pass to original combobox trigger handler
			onTrigger2Click : function() {
				this.onTriggerClick();
			} // clear contents of combobox
		});
Ext.reg("clearablecombo", Ext.ui.ClearableComboBox);