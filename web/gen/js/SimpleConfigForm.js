var SimpleConfigForm = Ext.extend(Ext.form.FormPanel, {
			defaults : {
				columnWidth : .33,
				xtype : 'fieldset',
				style : 'margin-left:5px;padding:3px;',
				labelWidth : 250,
				autoHeight : true,
				layout : 'form',
				defaults : {
					anchor : '90%',
					xtype : 'bindfield'
				}
			},
			autoScroll : true,
			layout : 'anchor',
			initComponent : function() {
				var form=this;
				this.items = [{
							title : '基本配置',
							items : [{
										fieldLabel : '数据库',
										emptyText : '例如表名：member',
										value:'member',
										name : 'database',
										allowBlank : false
									},{
										fieldLabel : '数据库表名',
										emptyText : '例如表名：t_sys_sql',
										name : 'tableName',
										value:'WEB_USER',
										allowBlank : false
									}, {
										fieldLabel : '实体类名',
										emptyText : '例如：App',
										value:'WebUser',
										name : 'appName',
										allowBlank : false,
										//bindTo:'tableName',
										listeners:{
										   bindchange:function(v){
										     this.setValue((v+'').toLowerCase());
										   }										
										}
									}, {
										fieldLabel : '基础包名',
										emptyText : '例如：com.member.web.auth',
										value : 'com.member.web.auth',
										name : 'package',
										allowBlank : false
									}, {
										fieldLabel : '生成位置',
										emptyText : '例如：c:\\temp',
										value : 'c:\\temp',
										name : 'position',
										allowBlank : false
									}]

						}, {
							title : 'controller 配置',
							items : [{
										fieldLabel : '包名(controller)',
										value : 'controller',
										name : 'actionPackage',
										allowBlank : false
									}, {
										fieldLabel : 'RequestMapping(注解) ',
										emptyText : '例如：/web/auth/group',
										name : 'actionNamespace',
										value : '/web/auth/user',
										allowBlank : false,
										listeners:{
										   bindchange:function(v){
										   	 var pk=form.getForm().findField('package').getValue();
										   	 pk=pk.split('.').slice(2);							
										     this.setValue("/"+pk.join("/"));
										   }										
										}											
									}]
						}, {
							title : 'mapper 配置',
							items : [{
										fieldLabel : '包名(mapper)',
										value : 'mapper',
										name : 'daoPackage',
										allowBlank : false
									}]
						}, {
							title : 'service 配置',
							items : [{
										fieldLabel : '包名(service)',
										value : 'service',
										name : 'servicePackage',
										allowBlank : false
									}]
						},{
							title : 'ftl 配置',
					         items:[
								 {
									 fieldLabel : 'ftl文件夹路径',
									 emptyText : '例如：web/auth/group',
									 name : 'ftlName',
									 value : '/web/auth/user',
									 allowBlank : false
								 },
								 {
									 fieldLabel : 'ftl文件名',
									 emptyText : '例如：group',
									 name : 'ftlEntityName',
									 value : 'user',
									 allowBlank : false
								 },
								 {
									 fieldLabel : '功能名称',
									 emptyText : '例如：部门',
									 name : 'ftlTipName',
									 value : '部门',
									 allowBlank : false
								 }
							 ]
						}
					/*{
							title : 'myBatis 配置',
							items : [{
										fieldLabel : '文件名前缀',
										value : 'sql-',
										name : 'ibatisFilePrefix',
										allowBlank : false
									}, {
										fieldLabel : '序列',										
										name : 'sequnce',
										allowBlank : false,
										bindTo:['tableName'],
										listeners:{
										   bindchange:function(v){
										     this.setValue("SEQ_"+v);
										   }										
										}											
									},{
										fieldLabel : 'Namespace',
										name : 'ibatisNamespace',
										emptyText : '例如：app',
										allowBlank : false,
										bindTo:['tableName','appName'],
										listeners:{
										   bindchange:function(v){
										     this.setValue(v);
										   }										
										}											
									}]
						},*/ /*{
							title : 'ext 配置',
							items : [{
							           name:'genEditGrid',
							           value:'yes',
							           xtype:'checkbox',
							           fieldLabel:'生成编辑表格(这和生成form 互斥)',
							           listeners:{
							             check:function(f,checked){
							             	var columnCount=Ext.getCmp('columnCount');
							                if(checked){
							                   columnCount.disable();							                
							                }else{
							                  columnCount.enable();	
							                }
							             
							             }
							           }
							         }
								    ,
								    {
										fieldLabel : 'form列数',
										xtype : 'numberfield',
										itemId:'columnCount',
										value : 1,
										name : 'columnCount',
										allowBlank : false
									}, {
										fieldLabel : 'js文件夹名',
										emptyText : '例如：js',
										name : 'jsFileName',
										value : 'js',
										allowBlank : false
									}]
						}*/];
				SimpleConfigForm.superclass.initComponent.apply(this, arguments);
			}
		});
		
Ext.reg('SimpleConfigForm',SimpleConfigForm)