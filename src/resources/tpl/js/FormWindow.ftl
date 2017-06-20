Ext.ns('${config.appName}');
${config.appName}.${config.appName?cap_first}FormWindow = Ext.extend(Ext.Window, {
			title : '请修改窗口title',
			width : 500,
			buttonAlign : 'center',			
			autoScroll : true,
			layout : 'anchor',
			closeAction : 'hide',
			initComponent : function() {
				this.save = this.save || Ext.emptyFn;		
				this.items = [{
							xtype : 'form',
							autoHeight : true,
							bodyStyle : 'padding:5px;',
							<#if config.columnCount?number gt 1>
							layout:'tableform',
							layoutConfig:{
							  columns:${config.columnCount}
							},
							</#if>
							labelWidth : 80,
							defaults : {
								xtype : 'textfield',
								anchor : '95%'
							},
							items : [{
							    name:'${pkey}',
							    xtype:'hidden'
							 }		                     
								 
                            <#list cols as item>                               
                            <#if item.COLUMN_NAME!=pkey>,{     
								   name : '${item.COLUMN_NAME}',
								   fieldLabel : '${item.COMMENTS}',
								   allowBlank:false
							}
							 </#if> 
                             </#list>     		                                                     
                            ]
						}];

				this.buttons = [{
							text : '保存',
							scope : this,
							handler : function(bt) {
								var form = this.getFormPanel();
								if (form.getForm().isValid()) {
									bt.disable();
									var vs = form.getForm().getValues(false);
									this.save(vs, bt, this);
								}		
							}
						}, {
							text : '关闭',
							scope : this,
							handler : function() {
								if (this.closeAction == 'hide') {
									this.hide()
								} else {
									this.close();
								}
							}
						}];
				${config.appName}.${config.appName?cap_first}FormWindow.superclass.initComponent.apply(this,arguments);

			},
			save : function(values, bt, window) {
				Ext.Ajax.request({
							url : Ext.url('${config.actionNamespace}/saveOrUpdate${config.appName?cap_first}.do'),
							params : values,
							success : function(resp) {
								bt.enable();
								var json = Ext.decode(resp.responseText);
								Ext.tip(json);
                                window.fireEvent('save',json.success);
                                if(json.success){
				                    window.hide();
				                }
							}
						});
			},
			getFormPanel : function() {
				return this.items.get(0);
			},
			resetForm : function() {				
				this.getFormPanel().getForm().reset();
			},
			loadRecord : function(record) {
				this.getFormPanel().getForm().loadRecord(record);
			}			
		});
