Ext.ns('Ext.ui');
/*
 * @config src // iframe url @config firameId // iframe ID @public method
 * {htmlElement getIframe(void)}
 */
Ext.ui.BreakWindow = Ext.extend(Ext.Window, {
			initComponent : function() {
				this.on("hide", this.restoreMax, this);
				Ext.ui.BreakWindow.superclass.initComponent.apply(this, arguments);
			},			
			restoreMax : function() {
				if (this.iframeEl) {
					var el = this.iframeEl;
					var config = this.restoreConfig;
					if (config) {
						this.restoreRelativeParentNode();
						el.applyStyles({
									position : config.position,
									"z-index" : config['z-index']
								});
						el.setSize(config.width, config.height);

					}

				}
			},
			staticRelativeParentNode : function() {
				var pwin = window.parent;
				var Ext = pwin.Ext;
				if (this.isLowIE()) {
					if (this.restoreConfig.parentNode != Ext.getBody().dom) {
						Ext.getBody().dom.appendChild(this.iframeEl.dom);
					}
					return;
				}

				var start = this.iframeEl.dom.parentNode;
				var rNodes = [];
				this.rNodes = rNodes;
				var el;
				while (start) {
					el = Ext.get(start);
					if (el.getStyle("position") != "static") {
						rNodes.push({
									id : el.id,
									position : el.getStyle("position")
								});
						el.setStyle("position", "static");
					}
					start = start.parentNode;
					if (start.tagName == 'BODY') {
						break;
					}
				}
			},
			restoreRelativeParentNode : function() {
				var pwin = window.parent;
				var Ext = pwin.Ext;
				if (this.isLowIE()) {
					if (this.restoreConfig.parentNode != Ext.getBody().dom) {
						this.restoreConfig.parentNode.appendChild(this.iframeEl.dom);
					}
					return;
				}
				var rNodes = this.rNodes;
				for (var i = 0; i < rNodes.length; i++) {
					Ext.get(rNodes[i].id).setStyle("position", rNodes[i].position);
				}
				// console.dir(parent.document.getElementsByTagName("iframe"));
			},
			isLowIE : function() {
				return Ext.isIE && !Ext.isIE10;
			},
			show : function() {
				
				var superShow = Ext.ui.BreakWindow.superclass.show;
				var win = window;
				var me = this;
				if (win.parent) {

					var pwin = window.parent;
					var iframes = pwin.document.getElementsByTagName("iframe");
					var iframe
					for (var i = 0; i < iframes.length; i++) {
						if (iframes[i].contentWindow.location.href === win.location.href) {
							iframe = iframes[i];
						}
					}
					if (iframe) {
						var D = pwin.Ext.lib.Dom;
						var w = D.getViewWidth(), h = D.getViewHeight();
						var el = pwin.Ext.get(iframe);
						this.iframeEl = el;
						this.restoreConfig = {
							width : el.getWidth(),
							height : el.getHeight(),
							position : el.getStyle("position"),
							"z-index" : el.getStyle("z-index"),
							parentNode : el.dom.parentNode
						};
						this.staticRelativeParentNode();
						el.applyStyles({
									position : 'absolute',
									top : 0,
									left : 0,
									"background-color" : 'white',
									"z-index" : 2000
								});
						el.setSize(w, h);						
					}

				}
				
				superShow.apply(this, arguments);

			}

		});

Ext.reg('breakwindow', Ext.ui.BreakWindow);