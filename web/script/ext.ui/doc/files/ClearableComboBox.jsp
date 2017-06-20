<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../CommonStore.js"></script>
		<script type="text/javascript" src="../../ComboBox.js"></script>
		<script type="text/javascript" src="../../ClearableComboBox.js"></script>
	</head>
	<body>


<div class="block">
<font>代码示例</font>
<p>extends Ext.ui.ComboBox</p>
<p>event afterclear</p>
<p>void afterclear(Ext.ui.ClearableComboBox combo);</p>
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        new Ext.ui.ClearableComboBox({
          anchor:'90%',
          fieldLabel:'testcombo',
          hiddenName:'test',
          displayField:'TEXT',
          valueField:'ID',          
          storeConfig:{
                data:[
                  ["abc","test1"],
                  ["abcef","test2"]
                ]
          },
          listeners:{
             afterclear:function(combo){
               alert('你点击清除');
             },
             select:function(combo){
               alert('你选择中值为：'+combo.getValue());
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