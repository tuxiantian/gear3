<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../UploadField.js"></script>
	</head>
	<body>		
		
		

		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Window
			</p>
			<pre class="brush:javascript;">
/*
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:300,
 height:200,
 layout:'fit',
 items:[
   {
     xtype:'form',
     fileUpload: true,
     bodyStyle:'padding:5px;',
     items:[
        {
          xtype:'uploadfield',
          uploadFileTypes:['.gif','.tXt','.jpg','.doc'],
          anchor:'90%',
          name:'doc',
          fieldLabel:'文件'
        }
     ]
   }
 ],buttons:[
   {
     text:'上传',
     handler:function(){
        var form=this.ownerCt.items.first();
        if(form.getForm().isValid()){
        form.getForm().submit({
            url: Ext.url('/upload/doUpload.do'),
            waitMsg: 'Uploading your photo...',
            success: function(formpanel, opt){               
                  alert( opt.result.success);                
            }
        });
       }
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