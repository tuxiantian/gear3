<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>DisplayField</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../DisplayField.js"></script>
</head>
<body>


	<div class="block">
		<font>代码示例</font> <br />Ext.ui.DisplayField field
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        {
          anchor:'98%',
          id:"testselect", 
          xtype:'displayfield',        
          allowBlank:false,
          fieldLabel:'test',  
          height:50,         
          value:"sdffffffffffyreeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeexxxxxxxxx",
          name:'test'
        },{
          xtype:'textfield',
          anchor:'98%',
          fieldLabel:'-------'
        }
     ]
   }
 ],
 buttons:[{
   text:'重置',handler:function(bt){
      bt.ownerCt.items.first().getForm().reset();
   }},{
   text:'提交',
   handler:function(bt){
      alert(bt.ownerCt.items.first().getForm().getValues(true));
   }   
 }]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>



	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>
</html>