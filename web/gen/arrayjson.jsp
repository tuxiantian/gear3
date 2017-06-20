<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>欢迎使用代码生成器(主从表)</title>
<%@ include file="/common/pureExt.jsp"%>



</head>
<body>

	<script>
		var columns = 10;
		var fields = [];
		var ch = 65;
		for ( var i = 0; i < columns; i++) {
			fields.push({
				name : String.fromCharCode(ch + i),
				header : String.fromCharCode(ch + i),
				editor : new Ext.form.TextField({})
			});
		}
		new Ext.Viewport({
			width : 800,
			height : 400,
			title : '超级表格',
			layout : 'fit',
			items : [ new Ext.grid.EditorPasteCopyGridPanel({
				id : 'insertTest',
				hideRowNumberer : false,
				fields : fields,
				storeConfig : {
					data : [ {
						A : ''
					} ]
				},
				tbar : [ {
					text : 'insertFirst',
					handler : function(bt) {
						Ext.getCmp('insertTest').insertFirst({});
					}
				}, {
					text : 'insertLast',
					handler : function(bt) {
						Ext.getCmp('insertTest').insertLast({});
					}
				}, {
					text : 'deleteRow',
					handler : function(bt) {
						var grid = Ext.getCmp('insertTest');
						grid.deleteRow(grid.getSelected());
					}
				}, {
					text : '生成json',
					handler : function(bt) {
						var v = Ext.getCmp('insertTest').getValue();
						var area = new Ext.form.TextArea({
							value : Ext.encode(v.update.concat(v.insert))
						});
						var win = new Ext.Window({
							width : 400,
							height : 300,
							layout : 'fit',
							items : [ area ]
						});
						win.show();
					}

				} ]
			}) ]
		});
	</script>

</body>
</html>