<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../BrowseField.js"></script>
		<script type="text/javascript" src="../../ImageUploadField.js"></script>
	</head>
	<body>


<div class="block">
<font>代码示例</font>

<pre class="brush:javascript;" code="code">
/**
*
*@event fileselected (this,value)
*
**/
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        new Ext.ui.ImageUploadField({
          anchor:'90%',
          fieldLabel:'testcombo',
          name:'test',
          value:'http://img.baidu.com/img/logo-zhidao.gif'
        })
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