var grid = new Ext.ui.TreeGrid({
	storeConfig : {
		id : 'id',
		autoLoad : true,
		parent_id_field_name : 'parent',
		leaf_field_name : 'leaf',		
		url : Ext.url('/widgets/listTreeGrid.do')
	},
	master_column_id : 'text',
	fields : [{
		header : "名称",
		width : 400,
		name : 'text',
		id : 'text'
	}, {
		header : "样式",
		width : 75,
		name : 'cls'
	}, {
		header : "标识",
		width : 75,
		name : 'tg'
	}, {
		name : 'id',
		display : false
	}, {
		name : 'leaf',
		type : 'bool',
		display : false
	}, {
		name : 'parent',
		display : false
	},],
	stripeRows : true,
	title : 'tree Grid',
	root_title : '部门'
});
var vp = new Ext.Window({
	width : 700,
	height : 500,
	layout : 'fit',
	items : grid
});

vp.show();