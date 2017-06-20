<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../ux/TreeCheckNodeUI.js"></script>
		<script type="text/javascript" src="../../AsyncTreePanel.js"></script>
	</head>
	<body>
<div class="block">
		<font color="#ff0000"> 无checkbox 如何刷新选择节点 tree.reloadSelectNode：</font>
		<pre class="brush:javascript;" code="code">
var win=new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
  new Ext.ui.AsyncTreePanel({
   rootConfig:{// 对应root 的配置
     id:'1',
     text:'组织机构'
   },
   loaderConfig:{},// 对应loader 的配置，这里可以省略的。
   url:Ext.url('/widgets/getTree.do?code=dept')// 对应loader中的dataUrl
  })
 ],
 buttons:[{
   text:'刷新选中的节点',
   handler:function(bt){
      bt.ownerCt.ownerCt.items.item(0).reloadSelectNode();
   }
 }]
});
win.show();

Ext.onScan({
  target:win,
  cb:function(a){
  console.log(a);
}});

</pre>
<input type="button" value="运行" class="run" />
</div>


<div class="block">
		<font color="#ff0000">含有 mapping配置 </font>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
  new Ext.ui.AsyncTreePanel({
   rootConfig:{// 对应root 的配置
     id:'0',
     text:'组织机构'
   },
   mapping:{parent:'parent',sort:'inx'},
   loaderConfig:{
    
   },// 对应loader 的配置，这里可以省略的。
   //url:Ext.url('/widgets/getTree.do?code=dept')// 对应loader中的dataUrl
     url:Ext.url('data/nodes.js')
  })
 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>

<div class="block">
		<font color="#ff0000"> 不含有parent mapping配置 </font>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
  new Ext.ui.AsyncTreePanel({
   rootConfig:{// 对应root 的配置
     id:'0',
     text:'组织机构'
   },
   mapping:{id:'_id',text:'name'},
   loaderConfig:{
    
   },// 对应loader 的配置，这里可以省略的。
   //url:Ext.url('/widgets/getTree.do?code=dept')// 对应loader中的dataUrl
     url:Ext.url('data/nodes2.js')
  })
 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>


<div class="block">
		<font color="#ff0000"> 配置checkbox代码示例：</font>
<pre class="brush:javascript;" >
/*
*@cfg{string} checkModel 默认情况下，checkModel为 multiple多选； single 单选；cascade： 父子级联； parentCascade 父亲级联；childCascade 子孙级联;
*@cfg{string} onlyLeafCheckable 默认为false，所有结点都可选*
*/
</pre>
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
  new Ext.ui.AsyncTreePanel({
   checkbox:true,
   onlyLeafCheckable:false,
   checkModel:'free',
   rootConfig:{// 对应root 的配置
     id:'1',
     text:'组织机构'
   },
   loaderConfig:{},// 对应loader 的配置，这里可以省略的。
   url:Ext.url('/widgets/getTree.do?code=dept')// 对应loader中的dataUrl
  })
 ],
 buttons:[{
    text:'获得选中值',
    handler:function(bt){
       var tree=bt.ownerCt.items.item(0);
       var checked=tree.getChecked();
       var value=[];
       Ext.each(checked,function(node){
           value.push(node.id);
       });
       alert(value.join(","));
    } 
 }]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>


<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>	
	</body>
</html>