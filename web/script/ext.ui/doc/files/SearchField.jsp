<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../SearchField.js"></script>
	</head>
	<body>


		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.form.TwinTriggerField
			</p>
			<p>
				event search
			</p>
			<p>
				void search(boolean isSearch,field);
			</p>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        new Ext.ui.SearchField({
          anchor:'90%',
          fieldLabel:'testcombo',
          name:'test',
          listeners:{
             search:function(isSearch,combo){
               alert(isSearch?'你点击搜索,值为:'+combo.getValue():'你点击删除');
             }
          }
        })
     ]
   }
 ],
 buttons:[{
   text:'重置',handler:function(bt){
      bt.ownerCt.items.first().getForm().reset();
   }},{
   text:'提交',
   handler:function(bt){
      alert(bt.ownerCt.items.first().getForm().getValues(true));
   }   
 }]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>

		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
	</body>
</html>