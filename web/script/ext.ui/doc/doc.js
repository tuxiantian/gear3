Ext.onReady(function() {
	var viewport = new Ext.Viewport({
		layout : 'border',
		items : [new Ext.BoxComponent({
							region : 'north',
							el : 'north',
							height : 32
						}), new Ext.ui.AsyncTreePanel({
							title : '菜单',
							margins : '0 3 3 3',
							region : 'west',
							width : 200,
							rootVisible : false,
							rootConfig : {
								id : '1',
								text : 'root'
							},
							url : 'treeJson.js',
							tabs : {},
							listeners : {
								click : function(node, event) {
									event.preventDefault();
									var tab = Ext.getCmp('tab'), me = this;
									if(!node.leaf){
										node.toggle();
										return;
									}
									if (!this.tabs[node.id]) {
										this.tabs[node.id] = tab
												.add(new Ext.ui.IPanel({
													title : node.text,
													closable : true,
													src:node.attributes.src,
													listeners : {
														beforedestroy : function() {
															delete me.tabs[node.id];
														}
													}
												}));
									}
									tab.setActiveTab(this.tabs[node.id]);
								}

							}
						}), {

					xtype : 'tabpanel',
					id : 'tab',
					region : 'center',
					margins : '0 3 3 0',
					activeTab : 0,
					items : [{
								title : '说明',
								autoScroll : true,
								xtype : 'panel',
								contentEl : 'home'
							}]

				}]

	})

})