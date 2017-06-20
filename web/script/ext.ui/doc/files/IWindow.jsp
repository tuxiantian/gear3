<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../IWindow.js"></script>
	</head>
	<body>


		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Window
			</p>
			<pre class="brush:javascript;">
/*
 * @config src　　　　// iframe url
 * @config firameId // iframe ID
 * @public method {htmlElement getIframe(void)} 
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.ui.IWindow({
 width:800,
 height:400,
 src:'/gear/script/ext.ui/doc/files/icon.jsp',
 buttons:[{
   text:'提交',
   handler:function(bt){
      alert(bt.ownerCt.getIframe().location.href);
   }   
 }],
 listeners:{
    load:function(){
      alert("pageloaded");
    }
 }
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>

		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


	</body>
</html>