<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../CommonStore.js"></script>
<script type="text/javascript" src="../../plugins/GridPrinter.js"></script>
<script type="text/javascript" src="../../plugins/CellActions.js"></script>
<script type="text/javascript" src="../../XPagingToolbar.js"></script>
<script type="text/javascript" src="../../XGridPanel.js"></script>
<script type="text/javascript" src="../../ComboPanel.js"></script>
</head>
<body>
	<div class="block">
		<font color="#ff0000"> Ext.ui.ComBoPanel示例：</font><br />
		默认需要初始化listPanel，listPanel 可以配置为Ext.Panel 的实例或者子类实例
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'combopanel'
   }
 ]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>
	<hr>
	<div class="block">
		<font color="#ff0000"> 配置ListPanel 为gridpanel 代码示例：</font><br /> <img
			alt="combopanel.jpg" src="resource/img/combopanel.jpg">
		<pre class="brush:javascript;">
/*
*@extend from Ext.form.ComboBox
*@cfg{object} listPanel 
*@cfg{function} listPanel.onQuery 用户键盘输入触发
*@cfg{function} listPanel.onReset   combo 重置触发
*@event empty   按下删除键触发
*/
</pre>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'combopanel',
     hiddenName:'test',
     forceSelection:false,
     emptyText:'请输入code 进行检索',
     listWidth:400,
     listPanel:  new Ext.ui.XGridPanel({       
       keepSelection:true,// 设置翻页显示
       storeConfig:{
         url:'/gear'+'/common/extPaging.do',
         baseParams:{
           sqlCode:'t_sys_sql'        
         },         
         id:'ID'// 这是分页选中的关键必须有要不然无法重新选中
       },
       fields:[{
           name:'CODE',
           header:'CODE'        
       },{
         name:'SQL_TEXT',
         width:200,
         qtip:true  
       }],       
       pagingConfig:{pageSize:10,displayInfo:false},
       smConfig:{singleSelect:false},
       onReset:function(combo){
           this.clearSelections();
       },
       onQuery:function(e){
          this.toSearch('code1',e.query);
       },
       buttons:[{
         text:'确定',
         handler:function(bt){
            var grid=bt.ownerCt.ownerCt;
            var value=[],text=[],rs=grid.getSelections();
            Ext.each(rs,function(r){
                value.push(r.data['CODE']);
                text.push(r.data['SQL_TEXT']);
            });
            grid.getCombo().setValue(value.join(','),text.join(','));
            grid.getCombo().collapse();
         }
       }]
   })
   }
 ],
 buttons:[{
   text:'reset',
   handler:function(bt){
      bt.ownerCt.ownerCt.items.item(0).reset();
     }
   },
   {
     text:'value',
     handler:function(bt){
       alert( bt.ownerCt.ownerCt.items.item(0).getValue());
     }
   }
 ]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>

	<hr>

	<div class="block">
		<font color="#ff0000"> 下面的例子是继承的写法，因为依赖另外的表格无法在这儿运行</font><br /> <img
			alt="combopanel.jpg" src="resource/img/combopanel.jpg">
		<pre class="brush:javascript;">
/*
*@extend from Ext.form.ComboBox
*@cfg{object} listPanel 
*@cfg{function} listPanel.onQuery 用户键盘输入触发
*@cfg{function} listPanel.onReset   combo 重置触发
*/
</pre>
		<pre class="brush:javascript;" code="code">
Ext.ns('formBind');
formBind.FormComboGrid = Ext.extend(Ext.ui.ComBoPanel, {
	listWidth : 400,
	emptyText : '请输入模版名称进行检索',
	initComponent : function() {
		this.listPanel = listPanel = new form.FormGrid({
			tbar : [],
			fields : [{
				name : 'ID',
				display : false,
				header : '表单CODE'
			}, {
				name : 'FORM_NAME',
				header : '表单名称'
			}, {
				name : 'FORM_PATH',
				header : '表单路径'
			}],
			pagingConfig : {
				pageSize : 10,
				displayInfo : false
			},
			smConfig : {
				singleSelect : true
			},
			// combo 发送重置事件
			onReset : function(combo) {
				this.clearSelections();
			},
			// combo 发送查询事件
			onQuery : function(e) {
				this.toSearch('FORM_NAME', e.query);
			},
			// 确定某行被选中
			comfirmSelect : function() {
				var grid = this
				r = grid.getSelected();				
				grid.getCombo().setValue(r.data['ID'], r.data['FORM_NAME']);
				grid.getCombo().collapse();
				grid.getCombo().clearInvalid();
			},
			listeners : {
				rowdblclick : function(grid) {
					grid.comfirmSelect();
				}
			},
			buttons : [{
				text : '确定',
				handler : function(bt) {
					var grid = bt.ownerCt.ownerCt;
					grid.comfirmSelect();
				}
			}]
		});
		formBind.FormComboGrid.superclass.initComponent.apply(this, arguments);
	}

});

</pre>
	</div>
	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>
</html>