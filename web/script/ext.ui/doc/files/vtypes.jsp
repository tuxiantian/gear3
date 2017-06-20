<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../vtypes.js"></script>
</head>
<body>


	<div class="block">
		<font size=8 color=red>vtype 使用代码示例</font>
		<p>override from Ext.form.VTypes 源代码可以到vtypes.js 文件中知道</p>

		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:500,
 autoHeight:true,
 layout:'fit',
 items:[
   {
     xtype:'form',  
     id:'testform',
     labelWidth:120, 
     autoHeight:true,
     bodyStyle:'padding:5px;',
     defaults:{
       xtype:'textfield',
       anchor:'90%'
     },
     items:[
        {
          fieldLabel:'字母和下划线'   ,
          vtype:'alpha'
        },{
          fieldLabel:'字母数字和下划线'  , 
          vtype:'alphanum'
        },{
          fieldLabel:'点子邮件地址',   
          vtype:'email'
        }
        ,{
          fieldLabel:'链接地址' ,  
          vtype:'url'
        }
        ,{
          fieldLabel:'必须输入中文'   ,
          vtype:'chinese'
        },{
          fieldLabel:'必须输入中文日期'   ,
          vtype:'datecn'
        },{
          fieldLabel:'固定电话号码',
          vtype:'phone'
        },{
          fieldLabel:'手机号码' ,  
          vtype:'mobilephone'
        },{
          html:'<font color=red>下面是数字验证</font>---------------------------------------' ,  
          xtype:'label'
        },{
          fieldLabel:'大于1 小于999 整数' ,  
          xtype:'numberfield',
          allowNegative:false,// 不容许负值
          allowDecimals:false,// 不容许小数
          minValue:1,
          maxValue:999
        },{
          fieldLabel:'精度为2的小数' ,  
          xtype:'numberfield',
          decimalPrecision:2// 两位小数
        }
     ]
   }
 ],
 buttons:[
   {
	   text:'validate',
	   handler:function(){
	      Ext.getCmp('testform').getForm().isValid();
	   }
   }
 ]
}).show();

</pre>
		<input type="button" value="运行" class="run" />
	</div>




	<div id="panel"></div>
	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>

</html>