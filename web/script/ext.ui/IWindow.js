Ext.ns('Ext.ui');
/*
 * @config src // iframe url @config firameId // iframe ID @public method
 * {htmlElement getIframe(void)}
 */
Ext.ui.IWindow = Ext.extend(Ext.Window, {
	iftpl : (function() {
		var tpl = new Ext.Template();
		tpl
				.set(
						'<iframe id="{id}" name="{id}" scrolling="{scroll}"  marginheight="0" APPLICATION="no"  marginwidth="0" width="100%" height="100%" src="{src}" frameborder="0"></iframe>',
						true);
		return tpl;
	})(),
	src: Ext.isIE && Ext.isSecure ? Ext.SSL_SECURE_URL : 'about:blank', 
	onRender : function(ct, position) {
		Ext.ui.IWindow.superclass.onRender.call(this, ct, position);
		this.iframeId = this.iframeId || ('ifm_' + Ext.id());
		this.iftpl.overwrite(this.body, {
			id : this.iframeId,
			src : this.src || '#'
		});
		var me = this;
		Ext.get(this.iframeId).on('load', function() {
			me.fireEvent('load', me.getIframe());
		}, me, {
			single : true
		});
	},
	getIframe : function() {
		return document.getElementById(this.iframeId).contentWindow;
	}
});

Ext.reg('iwindow', Ext.ui.IWindow);