var BindField = Ext.extend(Ext.form.TextField, {
			enableKeyEvents : true,
			afterRender : function() {
				BindField.superclass.afterRender.apply(this, arguments);
				if (this.bindTo) {
					if (Ext.type(this.bindTo) == 'string') {
						this.bindTo = [this.bindTo];
					}
					this.addEvents('bindchange');
					this.toBind.defer(1000, this);
				}

			},
			toBind : function() {
				var me = this, bindTo, i = 0;
				for (i = 0; i < this.bindTo.length; i++) {
					bindTo = this.getBind(this.bindTo[i]);
					if (bindTo) {
						bindTo.on('keyup', function(f) {
									me.fireEvent("bindchange", f.getValue(), f);
								});
					}
				}
			},
			getBind : function(bindee) {
				var bindTo = Ext.getCmp(bindee);
				if (bindTo) {
					return bindTo;
				};
				var form;
				if (this.ownerCt) {
					if (this.ownerCt.getXType() == 'form') {
						form = this.ownerCt;
					} else {
						this.ownerCt.bubble(function() {
									if (this instanceof Ext.form.FormPanel) {
										form = this;
										return false;
									}
								});
					}
					if (form) {
						bindTo = form.getForm().findField(bindee);
						return bindTo
					}

				}

			}
		});

Ext.reg('bindfield', BindField);