<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../CommonStore.js"></script>		
		<script type="text/javascript" src="../../XPagingToolbar.js"></script>
		<script type="text/javascript" src="../../GalleryPanel.js"></script>
	</head>
	<body>
		
		
		
<div class="block">
<font> 图片浏览器</font>
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:500,
 height:200,
 layout:'fit',
 items:[
     new Ext.ui.GalleryPanel({
       viewConfig:{
          removable:true,
          imgWidth:100,
          imgHeight:80
       },
       pagingConfig:true,
       storeConfig:{
         fields:[
           {name:'url'},
           {name:'name'}
         ],
         data:[
           {
             name:'baidu1ssssssssssssssssssssssssssssssssdfasdf',     
             url:'http://www.baidu.com/img/bdlogo.gif'
           },{
             name:'baidu2',          
             url:'http://www.baidu.com/img/bdlogo.gif'
           },{
             name:'baidu3',      
             url:'http://www.baidu.com/img/bdlogo.gif'
           }
         ]
       }
     })
 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>

<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>	
	</body>
</html>