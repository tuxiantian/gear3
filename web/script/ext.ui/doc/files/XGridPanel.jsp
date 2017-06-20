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
		<script type="text/javascript"
			src="${base}/widgets/tableMeta.do?tablename=T_SYS_ZONE,t_sys_sql"></script>
	</head>
	<body>


		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Toolbar
			</p>
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
			<p>
				配置metaTable 显示空白表格
			</p>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:400,
 title:'超级表格',
 layout:'fit',
 items:[
   new Ext.ui.XGridPanel({
       metaTable:'T_SYS_ZONE',
       storeConfig:{data:[]}
   })
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>

		<div class="block">
			<p>
				配置metaTable显示checkbox
			</p>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:400,
 title:'超级表格',
 layout:'fit',
 items:[
   new Ext.ui.XGridPanel({
       metaTable:'T_SYS_ZONE',
       storeConfig:{data:[
        {ZONEID:'xx'},
        {ZONEID:'ab'}
       ]},
       fields:[{name:'ZONECODE',renderer:function(){
         return "oh my god";
       }}],
       smConfig:{singleSelect:true}
   })
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>



		<div class="block">
			<p>
				配置fields 显示表格
			</p>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:400,
 title:'超级表格',
 layout:'fit',
 items:[
   new Ext.ui.XGridPanel({
       fields:[
         {name:'name',header:'姓名'},
         {name:'sex',header:'性别'}
       ],
       storeConfig:{data:[]}
   })
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>



		<div class="block">
			<p>
				配置fields 显示表格 显示数据 调用renderer
			</p>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:400,
 title:'超级表格',
 layout:'fit',
 items:[
   new Ext.ui.XGridPanel({
       fields:[
         {name:'name',header:'姓名'},
         {name:'sex',header:'性别',renderer:function(v){
           if(v==0) return "男";
           else return "女";
         }}
       ],
       storeConfig:{data:[
        {name:'赖君玉',sex:0},
        {name:'张三',sex:1}]
       }
   })
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>
		
		
		<div class="block">
			<p>
				fields 和metaTable 的混合配置<br/>
				隐藏了metaTable 的配置字段，增加新的字段
			</p>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:800,
 height:400,
 title:'超级表格',
 layout:'fit',
 items:[
   new Ext.ui.XGridPanel({
       metaTable:'T_SYS_ZONE',
       itemId:'insertTest',
       fields:[
         {name:'name',header:'姓名',editor:new Ext.form.TextField({allowBlank:false})},
         {name:'ZONECODE',hidden:true},  
         {name:'ZONEID',hidden:true},              
         {name:'ZIPCODE',hidden:true},
         {name:'TELCODE',hidden:true},        
         {name:'sex',header:'性别',renderer:function(v){
           if(v==0) return "男";
           else return "女";
         }}
       ],
       storeConfig:{data:[
        {name:'赖君玉',sex:0,FLAG:'A'},
        {name:'张三',sex:1,FLAG:'B'},
        {name:'张四',sex:1,FLAG:'C'}
        ]
       },
       smConfig:{singleSelect:true},
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
 ],
 buttons:[
  {text:'显示编辑值',handler:function(){
      var grid=Ext.getCmp('insertTest');
      grid.isValid();
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