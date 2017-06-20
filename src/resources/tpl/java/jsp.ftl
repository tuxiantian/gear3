<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>${config.appName?cap_first}</title>
		<%@ include file="/common/pureExt.jsp"%>			
	    <#if config.master?exists>
		<script type="text/javascript" src="js/${config.subAppName?cap_first}EditGrid.js"></script>
		</#if>		
		<#if config.genEditGrid?exists>
		<script type="text/javascript" src="js/${config.appName?cap_first}EditGrid.js"></script>
		<#else>
		<script type="text/javascript" src="js/${config.appName?cap_first}FormWindow.js"></script>	
		<script type="text/javascript" src="js/${config.appName?cap_first}Grid.js"></script>
		</#if>	
		<script type="text/javascript" src="js/${config.appName}Main.js"></script>
	</head>
	<body>
	</body>
</html>