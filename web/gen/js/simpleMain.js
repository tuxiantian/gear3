Ext.onReady(function() {
	var cookieKey='genForm'
	Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
				path : "/",
				expires : new Date(new Date().getTime()
						+ (1000 * 60 * 60 * 24 * 30))

			}));
	var port = new Ext.Viewport({
		layout : 'border',
		items : [{
			region : 'north',
			xtype : 'box',
			autoEl : {
				tag : 'div',
				style : 'padding:0 5',
				html : '<span style="font-size:30px;font-weight:bold;line-height:35px;">代码生成器</span><font color=red>1.0</font>'
			},
			height : 35
		}, new SimpleConfigForm({
			region : 'center',
			itemId : 'configForm',
			title : '配置选项',
			margins : '0 5 4 5',
			buttonAlign : 'center',
			tbar:['->',{
			    text:'切换->到主从表生成',	
			    iconCls:'arrow_switch',
			    handler:function(){
			      location.replace("complex.jsp")
			    }
			}],
			listeners : {
				render : function(form) {
					var v = Ext.state.Manager.get(cookieKey);
					if (v) {
						form.getForm().setValues(Ext.decode(v));
					}
				}
			},
			buttons : [{
				text : '生  成',
				handler : function(bt) {
					var form = Ext.getCmp('configForm');
					if (form.getForm().isValid()) {
						v = form.getForm().getValues(false);
						if(v.package.split('.').length<3){
						    Ext.tip("提示","包名深度必须大于等于3")
							return;
						}
						Ext.Ajax.request({
							waitMsg : '验证中...',
							url : Ext.url('/gen/tableExist.do'),
							params : {
								tableName : v.tableName,
								database: v.database
							},
							success : function(response) {
								re = Ext.decode(response.responseText);

								if (re.success) {
									Ext.state.Manager.set(cookieKey, Ext
													.encode(v));
									Ext.Ajax.request({
												waitMsg : '生成中...',
												url : Ext
														.url("/gen/genCode.do"),
												params : v,
												success : function() {
													Ext.tip("SUCESS",
															"生成完毕</font>");
												}
											});

								} else {
									Ext
											.tip("ERROR",
													"<font color=red>没找该表，请查证后重试！</font>");
								}
							}
						});

					} else {
						Ext.tip("ERROR", "<font color=red>还没有填写的！</font>");
					}
				}
			}]
		})]

	});

});