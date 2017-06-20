<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../ux/Spinner.js"></script>
<script type="text/javascript" src="../../ux/SpinnerField.js"></script>
<script type="text/javascript" src="../../ux/DateTimeField.js"></script>
</head>
<body>



	<div class="block">
		<font>代码示例</font>
		<p>覆盖Ext.form.Field</p>
		<pre class="brush:javascript;">
/*
 * @config appenders(Array) 添加附加项目
 */
 </pre>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:550,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',    
     bodyStyle:'padding:5px;',
     items:[
            {
            	xtype: 'datetimefield',
            	width:140,
            	fieldLabel: 'Test',
            	value:'2009-10-24 10:46',
            	format : 'Y-m-d H:i',                
            	name: 'test'
            },{
            	xtype: 'datefield',
            	width:140,
            	emptyText:'我的日期',
            	fieldLabel: 'Test',
            	format : 'Y-m-d',                
            	name: 'testb'                
            }
     ]
   }
 ],
 buttons:[
    {
      text:'忽略emptyText',
      handler:function(bt){
       alert( bt.ownerCt.items.item(0).getForm().getValues(true,true))
      }
    },
    {
      text:'包含emptyText',
      handler:function(bt){
       alert( bt.ownerCt.items.item(0).getForm().getValues(true))
      }
    }
 ]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>


	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>

</html>