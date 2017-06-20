Ext.ns("appport");
appport.AppportEditGrid = function(config) {
	config = config || {};
	 Ext.applyIf(config,{fields : [
                  {
					name : 'PORTID',
					header : 'PORTID'
									  }
                  ,{
					name : 'PORT',
					header : 'PORT'
					,
					editor:new Ext.form.TextField({
					  allowBlank:false
					})
				  }
                  ,{
					name : 'PORTUSE',
					header : 'PORTUSE'
					,
					editor:new Ext.form.TextField({
					  allowBlank:false
					})
				  }
                  ,{
					name : 'STATUS',
					header : 'STATUS'
					,
					editor:new Ext.form.TextField({
					  allowBlank:false
					})
				  }
                  ,{
					name : 'APP_ID',
					hidden:true,						
					header : 'APP_ID'
									  }
    ]});            
    Ext.applyIf(config,{
  			storeConfig : {
				url : Ext.url('/mps/listAppport.do')
			},
			pagingConfig :true 
    });            
            
	appport.AppportEditGrid.superclass.constructor.call(this, config);
}

Ext.extend(appport.AppportEditGrid,Ext.grid.EditorPasteCopyGridPanel, {
			title : '结果列表',
			stripeRows : true,
			loadMask : {
				msg : '加载数据中...'
			},		
			initComponent : function() {				
            var grid = this;
            // 操作工具栏
            var tbar1 = ['-', {
                        text : '增加一行',
                        iconCls : 'row-add',
                        handler : function() {
                            grid.insertLast();
                        }
                    }, '-', {
                        text : '删除一行',
                        iconCls : 'row-delete',
                        handler : function() {
                            if (grid.getSelected()) {
								while (grid.getSelected()) {
									grid.deleteRow();
								}
                            } else {
                                Ext.tip("提示", "<font color=red>请选择一行!</font>")
                            }
                        }
                    }];
            this.tbar = tbar1;
				appport.AppportEditGrid.superclass.initComponent.apply(this, arguments);
			}
	}
);