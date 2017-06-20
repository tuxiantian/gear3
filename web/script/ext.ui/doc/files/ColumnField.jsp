<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>column field</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../FieldOverride.js"></script>
<script type="text/javascript" src="../../ColumnField.js"></script>
</head>
<body>


	<div class="block">
		<font>代码示例</font>
		<p>extends Ext.Contaner</p>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:500,
 height:300,
 layout:'fit',
 items:[
   {
     xtype:'form',
     bodyStyle:'padding:3px;', 
     items:[
       {
         xtype:'columnfield',
         itemId:'test',
         fieldLabel:'测试',
         anchor:'100%',               
         items:[{xtype:'textfield',name:'test',width:'50%'},{xtype:'label',html:'&lt;font color=red&gt;*&lt;/font&gt;label',width:40},{xtype:'spacer',width:20},{xtype:'datefield',name:'date',width:'50%'},{xtype:'button',text:'测试'}]
       },
        {
         xtype:'columnfield',
         fieldLabel:'测试',
         anchor:'100%',               
         items:[{xtype:'hidden',name:'hidden1'},{xtype:'textarea',name:'area',width:'100%',height:100},{xtype:'hidden',name:'hidden1'},{xtype:'button',text:'测试'}]
       },
       {
         xtype:'datefield',
         anchor:'100%',
         name:'name',
         fieldLabel:'name'
       },
       {
         xtype:'textfield',
         fieldLabel:'--'
       }

     ]
   }
 ],
 buttons:[{
   text:'重置',handler:function(bt){
      bt.ownerCt.ownerCt.items.first().getForm().reset();
   }},{
   text:'提交',
   handler:function(bt){
      if(bt.ownerCt.ownerCt.items.first().getForm().isValid()){
         alert(bt.ownerCt.ownerCt.items.first().getForm().getValues(true));
      }
   }   
 },{
   text:'赋值',
   handler:function(bt){
      if(bt.ownerCt.ownerCt.items.first().getForm().isValid()){
         bt.ownerCt.ownerCt.items.first().getForm().setValues({area:'areaarea'});
      }
   }   
 },{
   text:'disable',
   handler:function(bt){
      Ext.getCmp('test').disable();
   }   
 },{
   text:'enable',
   handler:function(bt){
      Ext.getCmp('test').enable();
   }   
 }]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>

	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>
</html>