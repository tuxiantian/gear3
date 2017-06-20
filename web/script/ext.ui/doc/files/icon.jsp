<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../XToolbar.js"></script>
<script type="text/javascript">
	Ext.onReady(function() {
		function hd(bt) {
			prompt("请复制样式(iconCls)", bt.iconCls);
		}
		new Ext.Viewport({
			layout : 'fit',
			items : [ {
				title : '系统图标(<i>点击复制样式</i>)',
				xtype : 'panel',
				tbar : [ '-', {
					iconCls : 'note_add',
					text : '添加便签',
					handler : hd
				},{
					iconCls : 'audit',
					text : '审计',
					handler : hd
				}, '-', {
					iconCls : 'next',
					text : '下一步',
					handler : hd
				}, '-', {
					iconCls : 'previous',
					text : '上一步',
					handler : hd
				}, '-', {
					iconCls : 'query',
					text : '查询',
					handler : hd
				}, '-', {
					iconCls : 'print',
					text : '打印',
					handler : hd
				}, '-', {
					iconCls : 'refresh',
					text : '刷新1',
					handler : hd
				}, {
					iconCls : 'x-tbar-loading',
					text : '刷新2',
					handler : hd
				}, '-', {
					iconCls : 'return',
					text : '返回',
					handler : hd
				},{
					iconCls : 'bin-closed',
					text : '作废',
					handler : hd
				}, '|',//------------------------------------------------
				'-', {
					iconCls : 'add',
					text : '添加',
					handler : hd
				}, '-', {
					iconCls : 'cancel',
					text : '取消',
					handler : hd
				}, '-', {
					iconCls : 'config',
					text : '配置',
					handler : hd
				}, '-', {
					iconCls : 'del',
					text : '删除',
					handler : hd
				}, '-', {
					iconCls : 'ok',
					text : '确定',
					handler : hd
				}, '-', {
					iconCls : 'view',
					text : '查看',
					handler : hd
				}, '-', {
					iconCls : 'save',
					text : '保存',
					handler : hd
				}, '-', {
					iconCls : 'redo',
					text : '重做',
					handler : hd
				}, '-', {
					iconCls : 'edit',
					text : '修改',
					handler : hd
				}, '|',//------------------------------------------------,
				'-', {
					iconCls : 'link',
					text : '链接',
					handler : hd
				}, '-', {
					iconCls : 'rename',
					text : '重命名',
					handler : hd
				}, '-', {
					iconCls : 'email_send',
					text : '发送邮件',
					handler : hd
				}, '-', {
					iconCls : 'replace',
					text : '替换',
					handler : hd
				}, '-', {
					iconCls : 'move',
					text : '移动',
					handler : hd
				}, '-', {
					iconCls : 'publish',
					text : '发布',
					handler : hd
				}, '-', {
					iconCls : 'view_list',
					text : '查看列表',
					handler : hd
				}, '|',//------------------------------------------------		               
				'-', {
					iconCls : 'permission',
					text : '权限',
					handler : hd
				}, '-', {
					iconCls : 'upload',
					text : '上传',
					handler : hd
				}, '-', {
					iconCls : 'folder',
					text : '文件夹',
					handler : hd
				}, '-', {
					iconCls : 'copy',
					text : '复制',
					handler : hd
				}, '-', {
					iconCls : 'accept',
					text : '可以',
					handler : hd
				}, '-', {
					iconCls : 'script_go',
					text : '执行',
					handler : hd
				}, '-', {
					iconCls : 'script_add',
					text : '增加执行',
					handler : hd
				}, '-', {
					iconCls : 'chart_organisation',
					text : '组织结构',
					handler : hd
				}, '|',//--------------------------------------------------------- 华丽分割线      
				'-', {
					iconCls : 'arrow_switch',
					text : '交换',
					handler : hd
				}, '-', {
					iconCls : 'flag_red',
					text : '红标',
					handler : hd
				}, '-', {
					iconCls : 'flag_noRed',
					text : '灰标',
					handler : hd
				}, '-', {
					iconCls : 'ding',
					handler : hd
				}, '-', {
					iconCls : 'Noding',
					handler : hd
				}, '-', {
					iconCls : 'ns-collapse',
					text : '收缩',
					handler : hd
				}, '-', {
					iconCls : 'ns-expand',
					text : '展开',
					handler : hd
				}, '-', {
					iconCls : 'achive',
					text : '归档',
					handler : hd
				}, '-', {
					iconCls : 'lock',
					text : '锁定',
					handler : hd
				}, '-', {
					iconCls : 'tree',
					text : '树',
					handler : hd
				}, '-', {
					iconCls : 'person',
					text : '人',
					handler : hd
				}, {
					iconCls : 'user',
					text : '用户',
					handler : hd
				}, '|',//-------------------------------------------------------------
				'-', {
					iconCls : 'row-delete',
					text : '删除一行',
					handler : hd
				}, {
					iconCls : 'row-add',
					text : '添加一行',
					handler : hd
				}, {
					iconCls : 'row-add-before',
					text : '前插',
					handler : hd
				}, {
					iconCls : 'row-add-after',
					text : '后插',
					handler : hd
				}, '|',//-------------------------------------------------------------
				{
					iconCls : 'x-xls-icon',
					text : 'excel',
					handler : hd
				}, {
					iconCls : 'x-help-icon',
					text : '帮助',
					handler : hd
				}, {
					iconCls : 'x-flow',
					text : '流程',
					handler : hd
				}, '|',//-------------------------------------------------------------
				'状态旗帜图标', '|',//-------------------------------------------------------------
				{
					iconCls : 'flag-blue',
					text : '蓝色',
					handler : hd
				}, {
					iconCls : 'flag-green',
					text : '绿色',
					handler : hd
				}, {
					iconCls : 'flag-orange',
					text : '橙色',
					handler : hd
				}, {
					iconCls : 'flag-pink',
					text : '粉色',
					handler : hd
				}, {
					iconCls : 'flag-purple',
					text : '紫色',
					handler : hd
				}, {
					iconCls : 'flag-red',
					text : '红色',
					handler : hd
				}, {
					iconCls : 'flag-yellow',
					text : '黄色',
					handler : hd
				}, {
					iconCls : 'flag-gray',
					text : '灰色',
					handler : hd
				} ]

			}

			]

		});

	});
</script>
</head>
<body>


</body>
</html>