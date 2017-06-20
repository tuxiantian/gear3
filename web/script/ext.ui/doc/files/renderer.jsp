<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
</head>
<body>

	<p>grid renderers 的扩展可以到ExtUtils.js 中找到源代码</p>
	<div class="block">
		<pre class="brush:javascript;">
/*
 * @param data{array} 类似于 [['1','男'],[['2','女']] 的二维数组
 * @param vIndex{number}  隐藏值的下标 default 0
 * @param dIndex {number} 显示值的下标 default 2
 */
 </pre>
		<pre class="brush:javascript;" code="code">
        Ext.grid.renderers.arrayRenderer(data,vIndex,dIndex)
</pre>
	</div>

	<div class="block">
		<pre class="brush:javascript;">
/*
 * @param data{array} 类似于 [{ID:'1',TEXT:'男'},{ID:'2',TEXT:'女'}] 的json数组
 * @param vName{string}  隐藏值的name default ID
 * @param dName {string} 显示值的name default TEXT
 */
 </pre>
		<pre class="brush:javascript;" code="code">
        Ext.grid.renderers.jsonRenderer(data,vName,dName)
</pre>
	</div>

	<div class="block">
		<pre class="brush:javascript;">
/*
 * 该renderer 支持jsonStore  
 * @param storeId{string/Store}  
 * @param grid{Ext.grid.GridPanel} 如果store 不要ajax 获得数据grid 也不用传参  
 * @param vName{number}  隐藏值的name default ID
 * @param dName {number} 显示值的name default TEXT
 */
 </pre>
		<pre class="brush:javascript;" code="code">
        Ext.grid.renderers.storeRenderer(storeId,grid,vName,dName)
</pre>
	</div>


<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


</body>
</html>