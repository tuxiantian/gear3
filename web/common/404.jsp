<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>您访问的地址不存在 404 Not Found</title>
</head>
<style>
<!-- 
a:visited {  
color: #99BBE8;
height: 20px;
padding:5px; 
}
-->
</style>

<body style="padding: 30px 0 0 30px;">
	<script type="text/javascript">
		function onBack11(){
			if(window.opener){
				window.close();
			}else{
				history.go(-1);
			}
		}
		 
	</script>
	
	<h1>传说中的404出现了</h1>
	<img src="<%=request.getContextPath()%>/common/filenotfound.jpg" style="vertical-align:middle;" /><span style="margin-left:10px; color:#99BBE8;">您访问的地址或文件不存在，请确认地址是否正确!</span>
	<br/>
	<br/>
	<div style='width:450px;text-align:right;'>
		<a href="#" onclick="javascript:onBack11();">[返回]</a>
	</div>
</body>
</html>
