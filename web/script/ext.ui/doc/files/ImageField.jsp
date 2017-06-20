<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../BrowseField.js"></script>
		<script type="text/javascript" src="../../ImageField.js"></script>
	</head>
	<body>


<div class="block">
<font>代码示例</font>
添加pop 事件的监听可以可以弹出window 进行其他的动作<br/>
事件函数声明：<br/>
void pop(Ext.ui.BrowseField field);
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        new Ext.ui.ImageField({
          anchor:'90%',
          fieldLabel:'testcombo',
          name:'test',
          defaultUrl:'http://img.baidu.com/img/logo-zhidao.gif',
          listeners:{
             pop:function(field){
                alert('你点击上传按钮');
                field.setValue('http://www.baidu.com/img/baidu_sylogo1.gif');
             }
          }
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