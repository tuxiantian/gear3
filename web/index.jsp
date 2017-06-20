<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<base href="<%=basePath%>">
<title>我的轮子</title>
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache">
<meta http-equiv="expires" content="0">
<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
<meta http-equiv="description" content="This is my page">

</head>
<p style="margin:100 0 0 20;">
	<img alt="gear" width=200 src="style/gear.png" style="float:left;">
	<span style="font-size: 50px; font-weight: bolder;color: green;">Gear</span>
	就是工具箱的意思，希望借助大家的力量完善文档或做一些有用工具!
</p>
<div style="padding-top:50px;">
	<span>
		&nbsp;&nbsp;<a href="script/ext.ui/doc/index.jsp">ui扩展文档</a>
	</span>
	<span>
		&nbsp;&nbsp;<a href="script/ext341/docs/index.html">ext3文档</a>
	</span>
	<span>
		&nbsp;&nbsp;<a href="script/ext341/examples/index.html">ext3 examples</a>
	</span>
	<span> 
	    &nbsp;&nbsp;<a href="gen/">代码生成器</a> 
	</span>
	<span> 
	    &nbsp;&nbsp;<a href="gen/arrayjson.jsp">array to json</a> 
	</span>	
</div>
</body>
</html>
