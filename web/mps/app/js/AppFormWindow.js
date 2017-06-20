Ext.ns('app');
app.AppFormWindow = Ext.extend(Ext.Window, {
			title : '请修改窗口title',
			width : 500,
			buttonAlign : 'center',			
			autoScroll : true,
			layout : 'anchor',
			closeAction : 'hide',
			initComponent : function() {
				this.save = this.save || Ext.emptyFn;		
				var appportEditGrid = new appport.AppportEditGrid({
							frame : true,
							colspan:2,
							height : 200,
							anchor : '100%'
						});
				this.appportEditGrid = appportEditGrid;
				var hiddenAppportData = new Ext.form.Hidden({
							name : 'appportData',
							itemId : 'appportData'
						});		
				this.items = [{
							xtype : 'form',
							autoHeight : true,
							layout:'tableform',
							layoutConfig:{
							  columns:2
							},
							bodyStyle : 'padding:5px;',
							labelWidth : 80,
							defaults : {
								xtype : 'textfield',
								anchor : '95%'
							},
							items : [{
							    name:'SEQ_ID',
							    xtype:'hidden'
							 }
                           ,hiddenAppportData	              
                                                        ,{     
								   name : 'APPNAME',
								   fieldLabel : 'APPNAME',
								   allowBlank:false
							}
                            ,{     
								   name : 'APPIP',
								   fieldLabel : 'APPIP',
								   allowBlank:false
							}
                            ,{     
								   name : 'APPCONFIG',
								   fieldLabel : 'APPCONFIG',
								   allowBlank:false
							}
                            ,{     
								   name : 'APPDOMAIN',
								   fieldLabel : 'APPDOMAIN',
								   allowBlank:false
							}
                            ,{     
								   name : 'APPUSE',
								   fieldLabel : 'APPUSE',
								   allowBlank:false
							}
                            ,{     
								   name : 'APPMANAGER',
								   fieldLabel : 'APPMANAGER',
								   allowBlank:false
							}
                            ,{     
								   name : 'APPCREATER',
								   fieldLabel : 'APPCREATER',
								   allowBlank:false
							}
                            ,{     
								   name : 'APPREMARK',
								   fieldLabel : 'APPREMARK',
								   allowBlank:false
							}
		                     ,appportEditGrid 
		                                                     
                            ]
						}];

				this.buttons = [{
							text : '保存',
							scope : this,
							handler : function(bt) {			
								var form = this.getFormPanel();
								if (form.getForm().isValid()&& appportEditGrid.isValid()) {
									bt.disable();
									hiddenAppportData.setValue(Ext.encode(appportEditGrid.getValue()));
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
				app.AppFormWindow.superclass.initComponent.apply(this,arguments);

			},
			save : function(values, bt, window) {
				Ext.Ajax.request({
							url : Ext.url('/mps/saveOrUpdateApp.do'),
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
				this.appportEditGrid.store.baseParams["APP_ID"]='';	
				this.appportEditGrid.store.removeAll();// clear grid
				this.appportEditGrid.reset();					
			},
			loadRecord : function(record) {
				this.getFormPanel().getForm().loadRecord(record);				
				this.appportEditGrid.reset();
				this.appportEditGrid.toSearch("APP_ID", record.data['SEQ_ID']);			
			}			
		});
