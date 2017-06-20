Ext.ns('${config.appName}');
Ext.onReady(function() {
  <#if config.genEditGrid?exists>
  		   new Ext.Viewport({
				layout : 'fit',
				items : [new ${config.appName}.${config.appName?cap_first}EditGrid()]
		    });
  <#else>
			var grid = new ${config.appName}.${config.appName?cap_first}Grid();
            grid.getWin=function(){
               // 如果初始化第一个参数传递是命名空间字符串那么，这个字符串将要成为这个window 对象的itemId，这个window 将要保持单例，除非destroy。
               return Ext.createUI("${config.appName}.${config.appName?cap_first}FormWindow",{
                 listeners:{
                   save:function(success){
                      if(success){
                         grid.store.reload();
                      }
                   }
                 }
               });
            };
            // 窗口预先显示可以解决一些回显的问题
            grid.getWin().show();
            grid.getWin().hide();

			new Ext.Viewport({
						layout : 'fit',
						items : [grid]
					});
   </#if>				
});