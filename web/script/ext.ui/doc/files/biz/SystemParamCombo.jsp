<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
</head>
<body>

	<p>Ext.ui.biz.SystemParamCombo 的扩展可以到
		wherp/script/biz/SystemParamCombo.js中找到源代码</p>
	<div class="block">
		<pre class="brush:javascript;">
/**
 * params 参数配置  
 * @config TABLE_NAME {String}该参数针对的表名 reqiured
 * @config FIELD {String} 该参数针对的字段名 required
 * @config FIELD_NAME {String}该参数针对的字段名备注 optional
 * @cofig title {boolean} 显示不显示添加按钮
 */
 </pre>
	</div>

	<div class="block">
		下面的代码展示如何使用<br /> 展开下拉列表点击“添加”链接<br /> <img src='img/list.jpg'><br />
		弹出添加窗口<br /> <img src='img/addwindow.jpg'><br />
		<pre class="brush:javascript;">
		Ext.onReady(function() {
			new Ext.Window({
				width : 300,
				height : 200,
				layout : 'fit',
				items : [ {
					xtype : 'form',
					items : [ new Ext.ui.biz.SystemParamCombo({
						anchor : '90%',
						hiddenName : 'testname',
						fieldLabel : 'testcombo',
						linkText : '添加',
						params : {
							'TABLE_NAME' : 'T_MPS_SALES_ORDER',
							'FIELD' : 'STATUS',
							'FIELD_NAME' : '状态'
						}
					}) ]
				} ],
				buttons : [
						{
							text : '重置',
							handler : function(bt) {
								bt.ownerCt.items.first().getForm().reset();
							}
						},
						{
							text : '提交',
							handler : function(bt) {
								alert(bt.ownerCt.items.first().getForm()
										.getValues(true));
							}
						} ]
			}).show();
		});
 </pre>

	</div>




	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


</body>
</html>