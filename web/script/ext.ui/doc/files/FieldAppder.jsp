<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../FieldOverride.js"></script>
	</head>
	<body>		
		
		

		<div class="block">
			<font>代码示例</font>
			<p>
				覆盖Ext.form.Field   （推荐使用columnfield）
				
			</p>
			<pre class="brush:javascript;">
/*
 * @config appenders(Array) 添加附加项目
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:550,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     fileUpload: true,
     bodyStyle:'padding:5px;',
     items:[
        {
          xtype:'textfield',
          anchor:'90%',
          qtip:'这个需要选择的哦',
          name:'doc',
          allowBlank:false,
          id:'test',
          fieldLabel:'test',
          appenders:[{
             xtype:'button',
             text:'clear me',
             handler:function(){
               alert('clear');
             }
          },{
             xtype:'label',             
             html:'<font color=red>*该选项必填</font>'
          }]
        },{
          xtype:'datefield',
          anchor:'90%',
          id:'date',
          triggerDisabled:true,
          enableSearch:true,
          fieldLabel:'test2'   
        }
     ]
   }
 ],
 buttons:[
   {
	   text:'hide',
	   handler:function(){
	      Ext.getCmp('test').hide();
	   }
   },
   {
	   text:'show',
	   handler:function(){
	      Ext.getCmp('test').show();
	   }
   },{
	   text:'test只读',
	   handler:function(){
	      Ext.getCmp('test').setReadOnly(true);
	   }
   },{
	   text:'test可写',
	   handler:function(){
	      Ext.getCmp('test').setReadOnly(false);
	   }
   },{
	   text:'trigger 可用',
	   handler:function(bt){
	      Ext.getCmp('date').enableTrigger();	      
	   }
   }
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>		


		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
	</body>

</html>