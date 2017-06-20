Ext.onReady(function() {
	var cookieKey='genComplexForm'
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
			    text:'切换->到单表生成',	
			    iconCls:'arrow_switch',
			    handler:function(){
			      location.replace("index.jsp")
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
						var v = form.getForm().getValues(false);
						if(v.package.split('.').length<3){
						    Ext.tip("提示","包名深度必须大于等于3")
							return;
						}
						Step(function(){
						    form.isTableExist(v.tableName,this.parallel());
						    form.isTableExist(v.subTableName,this.parallel());
						},function(error){
						    if(error){
						      Ext.tip("错误","系统错误");
						    }else{
						    	var ok=true;
						        Ext.each([].slice.call(arguments,1),function(item){
						           if(!item.success){
						              ok=false;
						              Ext.tip("错误","系统表["+item.tableName+"]不存在！");
						           }						        
						        });
						        if(ok){
						           form.isKeyExist(v.subTableName,v.foreignKey,this)						        	
						        }
						    }
							
						},function(error,re){
						    if(error){
						      Ext.tip("错误","系统错误");
						    }else{
						    	if(re.success){
						    	   	Ext.state.Manager.set(cookieKey, Ext.encode(v));
									Ext.Ajax.request({
												waitMsg : '生成中...',
												url : Ext.url("/gen/genMasterSubCode.do"),
												params : v,
												success : function() {
													Ext.tip("SUCESS",
															"生成完毕</font>");
												}
											});					    	
						    	}else{
						    	   Ext.tip("错误","外键["+re.key+"]不存在！");		
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