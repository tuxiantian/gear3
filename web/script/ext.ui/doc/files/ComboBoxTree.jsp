<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>ComboBoxTree</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../ux/TreeCheckNodeUI.js"></script>
		<script type="text/javascript" src="../../ux/ComboBoxCheckTree.js"></script>
		<script type="text/javascript" src="../../AsyncTreePanel.js"></script>
		<script type="text/javascript" src="../../ComboBoxTree.js"></script>
	</head>
	<body>
<div class="block">
		<font color="#ff0000"> 最简单配置：</font>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200, 
 items:[
  new Ext.ui.ComboBoxTree({
   width:200,
   url:Ext.url('/widgets/getTree.do?code=dept')// 对应treeConfig中的url
  })
 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>

<div class="block">
		<font color="#ff0000"> 设置列表宽度</font>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200, 
 items:[
  new Ext.ui.ComboBoxTree({
   listWidth:250,
   width:200,
   url:Ext.url('/widgets/getTree.do?code=dept')// 对应treeConfig中的url
  })
 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>

<div class="block">
		<font color="#ff0000"> 设置工具栏</font>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200, 
 items:[
  new Ext.ui.ComboBoxTree({
   listWidth:250,
   width:200,
   treeConfig:{
     tbar:['-',{
        xtype:'textfield'
     },{
       text:'search'
     }]
   },
   url:Ext.url('/widgets/getTree.do?code=dept')// 对应treeConfig中的url
  })
 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>

<div class="block">
		<font color="#ff0000"> 配置级联选择设置回显代码示例：</font>
<pre class="brush:javascript;" >

/*
*@cfg{string} checkModel 默认情况下，checkModel为 multiple多选； single 单选；cascade： 父子级联； parentCascade 父亲级联；childCascade 子孙级联;
*@cfg{string} onlyLeafCheckable 默认为false，所有结点都可选*
*/
</pre>
<pre class="brush:javascript;" code="code">


new Ext.Window({
 width:400,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
	  new Ext.ui.ComboBoxTree({
	   width:240,
	   fieldLabel:'xxxx',
	   hiddenName:'testme',
	   itemId:'ComboBoxTree-1',
	   treeConfig:{
	      checkModel:'parentCascade'
	   },
	   url:Ext.url('/widgets/getTree.do?code=dept')// 对应loader中的dataUrl
	  })
     ]
   }
 ],
 buttons:[{
   text:'回显1',handler:function(bt){
      var combo=Ext.getCmp('ComboBoxTree-1');
      combo.reset();
      combo.setValue("xxxx");
   }},{
   text:'回显2',handler:function(bt){
      var combo=Ext.getCmp('ComboBoxTree-1');
      combo.reset();
      combo.setValue("5521,13",'卫华集团,不好');
   }},{
   text:'重置',handler:function(bt){
      bt.ownerCt.items.first().getForm().reset();
   }},{
   text:'提交',
   handler:function(bt){
      alert(Ext.getCmp('ComboBoxTree-1').getValue());
   }   
 }]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>


<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>	
	</body>
</html>