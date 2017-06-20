<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../LogPanel.js"></script>
	</head>
	<body>


		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Panel
			</p>
			<pre class="brush:javascript;">
/*
***
 */
 </pre>
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:500,
 height:300,
 maximizable :true,
 layout:'fit',
 items:[
   {
     xtype:'logpanel',
     itemId:'test',
     title:'test'
   }
 ]
}).show();

var i=0;
setInterval(function(){
  i++;  
  Ext.getCmp('test').log("test------------>"+i);

},200);
</pre>
			<input type="button" value="运行" class="run" />
		</div>




		<div id="panel">
		</div>
<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>		
	</body>

</html>