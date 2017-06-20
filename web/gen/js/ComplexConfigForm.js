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
							    xtype:'hidden',
							    name:'master',
							    value:'true'								
							},{
										fieldLabel : '主表名',
										emptyText : '例如表名：t_sys_sql',
										name : 'tableName',
										allowBlank : false
									}, {
										fieldLabel : '主应用名称',
										emptyText : '例如：app',										
										name : 'appName',
										allowBlank : false,
										bindTo:'tableName',
										listeners:{
										   bindchange:function(v){
										     this.setValue((v+'').toLowerCase());
										   }										
										}
									},{
										fieldLabel : '从表名',
										emptyText : '例如表名：sub_t_sys_sql',
										name : 'subTableName',
										allowBlank : false
									}, {
										fieldLabel : '从应用名称',
										emptyText : '例如：app',										
										name : 'subAppName',
										allowBlank : false,
										bindTo:'subTableName',
										listeners:{
										   bindchange:function(v){
                                               this.setValue((v+'').toLowerCase());
										   }										
										}
									}, {
										fieldLabel : '从表外键',															
										name : 'foreignKey',
										allowBlank : false,
										bindTo:'tableName',
										listeners:{
										   bindchange:function(v){
										     this.setValue(v+"_ID");
										   }										
										}
									}, {
										fieldLabel : '基础包名',
										emptyText : '例如：com.weihua.mps',
										value : 'com.weihua.mps',
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
							title : 'action 配置',
							items : [{
										fieldLabel : '包名(web/action)',
										value : 'web',
										name : 'actionPackage',
										allowBlank : false
									
									}, {
										fieldLabel : 'Namespace(struts注解) ',
										emptyText : '例如：/mps/app/',
										name : 'actionNamespace',
										allowBlank : false,
										bindTo:['tableName','appName','package'],
										listeners:{
										   bindchange:function(v){
										   	 var pk=form.getForm().findField('package').getValue();
										   	 pk=pk.split('.').slice(2);							
										     this.setValue("/"+pk.join("/"));
										   }										
										}											
									}]
						}, {
							title : 'dao 配置',
							items : [{
										fieldLabel : '包名(dao)',
										value : 'dao',
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
						}, {
							title : 'ibatis 配置',
							items : [{
										fieldLabel : '文件名前缀',
										value : 'sql-',
										name : 'ibatisFilePrefix',
										allowBlank : false
									}, {
										fieldLabel : '主表 Namespace',
										name : 'ibatisNamespace',
										emptyText : '例如：app',
										allowBlank : false,
										bindTo:['tableName','appName'],
										listeners:{
										   bindchange:function(v){
										     this.setValue(v);
										   }										
										}											
									}, {
										fieldLabel : '主表序列',										
										name : 'sequnce',
										allowBlank : false,
										bindTo:['tableName'],
										listeners:{
										   bindchange:function(v){
										     this.setValue("SEQ_"+v);
										   }										
										}											
									}, {
										fieldLabel : '从表 Namespace',
										name : 'subIbatisNamespace',
										emptyText : '例如：subapp',
										allowBlank : false,
										bindTo:['subTableName','subAppName'],
										listeners:{
										   bindchange:function(v){
										     this.setValue(v);
										   }										
										}											
									}, {
										fieldLabel : '从表序列',										
										name : 'subSequnce',
										allowBlank : false,
										bindTo:['tableName','sequnce'],
										listeners:{
										   bindchange:function(v){
										   	if(v.indexOf('SEQ_')>=0){
										     this.setValue(v);
										   	}else{
										   	 this.setValue("SEQ_"+v);
										   	}
										   }										
										}											
									}]
						}, {
							title : 'Ext 配置',
							items : [
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
						}];
				SimpleConfigForm.superclass.initComponent.apply(this, arguments);
			},
			isTableExist:function(table,callback){
						Ext.Ajax.request({
							waitMsg : '验证表'+table+'...',
							url : Ext.url('/gen/tableExist.do'),
							params : {
								tableName : table
							},
							success : function(response) {
								re = Ext.decode(response.responseText);
								re.tableName=table;
								callback(false,re);
							}
						});	
			},
			isKeyExist:function(table,key,callback){
						Ext.Ajax.request({
							waitMsg : '验证'+table +'外键:'+key+'...',
							url : Ext.url('/gen/keyExist.do'),
							params : {
								tableName : table,
								key:key
							},
							success : function(response) {
								re = Ext.decode(response.responseText);
								re.tableName=table;
								re.key=key;
								callback(false,re);
							}
						});	
			}
		});
		
Ext.reg('SimpleConfigForm',SimpleConfigForm)