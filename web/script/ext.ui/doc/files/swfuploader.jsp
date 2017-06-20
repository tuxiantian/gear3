<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>swfuploader</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../swfuploader/swfupload.js"></script>
<script type="text/javascript" src="../../swfuploader/UploaderPanel.js"></script>
</head>
<body>
	<div class="block">
		<font size=8 color=red>源文件在UploaderPanel.js中</font>
		<p></p>

		<pre class="brush:javascript;" code="code">	
	new Ext.Window({
				width : 600,
				title : 'swfUpload 例子',
				height : 300,
				layout : 'fit',
				items : [{
							xtype : 'uploadpanel',
							border : false,
							fileSize : 1024 * 550,// 限制文件大小
							uploadUrl :  Ext.url('/upload/doUpload.do'),// 上传文件地址
							flashUrl : '../../swfuploader/swfupload.swf',
							filePostName : 'doc', // 后台文件参数名
							fileTypes : '*.*',// 可上传文件类型
							postParams : {
								savePath : 'upload'// 自定义传递参数
							} 
						}]
			}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>


	</script>
	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>
</html>
