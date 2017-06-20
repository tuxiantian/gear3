Ext.ns("app");
app.AppGrid = function(config) {
	config = config || {};
	Ext.applyIf(config,{fields : [
          {
			name : 'SEQ_ID',
			header : 'SEQ_ID'
		  }
          ,{
			name : 'APPNAME',
			header : 'APPNAME'
		  }
          ,{
			name : 'APPIP',
			header : 'APPIP'
		  }
          ,{
			name : 'APPCONFIG',
			header : 'APPCONFIG'
		  }
          ,{
			name : 'APPDOMAIN',
			header : 'APPDOMAIN'
		  }
          ,{
			name : 'APPUSE',
			header : 'APPUSE'
		  }
          ,{
			name : 'APPMANAGER',
			header : 'APPMANAGER'
		  }
          ,{
			name : 'APPCREATER',
			header : 'APPCREATER'
		  }
          ,{
			name : 'APPREMARK',
			header : 'APPREMARK'
		  }
    ]});
        
	Ext.applyIf(config,{
		storeConfig : {
			url : Ext.url('/mps/listApp.do')
		},
		pagingConfig : true 
		//,smConfig:{singleSelect:false}// 多选
	});    
	app.AppGrid.superclass.constructor.call(this, config);
}

Ext.extend(app.AppGrid, Ext.ui.XGridPanel, {
			title : '结果列表',
			stripeRows : true,
			loadMask : {
				msg : '加载数据中...'
			},
			listeners : {
				rowdblclick : function(grid) {
					grid.toedit();
				}
			},			
			initComponent : function() {				
				var grid = this;
				// 操作工具栏
				var tbar1 = [{
							text : '添加',
							iconCls:'add',
							scope : this,
							handler : this.toadd || Ext.emptyFn

						}, {
							text : '修改',
							iconCls:'edit',
							scope : this,
							handler : this.toedit || Ext.emptyFn

						}, {
							text : '删除',
							iconCls:'del',
							scope : this,
							handler : this.todelete || Ext.emptyFn
						}];
				// 查询工具栏
				var tbar2 = ['|',{
							xtype : 'searchfield',
							width : 120,
							allowBlank : false,
							emptyText : '请输入',
							listeners : {
								search : function(isSearch, field) {
									grid.toSearch("SEQ_ID", field.getValue());
								}
							}
						}];
				this.tbar = tbar1.concat(tbar2);
				app.AppGrid.superclass.initComponent.apply(this, arguments);
			},
			toadd : function() {
				var win=this.getWin();
				if (!win) {
					Ext.tip("提示", "请初始化window!");
					return;
				}				
				win.show();
				win.resetForm();
			},
			toedit : function() {
				var win=this.getWin();
				if (!win) {
					Ext.tip("提示", "请初始化window!");
					return;
				}
				var record = this.getSelected();			
				if (record) {
					win.show();
					win.resetForm();					
					win.loadRecord(record);
				} else {
					Ext.tip("提示", "请选择一行!");
				}
			},
			todelete : function() {
				if (this.getSelected()) {
					if (!confirm("确实要删除!")) {
						return;
					}
					/*
					 * 批量删除代码 
					var IDS=[],selections=this.getSelections();
					for(var i=0;i<selections.length;i++){
					    IDS.push(selections[i].data["SEQ_ID"]);
					}
					*/					
					Ext.Ajax.request({
								url : Ext.url('/mps/deleteApp.do'),
								//url : Ext.url('/mps/deleteApps.do'),//批量删除代码url
								waitMsg:'正在删除中...',
								success : function(resp) {
									var json = Ext.decode(resp.responseText);
									this.getStore().reload();
									Ext.tip(json);
								},
								scope : this,
								params : this.getSelected().data
								//params:{"IDS":IDS}
							});
				} else {
					Ext.tip("提示", "请选择一行!");
				}
			}

		}

);