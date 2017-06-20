<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../../FieldOverride.js"></script>
		<script type="text/javascript" src="../../../ux/TableFormLayout.js"></script>
	</head>
	<body>


		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Toolbar
			</p>
			<pre class="brush:javascript;">
/*
 * colspan 和并列
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:600,
 height:400, 
 title:'tableform 布局',
 bodyBorder:false, 
 items:[
   {
     xtype:'form',
     labelWidth:60,
     border:false,
     layout:'tableform',    
     layoutConfig:{
       columns:2
     },
     defaults:{
       xtype:'textfield',
       anchor:'80%'
     },
     items:[
       {xtype:'hidden' ,name:'xxx'},
        {
          fieldLabel:'label1',
          itemId:'test',
          appenders:[
            {
              xtype:'label',
              html:'<font color=red>*</font>该项目必填'
            }
          ]
        },{
          fieldLabel:'label2'
        },{
          fieldLabel:'label3'
          
        },{
          fieldLabel:'label4'
        },{
          fieldLabel:'label5'
        },{
          fieldLabel:'label6'
        },{
           colspan:2,
          fieldLabel:'label7'
        }
     ]

   }
 ]
}).show();
</pre>
			<input type="button" value="运行" class="run" />
		</div>

		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


	</body>
</html>