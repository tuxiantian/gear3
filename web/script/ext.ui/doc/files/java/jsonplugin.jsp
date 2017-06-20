<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>jsonplugin</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript"
	src="${base}/script/ext.ui/doc/syntax_highlighter/scripts/shBrushJava.js"></script>
</head>
<body>
	<div class="block">
		<pre class="brush:java;" code="code">
/**
*com/weihua/utils/JsonUtil.java
*JSON 序列化工具 用法
*/
            </pre>
	</div>
	<div>
		<pre class="brush:java;">
		Bean bean = new Bean();
		bean.setAa("a");
		bean.setCc("c");
		bean.setName("name");
		bean.setSex("sex");		
		// 排除不序列化 aa 和 cc
		String beanJson=JsonUtil.toJsonByExcludes(bean, new String[]{"aa","cc"});
		System.out.println(beanJson);
		// 只序列化 name 和 sex
		beanJson=JsonUtil.toJsonByIncludes(bean, new String[]{"name","sex"});
		System.out.println(beanJson);


   </pre>
	</div>
	<div>
		输出结果
		<pre class="brush:java;">
{"name":"name","sex":"sex"}
{"name":"name","sex":"sex"}


   </pre>
	</div>
	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>
</html>
