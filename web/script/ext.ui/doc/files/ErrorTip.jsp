<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../XToolbar.js"></script>
<script type="text/javascript" src="../../ErrorTip.js"></script>
<script type="text/javascript" src="../../Msg.js"></script>

</head>
<body>


	<div class="block">
		<font>代码示例</font>
		<p>Ext.error</p>
		<pre class="brush:javascript;">
/*
 * Ext.error(msg,detail);
 * @config msg　　　　 出错简单信息
 * @config detail     出错详细信息
 */
 </pre>
<pre class="brush:javascript;" code="code">
   Ext.error("NullPointerException","xxxx....xxxxxxxxxxxxxxxxxxx")   
</pre>
		<input type="button" value="运行" class="run" />
	</div>




	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
	
	<input type="button" id='bt' value="我是参照物"  style="height:100px;" />
</body>

</html>