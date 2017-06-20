<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>欢迎使用 Ext3.41 扩展文档</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="../../ui-all.js"></script>
		<script type="text/javascript" src="doc.js"></script>
		<style type="text/css">
		  .x-tree-node-anchor span{
            cursor:pointer;
         }
		</style>		
	</head>
	<body>

		<div id="north" style="padding: 0 5; line-height: 30px; font-size:18px;">
			<h1>
				欢迎使用 Ext3.41 扩展文档
			</h1>
		</div>
		<div id="home" style="padding: 5;font-size:12px; line-height: 18px;">
			<p>
				通用组建的封装是为了减少开发的时间，提高工作效率。但是封装也带来的新的API不利于新手学习原生的API。
				<br>
				封装的目的就是需要简化API，原生的API也必须能够使用。
				<br>
				为了达到此目的我们需要遵守一些约定，通过这些约定来简化记忆。
				<br>
				例如：
				<font color="#408080">Ext.ui.AsyncTreePanel</font>
				<br>
			</p>
			<p>
				该控件简化了异步树初始化过程。
			</p>
			<p>
				一般的树的初始化过程是这样的：
			</p>
			<p>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				var tree = new Tree.TreePanel({
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				el:'tree',
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				animate:true,
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				autoScroll:true,
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<strong><font color="#ff0000">loader: new
						Tree.TreeLoader({dataUrl:'get-nodes.php'})</font>
				</strong><br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				});&nbsp;&nbsp;&nbsp;
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				// set the root node
				<br>
				<strong><font color="#ff0000">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						var root = new Tree.AsyncTreeNode({<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						text: 'Ext JS', <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						draggable:false, // disable root node dragging<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						id:'source'<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						});</font>
				</strong>
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				tree.setRootNode(root);
			</p>
			<p>
				一个树的初始化需要包含
				<strong><font color="#ff0000"> Tree.TreeLoader </font>
				</strong>和
				<strong><font color="#ff0000"> Tree.AsyncTreeNode </font>
				</strong>两个组建，树初始化需要记忆API也相当的大。
			</p>
			<p>
				下面是
				<font color="#408080">Ext.ui.AsyncTreePanel </font>的初始化
			</p>
			<p>
				&nbsp; new Ext.ui.AsyncTreePanel({
				<br>
				&nbsp;&nbsp; rootConfig:{
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp; id:'1',
				<br>
				&nbsp;&nbsp;&nbsp;&nbsp; text:'组织机构'
				<br>
				&nbsp;&nbsp; },
				<br>
				&nbsp;&nbsp; //,loaderConfig:{}
				<br>
				&nbsp;&nbsp; url:_base+'/widgets/getTree.do?code=dept'
				<br>
				&nbsp; });
			</p>
			<p>
				&nbsp;可以可看出非常的简单，但是需要另外记忆rootConfig 和url ,loaderConfig这些新的API。
			</p>
			<p>
				&nbsp;如果遵循约定也是非常好记忆的下面就是这些约定(欢迎补充):
			</p>
			<p>
				&nbsp;1、如果组建中需要初始化子组建那么通过
				<font color="#ff0000">子组建名+Config&nbsp;</font> 来记忆子组建配置
			</p>
			<p>
				&nbsp;2、如果组建需要json 数据，那么用&nbsp;
				<font color="#ff0000">url </font>来表示这个链接。
			</p>
		</div>
	</body>
</html>