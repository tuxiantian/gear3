<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../../ux/ColumnFitLayout.js"></script>
	</head>
	<body>
		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Toolbar
			</p>
			<pre class="brush:javascript;">
/*
 *  默认平局分部
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,  
 frame: true,  
 layout: "columnfit",  
 title: "列布局（ColumnLayout）",      
 defaults: {  
     bodyStyle: "padding:3px; background-color: #FFFFFF;",  
     frame: true  
 },  
 items: [  
     {title:"嵌套面板1", html:"嵌套面板1"},  
     {title:"嵌套面板2", html:"嵌套面板2"},  
     {title:"嵌套面板3", html:"嵌套面板3"}
 ]  
}).show()
</pre>
			<input type="button" value="运行" class="run" />
		</div>

		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Toolbar
			</p>
			<pre class="brush:javascript;">
/*
 *  100%可以填充剩余宽度
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,  
 frame: true,  
 layout: "columnfit",  
 title: "列布局（ColumnLayout）",      
 defaults: {  
     bodyStyle: "padding:3px; background-color: #FFFFFF;",  
     frame: true  
 },  
 items: [  
     {width:150, title:"嵌套面板1", html:"嵌套面板1"},  
     {width:200, title:"嵌套面板2", html:"嵌套面板2"},  
     {width:'100%', title:"嵌套面板3", html:"嵌套面板3"}
 ]  
}).show()
</pre>
			<input type="button" value="运行" class="run" />
		</div>

		
		
		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Toolbar
			</p>
			<pre class="brush:javascript;">
/*
 *  全部使用百分比
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,  
 frame: true,  
 layout: "columnfit",  
 title: "列布局（ColumnLayout）",      
 defaults: {  
     bodyStyle: "padding:3px; background-color: #FFFFFF;",  
     frame: true  
 },  
 items: [  
     {width:'50%', title:"嵌套面板1", html:"嵌套面板1"},  
     {width:'20%', title:"嵌套面板2", html:"嵌套面板2"},  
     {width:'30%', title:"嵌套面板3", html:"嵌套面板3"}
 ]  
}).show()
</pre>
			<input type="button" value="运行" class="run" />
		</div>		
		
		
		
		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Toolbar
			</p>
			<pre class="brush:javascript;">
/*
 *  固定某个宽度 剩余的宽度为百分比宽度的基数
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,  
 frame: true,  
 layout: "columnfit",  
 title: "列布局（ColumnLayout）",      
 defaults: {  
     bodyStyle: "padding:3px; background-color: #FFFFFF;",  
     frame: true  
 },  
 items: [  
     {width:200, title:"嵌套面板1", html:"嵌套面板1"},  
     {width:'20%', title:"嵌套面板2", html:"嵌套面板2"},  
     {width:'30%', title:"嵌套面板3", html:"嵌套面板3"}
 ]  
}).show()
</pre>
			<input type="button" value="运行" class="run" />
		</div>			
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


	</body>
</html>