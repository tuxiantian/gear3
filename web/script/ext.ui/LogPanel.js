Ext.ns("Ext.ui");

Ext.ui.LogPanel = Ext.extend(Ext.Panel, {
			cacheSize : 100,
			bodyStyle : 'background-color:black;overflow:auto;padding:3 5 5 3;',
			initComponent : function() {
				var me=this;
				if (!this.logTpl) {
					this.logTpl = new Ext.XTemplate(
					'<tpl for="logs">',
					    '<p style="color:#0c0;font-size: 12px;line-height: 16px;font-weight: 400;font-family: \'Inconsolata\',Courier,sans-serif;">{.}</p>',
					'</tpl>'
					);
				}
				
				this.bbar=['->','-',
					{
					  iconCls:'lock',
					  enableToggle:true,
					  toggleHandler:function(bt,st){
					     if(st){
					        me.lock();
					     }else{
					        me.unlock();
					     }
					  } 
					},'-',{
					   iconCls:'del',
					   handler:function(){
					      me.clear();
					   }
					
					}
				];
				Ext.ui.LogPanel.superclass.initComponent.apply(this, arguments);

			},
			lock:function(){
			    this.islock=true;
			},			
			unlock:function(){			
				this.islock=false;
			},
			clear : function() {
				this.body.update('');
				this.logCounter=0;
			},
			log : function() {
				if (arguments.length == 1) {
					var arg = arguments[0];
					if (Ext.isArray(arg)) {
						this.appendLog(arg);
					} else {
						arg = [arg];
					}
					this.appendLog(arg);
				} else {
					this.appendLog([].slice.call(arguments, 0));
				}

			},
			logCounter : 0,
			appendLog : function(logs) {
				if(this.islock===true && this.logCounter >= this.cacheSize){
				  return;
				}
				this.logTpl.append(this.body, {
							logs : logs
						});
				this.logCounter = this.logCounter + logs.length;
				this.trimLog();
				this.scrollToButtom();

			},
			scrollToButtom : function() {
				var bd = this.body.dom;
				if (bd.scrollHeight && this.islock!==true) {
					bd.scrollTop = bd.scrollHeight;
				}
			},
			trimLog : function(len) {
				len = this.logCounter - this.cacheSize;
				// extra delete mount for perfermance
				var extra=2;
				if (len>0) {					
					var bd = this.body.dom;
					for (var i = 0; i < len+extra; i++) {
						bd.removeChild(bd.firstChild);
					}
					this.logCounter=this.logCounter-(len+extra);
				}
			}

		});

Ext.reg("logpanel", Ext.ui.LogPanel);