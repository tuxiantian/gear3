<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" isErrorPage="true"%>
    <%@ page import="java.io.PrintWriter" %> 
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>服务器内部出错啦!</title>
</head>
<body style="padding: 30px 0 0 30px;">
	<img src="<%=request.getContextPath()%>/common/error.png" style="vertical-align:middle;" /><span style="margin-left:10px; font-size:20px; color:#99BBE8;">系统运行出错啦，请与管理员联系!</span>
	<br/>
	<br/> 
</body>
</html>