<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../ux/Spinner.js"></script>
<script type="text/javascript" src="../../ux/SpinnerField.js"></script>
</head>
<body>



	<div class="block">
		<font>代码示例</font>
		<p>覆盖Ext.form.Field</p>
		<pre class="brush:javascript;">
/*
 * @config appenders(Array) 添加附加项目
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
            	xtype: 'spinnerfield',
            	fieldLabel: 'Test',
            	name: 'test',
            	minValue: 0,
            	maxValue: 100,
            	allowDecimals: true,
            	decimalPrecision: 1,
            	incrementValue: 0.4,
            	alternateIncrementValue: 2.1,
            	accelerate: true
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