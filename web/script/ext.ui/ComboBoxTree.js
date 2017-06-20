Ext.ui.ComboBoxTree = function(config) {
	config = config || {};
	config.tree =config.tree||
	Ext.applyAll(this.defaultTreeConfig, config.treeConfig || {});	
	if(config.url){// 以treeConfig 为主
	   Ext.applyIf(config.tree,{url:config.url});
	}
	Ext.ui.ComboBoxTree.superclass.constructor.apply(this, arguments);
};
Ext.extend(Ext.ui.ComboBoxTree, Ext.ux.ComboBoxCheckTree, {
			defaultTreeConfig : {
				xtype : 'asynctreepanel',
				height : 100,
				checkbox : true,
				onlyLeafCheckable : false,
				checkModel : 'free',
				rootConfig : {// 对应root 的配置
					id : '1',
					text : 'ROOT'
				}
			},
			selectValueModel : 'all'

		});

Ext.reg('combotree', Ext.ui.ComboBoxTree);