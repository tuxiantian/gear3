<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../CommonStore.js"></script>
<script type="text/javascript" src="../../ComboBox.js"></script>
<script type="text/javascript" src="../../LinkCombo.js"></script>
</head>
<body>


	<div class="block">
		<font> 这个组建在list 的最顶端显示一个链接</font>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
	width : 300,
	height : 200,
	layout : 'fit',
	items : [{
		xtype : 'form',
		items : [new Ext.ui.LinkCombo({
			anchor : '90%',
			fieldLabel : 'testcombo',
			linkText:'添加',
			tbar : [{
				text : 'test'
			}],
			listeners : {
				linkClick : function(e, t, o) {
					alert(this.linkText);
				}
			},
			title : '&nbsp;',
			storeConfig : {
				data : [['good', '很好'], ['bad', '老好']]
			}
		})]
	}

	]
}).show();

</pre>
		<input type="button" value="运行" class="run" />
	</div>





	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>
</html>