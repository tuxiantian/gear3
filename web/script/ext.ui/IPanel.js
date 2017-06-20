Ext.ns('Ext.ui');
/*
 * @config src // iframe url @config firameId // iframe ID @public method
 * {htmlElement getIframe(void)}
 */
Ext.ui.IPanel = Ext.extend(Ext.Panel, {
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
		Ext.ui.IPanel.superclass.onRender.call(this, ct, position);
		this.createIfrmae();
	},
	createIfrmae : function(url) {
		this.iframeId = this.iframeId || ('ifm_' + Ext.id());
		this.iftpl.overwrite(this.body, {
			id : this.iframeId,
			src : url || this.src || '#'
		});
		var me = this;
		Ext.get(this.iframeId).on('load', function() {
			me.fireEvent('load', me.getIframe());
		}, me, {
			single : true
		});

	},
	loadPage : function(url, callback) {
		callback = callback || Ext.emptyFn;
		Ext.get(this.iframeId).remove();
		this.createIfrmae(url);
		var me = this;
		this.on('load', function() {
			callback(me.getIframe());
		}, this, {
			single : true
		});
	},
	maximize:function(){
		var D=Ext.lib.Dom;
		var w = D.getViewWidth() , h = D.getViewHeight();
		var el=Ext.get(this.iframeId);
		this.restoreConfig={
		   width:el.getWidth(),
		   height:el.getHeight(),
		   position:el.getStyle("position"),
		   "z-index":el.getStyle("z-index")
		};		
		Ext.getBody().dom.appendChild(el.dom);
		el.applyStyles({
		   position:'absolute',
		   "z-index":2000		
		});		
		el.setSize(w,h);
		el.center();
			
		
	},
	restore:function(){
	   	var el=Ext.get(this.iframeId);
	   	var config=this.restoreConfig;
	   	this.body.dom.appendChild(el.dom);
	   	if(config){
			el.applyStyles({
			   position:config.position,
			   "z-index":config['z-index']		
			});			
			el.setSize(config.width,config.height);	 
	   	}
	},
	getIframe : function() {
		return document.getElementById(this.iframeId).contentWindow;
	}
});
Ext.reg('ipanel', Ext.ui.IPanel);