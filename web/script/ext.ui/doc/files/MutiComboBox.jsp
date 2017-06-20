<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../CommonStore.js"></script>
		<script type="text/javascript" src="../../ComboBox.js"></script>
		<script type="text/javascript" src="../../MutiComboBox.js"></script>
	</head>
	<body>
		
		
		
<div class="block">
<font> 二维数组作为数据源</font>
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        new Ext.ui.MutiComboBox({
          anchor:'90%',
          fieldLabel:'testcombo',
          storeConfig:{
            data:[['good','很好'],['bad','老好']]
          }
        })
     ]
   }

 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>

<div class="block">
<font> json 数组作为数据源默认选择第一条记录</font>
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        new Ext.ui.MutiComboBox({
          anchor:'90%',
          fieldLabel:'testcombo',
          selectFirst:true,
          storeConfig:{
            data:[{ID:'good',TEXT:'男'},{ID:'bad',TEXT:'女'}]
          }
        })
     ]
   }

 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>


<div class="block">
<font>自定义fields</font>
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        new Ext.ui.MutiComboBox({
          anchor:'90%',
          fieldLabel:'testcombo',
          displayField:'cnname',
          valueField:'username',          
          storeConfig:{
            fields:['username','cnname',],
            data:[{username:'user1',cnname:'张三'},{username:'user2',cnname:'李四'}]
          }
        })
     ]
   }

 ]
}).show();
</pre>
<input type="button" value="运行" class="run" />
</div>


<div class="block">
<font>Url Json数据源</font>
<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     items:[
        new Ext.ui.MutiComboBox({
          anchor:'90%',
          fieldLabel:'testcombo',
          hiddenName:'test',         
          storeConfig:{          
            url:Ext.url('/widgets/getCombo.do?code=_HrPositionStatus')
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