<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../IPanel.js"></script>
<script type="text/javascript" src="../../ReportPanel.js"></script>
</head>
<body>


	<div class="block">
		<font>代码示例</font>
		<p>extends Ext.ui.IPanel</p>
		<pre class="brush:javascript;">
    /**
     * @cfg {String} 报表文件名称(不包含扩展名)
     */
     reportName : null
 </pre>
<pre class="brush:javascript;" code="code">
var panel = new Ext.ui.ReportPanel({
        reportName : 'test', // {String} 报表文件名称(不包含扩展名)
        tbar : [{
            xtype : 'textfield',
            id : 'year',
            width : 120
        }, {
            text : '查询',
            handler : function() {
                // 调用load方法加载报表
                panel.load({
                    // 报表所需的参数
                    params : {
                        'year' : Ext.getCmp('year').getValue()
                    }
                });
            },
            scope:this
        }]
    });
new Ext.Window({
    width : 800,
    height : 600,
    layout : 'fit',
    title : '测试报表',
    items : [panel]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>
	<div id="panel"></div>
	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>

</html>