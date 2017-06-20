<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../../ux/RowFitLayout.js"></script>
	</head>
	<body>


		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Toolbar
			</p>
			<pre class="brush:javascript;">
/*
 * 高度设置 100% 可以填充剩余高度
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:400,
 title:'rowfit 布局',
 layout:'rowfit',
 bodyBorder:false,
 items:[
    {
    xtype:'panel',
    title:'高度100px',
    height:100,      
    collapsible:true,
    html:'sdfsdfsdfsd'
    },
    {
    xtype:'panel',
    title:'高度50px',
    height:50,   
    html:'sdfsdfsdfsd'
    },
    {
    xtype:'panel',
    title:'高度100% 充满剩下高度',
    height:'100%',   
    html:'sdfsdfsdfsd'
    }
 ]
}).show();
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
 * 设置margin 和padding
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:400,
 title:'rowfit 布局',
 layout:'rowfit',
 bodyStyle:'padding:0 5 5 5;',
 bodyBorder:false,
 items:[
    {
    xtype:'panel',
    title:'高度100px',
    style:'margin-top:5px;',
    height:100,      
    collapsible:true,
    html:'sdfsdfsdfsd'
    },
    {
    xtype:'panel',
    title:'高度50px',
    height:50,   
    style:'margin-top:5px;',
    html:'sdfsdfsdfsd'
    },
    {
    xtype:'panel',
    title:'高度100% 充满剩下高度',
    style:'margin-top:5px;',
    height:'100%',       
    html:'sdfsdfsdfsd'
    }
 ]
}).show();

</pre>
			<input type="button" value="运行" class="run" />
		</div>		

		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


	</body>
</html>