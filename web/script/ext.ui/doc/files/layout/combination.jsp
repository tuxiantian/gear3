<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../../ux/RowFitLayout.js"></script>
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
 * 结合rowfit 和columnfit
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:500,
 title:'border rowfit 布局',
 layout:'border',
 bodyBorder:false,
 items:[
    {
    xtype:'container',
    autoEl: {},
    region:'west',
    title:'west',
    width:150,
    split:true ,
    layout:'rowfit',
    margins:'5 0 5 5',  
    items:[
      {
        xtype:'panel',
        height:150,
        title:'我固定高度'
      },      {
        xtype:'panel',
        style:'margin-top:5px',
        title:'我充满剩下高度'        
      }
    
    ]
    },
    {
    xtype:'panel',
    margins:'5 5 5 0', 
    region:'center',
    title:'center'
    }
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>
		
	

		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


	</body>
</html>