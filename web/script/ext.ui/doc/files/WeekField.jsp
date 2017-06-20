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
<script type="text/javascript" src="../../WeekField.js"></script>
</head>
<body>
<div class="block">
<font>配置项</font>
<pre class="brush:javascript;">
    /**
     * @cfg 每页显示周数
     */
    pageSize : 6,
    /**
     * @cfg {Number} 下拉周列表中当前周的所在位置
     */
    weekOffset : 2,
    /**
     * @cfg {Date} 周列表的开始天
     */
    startDay : new Date()
</pre>
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
            xtype : 'weekfield',
            id:'wf',
            startDay:new Date(),
            listeners : {
                'select' : function(wf, record) {
                    //所选record中的信息
                    console.log('getValue:' + wf.getValue());
                    console.log('getRawValue:' + wf.getRawValue());
                    console.log('getYear:' + record.get('y'));
                    console.log('getWeek:' + record.get('w'));
                    console.log('getYearWeek:' + record.get('yw'));
                    console.log('getYearWeekText:' + record.get('ywt'));
                    console.log('getStartDay:' + record.get('s'));
                    console.log('getEndDay:' + record.get('e'));
                }
            },
            width : 140,
            fieldLabel : 'Test',
            name : 'test'
        }],
        buttons:[{
            text:'setValue',
            handler:function(){
                Ext.getCmp('wf').setValue('201238');
                Ext.getCmp('wf').setRawValue('2012年38周');
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