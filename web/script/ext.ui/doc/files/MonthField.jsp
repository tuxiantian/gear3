<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<style type="text/css">
.x-month-mp {
    width: 165px;
}
.x-month-mp .x-month-mp-month{
    height: 25px;
}
td.x-date-mp-month a.x-date-mp-disabled, td.x-date-mp-year a.x-date-mp-disabled{
    color: gray;
}

td.x-date-mp-month a:hover.x-date-mp-disabled, td.x-date-mp-year a:hover.x-date-mp-disabled {
    background:none;
    color:gray;
    cursor:default;
}
</style>
<script type="text/javascript" src="../../MonthField.js"></script>
</head>
<body>



	<div class="block">
		<font>代码示例</font>
		<p>覆盖Ext.form.DateField</p>
		<pre class="brush:javascript;">
/*
 * @config appenders(Array) 添加附加项目
 * @Boolean showPrevNextTrigger 是否显示上下月Trigger 默认false 不显示
 */
 </pre>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:550,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     fileUpload: true,
     bodyStyle:'padding:5px;',
     items:[
            {
            	xtype: 'monthfield',
            	showPrevNextTrigger:true, //是否显示上下月Trigger
            	value:new Date(2002,10,20),
            	listeners:{
            	   'select':function(df,date){
            	       //alert(date);
            	   }
            	},
            	width:140,
            	fieldLabel: 'Test',
            	name: 'test'
            }
     ]
   }
 ]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>


	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>

</html>