<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../IPanel.js"></script>
	</head>
	<body>


		<div class="block">
			<font>代码示例</font>
			<p>
				extends Ext.Window
			</p>
			<pre class="brush:javascript;">
/*
 * @config src　　　　// iframe url
 * @config firameId // iframe ID
 * @public method {htmlElement getIframe(void)} 
 */
 </pre>
			<pre class="brush:javascript;" code="code">
new Ext.ui.IPanel({
 title:'iframe panel',
 width:800,
 renderTo:'panel',
 itemId:'test',
 height:400,
 src:'/gear/script/ext.ui/doc/files/icon.jsp',
 buttons:[{
   text:'提交',
   handler:function(bt){     
      bt.ownerCt.loadPage('/gear/script/ext.ui/doc/files/ImageField.jsp?'+Ext.id(),function(iframe){
        alert('loaded'+iframe);
      })
   }
 },{
   text:'最大化',
   handler:function(){
       Ext.getCmp('test').maximize();
   }
 
 },{
    text:'恢复',
    handler:function(){
      Ext.getCmp('test').restore();
    }
 }]
})
</pre>
			<input type="button" value="运行" class="run" />
		</div>




		<div id="panel">
		</div>
<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>		
	</body>

</html>