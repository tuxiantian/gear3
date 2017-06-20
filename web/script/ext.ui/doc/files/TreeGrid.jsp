<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>tree grid</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../CommonStore.js"></script>
<script type="text/javascript" src="../../ComboBox.js"></script>
<script type="text/javascript" src="../../BrowseField.js"></script>
<script type="text/javascript" src="../../FieldOverride.js"></script>
<script type="text/javascript" src="../../SearchField.js"></script>
<script type="text/javascript" src="../../plugins/GridPrinter.js"></script>
<script type="text/javascript" src="../../plugins/CellActions.js"></script>
<script type="text/javascript" src="../../XPagingToolbar.js"></script>
<script type="text/javascript" src="../../XGridPanel.js"></script>
<script type="text/javascript" src="../../ux/TreeGrid.js"></script>
<script type="text/javascript" src="treedata.js"></script>

</head>
<body>

	<pre class="brush:javascript;">
/**
 * 超级表格
 * @require Ext.ui.CommonStore,Ext.ui.XPagingToolbar
 * @class Ext.ui.XGridPanel
 * @extends Ext.grid.EditorGridPanel
 * @cfg {string}metaTable元信息表名称 可以配置store.fields 和gird.columns 
 * @cfg {object}fields 该字段是store.fields 配置项和gird.columns 混合配置 该字段优先级高于metaTable 如果metaTable 和fields 都配置那么同name 的会合并
 * @cfg {object} storeConfig  store 配置选项
 * @cfg {object} smConfig  选择模式{singleSelect:false}
 * @cfg {object}pagingConfig 设置分页选项 
 * @cfg {Ext.form.Field/string}formField 值绑定字段,动态把表格编辑值同步到form field(very useful)
 * @cfg {boolean} keepSelection  翻页保持选中
 * @event recordchage @argument {Ext.ui.XGridPanel} grid,@argument {Ext.data.Record} record
 * 
 */
 </pre>


	<div class="block">
		<p>
		<h2>Ext.ui.TreeGrid 继承于 Ext.ui.XGridPanel</h2>
		数据内容参见 treedata.js
		</p>
		<pre class="brush:javascript;" code="code">
    // 使用内存数据
    var record = Ext.data.Record.create([
   		{name: 'company'},
     	{name: 'price', type: 'float'},
     	{name: 'change', type: 'float'},
     	{name: 'pct_change', type: 'float'},
     	{name: 'last_change', type: 'date', dateFormat: 'n/j h:ia'},
     	{name: 'desc'},
     	{name: '_id', type: 'int'},
     	{name: '_parent', type: 'int'},
     	{name: '_level', type: 'int'},
     	{name: '_lft', type: 'int'},
     	{name: '_rgt', type: 'int'},
     	{name: '_is_leaf', type: 'bool'}
   	]);
    var store = new Ext.ux.maximgb.treegrid.NestedSetStore({
    	    autoLoad : true,
			reader: new Ext.data.JsonReader({id: '_id'}, record),
			proxy: new Ext.data.MemoryProxy(treedata)
    });
    // create the Grid
    var grid = new Ext.ui.TreeGrid({
      store: store,
      master_column_id : 'company',
      fields: [      
		{id:'company',header: "Company", width: 160, sortable: true, name: 'company'},
        {header: "Price", width: 75, sortable: true,  name: 'price',editor:new Ext.form.TextField()},
        {header: "Change", width: 75, sortable: true,  name: 'change'},
        {header: "% Change", width: 75, sortable: true,  name: 'pct_change'},
        {header: "Last Updated", width: 85, sortable: true, renderer: Ext.util.Format.dateRenderer('m/d/Y'), name: 'last_change'}
      ],
      stripeRows: true,
      autoExpandColumn: 'company',
      title: 'tree Grid',
      root_title: 'Companies',     
      viewConfig : {
      	enableRowBody : true
      }
    });
    var vp = new Ext.Window({
    	width:600,
    	height:400,
    	layout : 'fit',
    	items : grid
    });
    
    vp.show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>


	<div class="block">
		<p>
		<h2>Ext.ui.TreeGrid 继承于 Ext.ui.XGridPanel</h2>
		动态treegrid 第一层级的parent 必须为null 要不界面排列会出问题
		</p>
		<pre class="brush:javascript;" code="code">
    // 使用异步
var grid = new Ext.ui.TreeGrid({
    itemId:'test',
    viewConfig:{
       hideBreadCrumb:true
    },
    hideRowNumberer:false,
    smConfig:{
      singleSelect:false
    },
	storeConfig : {
		id : 'id',
		autoLoad : true,
		parent_id_field_name : 'parent',
		leaf_field_name : 'leaf',		
		url : Ext.url('/widgets/listTreeGrid.do')
	},
	pagingConfig:{
	   pageSize:50
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
	}],
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
</pre>
		<input type="button" value="运行" class="run" />
	</div>


	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


</body>
</html>