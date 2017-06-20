Ext.ui.LinkCombo = Ext.extend(Ext.ui.ComboBox, {
	initComponent : function() {
		this.afterMethod('initList', this.afterInitList);
		Ext.ui.LinkCombo.superclass.initComponent.apply(this, arguments);
	},
	title : '&nbsp;',
	linkText : '添加',
	afterInitList : function() {
		if (this.header) {
			var h = this.header.getHeight(true);
			this.header.setStyle("position",'relative');
			var link = this.header.createChild({
				tag : 'a',
				href : '#',
				style : 'position:absolute;top:3px;right:0;display:inline-block;padding-right:2px;',
				html : this.linkText
			});
			var me = this;
			link.on('click', function(e, t, o) {
				me.fireEvent("linkClick", e, t, o);
			});
		}
	}
});

Ext.reg('linkcombo', Ext.ui.LinkCombo);		