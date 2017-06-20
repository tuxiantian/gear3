<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
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
<script type="text/javascript"
	src="${base}/widgets/tableMeta.do?tablename=T_SYS_SQL"></script>
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
			fields 和metaTable 的混合配置<br /> 隐藏了metaTable 的配置字段，增加新的字段
		</p>
		<pre class="brush:javascript;" code="code">


var win = new Ext.Window({
	width : 600,
	height : 400,
	title : '超级表格',
	layout : 'fit',
	items : [new Ext.ui.XGridPanel({
		view : new Ext.grid.GroupingView({
			groupTextTpl : '{text} ({[values.rs.length]} 条)'
		}),		
		metaTable : 'T_SYS_SQL',
		hideRowNumber:false,
		itemId:'insertTest',      
		smConfig:{
		   singleSelect:false
		},		
		storeConfig : {
			url : '/gear' + '/common/extPaging.do',
			groupField : 'TYPE',
			slaveGroupField:'ID',
			group : true,
		    sortInfo:{field: 'TYPE', direction: "ASC"},
			baseParams : {
				sqlCode : 't_sys_sql'
			}			
		},
		pagingConfig : {
			pageSize : 10
		},
  buttons:[
  {text:'编辑记录',handler:function(){
      var grid=Ext.getCmp('insertTest');
      alert(Ext.encode(grid.getValue()));
  }},
  {text:'选择中值',handler:function(){
      var grid=Ext.getCmp('insertTest');
      var selections=grid.getSelections(),sel=[];
      Ext.each(selections,function(r){
         sel.push(r.data);
      });
      alert(Ext.encode(sel));
  }}, 
  {text:'打印',handler:function(){
      var grid=Ext.getCmp('insertTest');
      grid.print();
  }},
  {text:'excel 导出',handler:function(){
      var grid=Ext.getCmp('insertTest');
      grid.excel({	
			fileName : 'excel导出',// 文件名 
			start : 0, // 记录开始位置
			limit : Ext.consts.maxRow// 最大记录
			});
  }}  ,
   {text:'deleteRow',handler:function(bt){
     var grid=Ext.getCmp('insertTest');
     grid.deleteRow(grid.getSelected());
  }},
  {text:'插入到首行',handler:function(){
      var grid=Ext.getCmp('insertTest');
       grid.insertLast({
         ID:Ext.id(),
         TYPE:parseInt(Math.random()*10,10)%3
       });   
       grid.store.refreshGroup();      
  }} ,  
  {text:'插入末行',handler:function(){
      var grid=Ext.getCmp('insertTest');
       grid.insertLast({
         ID:Ext.id(),
         TYPE:parseInt(Math.random()*10,10)%3
       });   
       grid.store.refreshGroup();        
      
  }}      
 ]
	})]
});
win.show();

</pre>
		<input type="button" value="运行" class="run" />
	</div>



	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


</body>
</html>