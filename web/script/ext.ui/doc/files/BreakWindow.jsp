<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../BreakWindow.js"></script>
		
		<script>
		
		  Ext.define("W",{
			  extend:Ext.Window,
			  show:function(){
				  
				  debugger;
				  this.callParent();
			  }
			  
		  });
		
		</script>
		
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
var win=new Ext.ui.BreakWindow({
 title:'iframe panel',
 width:600,

 height:400
 });
win.show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>




		<div id="panel">
		</div>
<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>		
	</body>

</html>