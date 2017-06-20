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

.x-month-mp .x-month-mp-month {
	height: 25px;
}

td.x-date-mp-month a.x-date-mp-disabled,td.x-date-mp-year a.x-date-mp-disabled
	{
	color: gray;
}

td.x-date-mp-month a:hover.x-date-mp-disabled,td.x-date-mp-year a:hover.x-date-mp-disabled
	{
	background: none;
	color: gray;
	cursor: default;
}
</style>
<script type="text/javascript" src="../../MonthWeekField.js"></script>
</head>
<body>
<div class="block">
<font>配置项</font>
<font>代码示例</font>
<pre class="brush:javascript;" code="code">
new Ext.Window({
    width : 550,
    height : 200,
    layout : 'fit',
    items : [{
        xtype : 'form',
        fileUpload : true,
        bodyStyle : 'padding:5px;',
        items : [{
            xtype : 'monthweekfield',
            listeners : {
                'select' : function(wf, record) {
                    //所选record中的信息
                    console.log('getValue:' + wf.getValue());
                    console.log('getRawValue:' + wf.getRawValue());
                    console.log('getYearWeekMonth:' + record.get('ymw'));
                    console.log('getWeek:' + record.get('w'));
                    console.log('getText:' + record.get('t'));
                    console.log('getStartDay:' + record.get('s'));
                    console.log('getEndDay:' + record.get('e'));
                }
            }
        }]
    }]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>
	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>

</html>