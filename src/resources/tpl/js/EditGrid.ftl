Ext.ns("${config.appName}");
${config.appName}.${config.appName?cap_first}EditGrid = function(config) {
	config = config || {};
	 Ext.applyIf(config,{fields:[
                <#list cols as item>
                  <#if item_index gt 0>,</#if>{
					name : '${item.COLUMN_NAME}',
					header : '${item.COMMENTS}'
					<#if item.COLUMN_NAME!=pkey>,
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
							text : '保存',
							iconCls : 'save',
							handler :function(bt){
							   grid.save(bt);								
							}
						}, '-', {
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
									Ext.tip("提示",
											"<font color=red>请选择一行!</font>")
								}
							}
						}];
				// 查询工具栏
				var tbar2 = ['|',{
							xtype : 'searchfield',
							width : 120,
							allowBlank : false,
							emptyText : '请输入主键',
							listeners : {
								search : function(isSearch, field) {
									grid.toSearch("${pkey}", field.getValue());
								}
							}
						}];
				this.tbar = tbar1.concat(tbar2);
				${config.appName}.${config.appName?cap_first}EditGrid.superclass.initComponent.apply(this, arguments);
			},
		save : function(bt) {
				var g = this;
				var v = g.getValue();
				if (v.insert.length + v.update.length + v['delete'].length == 0) {
					Ext.tip("提示", "<font color=red>你没有做任何的修改不需要保存！</font>");
				} else {
					if (!g.isValid()) {
						Ext.tip("错误","<font color=red>保存失败，表格输入有错误!</font>");
						return;
					}				
					Ext.Ajax.request({
								url : Ext.url('${config.actionNamespace}/save${config.appName?cap_first}Grid.do'),
								waitMsg:'正在保存更改...',
								success : function(resp) {
									var json = Ext.decode(resp.responseText);
									Ext.tip(json);
									bt.enable();
									g.store.reload();
								},
								params : {
									json_data : Ext.encode(v)									
								}
							});	
                    

				}

			}
	}
);