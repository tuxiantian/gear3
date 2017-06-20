<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../CommonStore.js"></script>
		<script type="text/javascript" src="../../ComboBox.js"></script>
		<script type="text/javascript" src="../../ComboPanel.js"></script>
		<script type="text/javascript" src="../../BrowseField.js"></script>
		<script type="text/javascript" src="../../FieldOverride.js"></script>
		<script type="text/javascript" src="../../SearchField.js"></script>
		<script type="text/javascript" src="../../plugins/GridPrinter.js"></script>
		<script type="text/javascript" src="../../plugins/CellActions.js"></script>
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
			<p>
				fields 和metaTable 的混合配置<br/>
				隐藏了metaTable 的配置字段，增加新的字段
			</p>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:600,
 height:400,
 title:'超级表格',
 layout:'fit',
 bodyStyle:'padding:5px 5px',
 items:[
   {
     xtype:'form',
     frame:true,
     itemId:'form1',
     items:[ 
        {
         xtype:'hidden',
         name:'rows',
         itemId:'rows'        
        },
        {
         fieldLabel:'票据名称',
         name:'name',
         anchor:'95%',
         xtype:'textfield',
         allowBlank:false,
         appenders:[{
			xtype:'button',
			text:'clear me',
			handler:function(){
			alert('clear');
			}
	    }]
        },    
        {
         fieldLabel:'开具时间',
         name:'time',
         anchor:'95%',
         xtype:'datefield',
         format:'Y-m-d'
        },           
        new Ext.ui.XGridPanel({
           frame:true,
           formField:'rows',	      
	       height:200,	      
	       anchor:'100%',
	       _editable:true,
	       itemId:'insertTest',
	       fields:[{
	        name:'id',
	        header:'ID'	        
	       },{
	        name:'username',
	        header:'用户名',
	        sortable:true,
	        editor:new Ext.form.TextField({
	        appenders:[{
				xtype:'button',
				text:'clear',
				handler:function(bt){
				alert(bt.master.getValue());
				alert(bt.master.ct.record.data);
				}
				}]
	        })      
	       },{
	        name:'cnname',
	        header:'中文名',
	        qtip:true,
	        renderer:function(v){
	          return '<font color=red>'+v+'</font>'
	        },
	        editor:new Ext.ui.ComBoPanel({
	          listPanel:{
	              xtype:'panel',
	              html:'xxxxxxxxxxxxxxx'
	          }
	        })
	       },{
	        name:'sex',
	        header:'性别',
	        editor: new Ext.ui.ComboBox({
	          anchor:'90%',
	          fieldLabel:'testcombo',
	          storeConfig:{
	            data:[['0','男'],['1','女']]
	          }
            })
	       },{
	         name:'text',
	         header:'xxx',
	         editor:new Ext.form.TextArea({
	           height:50
	         })	       
	       }],
	       storeConfig:{
	         data:[{
	          id:'123',
	          username:'shelton',
	          cnname:'赖君玉,赖君玉,赖君玉,赖君玉',
	          sex:0,
	          text:'sssss'
	         },{
	          id:'122',
	          username:'zhangming',
	          cnname:'张敏',
	          sex:1,
	          text:'sssss'
	         }],
	         id:'id'// 这是分页选中的关键必须有要不然无法重新选中
	       },	       
	       smConfig:{singleSelect:false},
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
        }}                               
       ]	       
	   })
     ]
   }
 ],
 buttons:[
  {text:'编辑记录',handler:function(){
      var grid=Ext.getCmp('insertTest');
      alert(Ext.encode(grid.getValue()));
  }},
  {text:'提交',handler:function(){      
      alert(Ext.encode(Ext.getCmp('form1').getForm().getValues()));
  }},
  {text:'选择值',handler:function(){
      var grid=Ext.getCmp('insertTest');
      var selections=grid.getSelections(),sel=[];
      Ext.each(selections,function(r){
         sel.push(r.data);
      });
      alert(Ext.encode(sel));
  }},
  {text:'设置form 只读',handler:function(bt){
      var form=bt.ownerCt.ownerCt.items.item(0);
      form.setReadOnly(true);      
  }},
    {text:'设置grid可编辑',handler:function(bt){
      var grid=Ext.getCmp('insertTest');
      grid.setEditable(true);      
  }}  
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>		
<hr/>
<font color=red size=12>下面是editgridpanel 部分源码  给editor 动态增加的属性,可以在editor 用到 </font>
<pre class="brush:javascript;">
            if(this.fireEvent("beforeedit", e) !== false && !e.cancel){
                this.editing = true;
                var ed = this.colModel.getCellEditor(col, row);
                if(!ed.rendered){
                    ed.render(this.view.getEditorParent(ed));
                }
                (function(){ // complex but required for focus issues in safari, ie and opera
                    ed.row = row;
                    ed.col = col;
                    ed.record = r;
                    ed.on("complete", this.onEditComplete, this, {single: true});
                    ed.on("specialkey", this.selModel.onEditorKey, this.selModel);
                    /**
                     * The currently active editor or null
                      * @type Ext.Editor
                     */
                    this.activeEditor = ed;
                    var v = this.preEditValue(r, field);
                    ed.startEdit(this.view.getCell(row, col).firstChild, v === undefined ? '' : v);
                }).defer(50, this);
            }
        }
</pre>
		

		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


	</body>
</html>