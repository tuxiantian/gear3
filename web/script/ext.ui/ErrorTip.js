Ext.ErrorWindow = Ext.extend(Ext.Window, {
	cls : 'x-window-dlg',
	buttonAlign : "center",
	width : 300,
	height : 150,
	title : '出错了',
	plain : true,
	closable : true,
	autoScroll : true,
	maximizable : true,
	fn:Ext.emptyFn,
	msg : '请传入msg',
	detail : '请传入detail',
	initComponent : function() {
		this.buttons=[{text:'',hidden:true}];
		Ext.ErrorWindow.superclass.initComponent.apply(this, arguments);
		var me = this;
		this.addButton({
			text : '确定',
			handler : function() {				
				if(me.fn){					
					me.fn();
				}
				me.close();
			}
		});
		this.moreButton = this.addButton({
			text : '更多>>',
			handler : function() {
				me.more();
			}

		});
	},
	more : function() {
		this.toggleMaximize();
		if (this.detail.isDisplayed()) {
			this.moreButton.setText("更多>>");
			this.detail.hide();
		} else {
			this.moreButton.setText("<<返回");
			this.detail.show();
		}
	},
	afterRender : function() {
		Ext.ErrorWindow.superclass.afterRender.apply(this, arguments);
		this.msg = this.body.createChild({
			html : "<font color=red size=3>" + this.msg + "</font>"
		});
		this.detail = this.body.createChild({
			tag : 'textarea',
			style : 'display:block;width:auto;height:auto;',
			html : this.detail
		});
		this.detail.enableDisplayMode();
		this.detail.hide();
		var me = this;
		this.on('resize', function() {
			var w = me.body.getWidth() - 10;
			var h = me.body.getHeight() - me.msg.getHeight();
			me.detail.setSize(w, h, false);
		});
	}

});

Ext.error = function(msg, detail,fn) {
	var win = Ext.createUI("Ext.ErrorWindow",{
		msg : msg,
		detail : detail,
		fn:fn||Ext.emptyFn
	});
	win.show();
	return win;
};