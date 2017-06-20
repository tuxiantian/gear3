<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../CommonStore.js"></script>
		<script type="text/javascript" src="../../plugins/CellActions.js"></script>
		<script type="text/javascript" src="../../plugins/GridPrinter.js"></script>
		<script type="text/javascript" src="../../XPagingToolbar.js"></script>
		<script type="text/javascript" src="../../XGridPanel.js"></script>
		<script type="text/javascript" src="../../Msg.js"></script>
		<script type="text/javascript"
			src="../../ux/EditorPasteCopyGridPanel.js"></script>
		<script type="text/javascript"
			src="../../ux/ExcelCellSelectionModel.js"></script>
			
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
				你可以从excel copy 粘贴到表格中来<br/>
				用箭头可以导航 enter 确认编辑
			</p>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:400,
 title:'超级表格',
 layout:'fit',
 items:[
   new Ext.grid.EditorPasteCopyGridPanel({
       id:'insertTest',
       hideRowNumberer:false,
       fields:[
         {name:'name',header:'姓名',editor:new Ext.form.TextField({})},
         {name:'sex',header:'性别',editor:new Ext.form.TextField({})},
         {name:'other',header:'其他',editor:new Ext.form.TextField({})}
       ],
       listeners:{
         paste:function(){
           alert('paste');
         }
       },
       storeConfig:{data:[
        {name:'赖君玉',sex:0,other:'xxx'},
        {name:'张三',sex:1,other:'ddd'}
        ]
       },
       tbar:[
        {text:'insertFirst',handler:function(bt){
           Ext.getCmp('insertTest').insertFirst({});
        }},
        {text:'insertLast',handler:function(bt){
           Ext.getCmp('insertTest').insertLast({});
        }} ,
        {text:'insertBefore',handler:function(bt){
           var grid=Ext.getCmp('insertTest');
           grid.insertBefore({name:'前插'},grid.getSelected());
        }},
         {text:'insertAfter',handler:function(bt){
           var grid=Ext.getCmp('insertTest');
           grid.insertAfter({name:'后插'},grid.getSelected());
        }},
         {text:'deleteRow',handler:function(bt){
           var grid=Ext.getCmp('insertTest');
           grid.deleteRow(grid.getSelected());
        }},
         {text:'print',handler:function(bt){
           var grid=Ext.getCmp('insertTest').print();
           
        }}                               
       ]
   })
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>





		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


	</body>
</html>