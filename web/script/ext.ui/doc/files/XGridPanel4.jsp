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
<script type="text/javascript" src="../../ux/GridSummary.js"></script>
<script type="text/javascript" src="../../XPagingToolbar.js"></script>
<script type="text/javascript" src="../../XGridPanel.js"></script>
<script type="text/javascript"
	src="${base}/widgets/tableMeta.do?tablename=T_SYS_LOG"></script>
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
		<p>grid summary</p>
		<p>可用的summaryRenderer : sum/min/max/average/count</p>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:360,
 height:200,
 title:'grid summary',
 layout:'fit',

 items:[
   new Ext.ui.XGridPanel({     
       summary:true,// 设置统计
       fields:[
         {name:'name',header:'姓名',editor:new Ext.form.TextField({})},    
         {name:'grade',header:'语文成绩',summaryRenderer:"sum"},// 调用默认统计sum/min/max/average/count
         {name:'grade2',header:'数学成绩',summaryRenderer:function(vs,rs,p){// 自定义函数
               p.style="color:red;";
               return "总分数:"+ eval(vs.join("+"));
         }}
       ],
       storeConfig:{data:[
        {name:'赖君玉',grade:0,grade2:60},
        {name:'张三',grade:1,grade2:30},
        {name:'张四',grade:1,grade2:40}
        ]
       }
   })
 ],
 buttons:[
  {text:'显示编辑值',handler:function(){
      var grid=Ext.getCmp('insertTest');
      alert(Ext.encode(grid.getValue()));
  }}
 ]
}).show();

</pre>
		<input type="button" value="运行" class="run" />
	</div>


	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


</body>
</html>