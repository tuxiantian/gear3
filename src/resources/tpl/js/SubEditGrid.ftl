Ext.ns("${config.appName}");
${config.appName}.${config.appName?cap_first}EditGrid = function(config) {
	config = config || {};
	 Ext.applyIf(config,{fields : [
                <#list cols as item>
                  <#if item_index gt 0>,</#if>{
					name : '${item.COLUMN_NAME}',
					<#if config.foreignKey?exists && item.COLUMN_NAME==config.foreignKey>
					hidden:true,						
					</#if>
					header : '${item.COMMENTS}'
					<#if (item.COLUMN_NAME!=pkey) && !(config.foreignKey?exists && item.COLUMN_NAME==config.foreignKey) >,
					editor:new Ext.form.TextField({
					  allowBlank:false
					})
					</#if>
				  }
                </#list>     
    ]});            
    Ext.applyIf(config,{
  			storeConfig : {
				url : Ext.url('${config.actionNamespace}/list${config.appName?cap_first}.do')
			},
			pagingConfig :true 
    });            
            
	${config.appName}.${config.appName?cap_first}EditGrid.superclass.constructor.call(this, config);
}

Ext.extend(${config.appName}.${config.appName?cap_first}EditGrid,Ext.grid.EditorPasteCopyGridPanel, {
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
				${config.appName}.${config.appName?cap_first}EditGrid.superclass.initComponent.apply(this, arguments);
			}
	}
);