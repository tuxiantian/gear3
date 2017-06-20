<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>taglib test</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
<script type="text/javascript" src="../../CommonStore.js"></script>
<script type="text/javascript" src="../../ComboBox.js"></script>
<script type="text/javascript" src="../../MutiComboBox.js"></script>
<script type="text/javascript" src="../../XToolbar.js"></script>
</head>
<body>


	<div class="block">
		<font>代码示例</font>
		<p>extends Ext.Toolbar</p>
		<pre class="brush:javascript;">
/*
 * |竖线支持换行多行代码 请仔细查看下图代码
 */
 </pre>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
 width:500,
 height:400,
 title:'多行toolbar',
 tbar:[
  '-',{text:'hello1'},{
    xtype:'muticombo',
    enableSearch:true,
    name:'name2',
    width:200,
    storeConfig:{url:Ext.url('/widgets/getCombo.do?code=_HrPositionStatus')}// 对应treeConfig中的url
  },{text:'delete'},'|',
  '-',{text:'hello2'},'->',{text:'add'},'|',
  '-',{text:'hello3'},'->',{text:'edit'},'|',
  '-',{text:'hello4'},{
    xtype:'combobox',
    name:'name1',
    width:200,
    storeConfig:{url:Ext.url('/widgets/getCombo.do?code=_HrPositionStatus')}// 对应treeConfig中的url
  },{text:'getValue',handler:function(bt){
      
  }}
 ],
 layout:'anchor',
 items:[
   {
     xtype:'tabpanel',
     activeTab:0,
     items:[{
        xtype:'panel',
        title:'test',
        html:'sdfsdfsdfsd'}
     ]
   }
 ],buttons:[
    {
      text:'获取控xxxxxxxxxxxx件的值',
      handler:function(bt){
        alert(Ext.encode(bt.ownerCt.getTopToolbar().getValues()));
      }
    },{
       text:'test'
    
    }
 
 ]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>

	<div class="block">
		<font>代码示例</font>
		<p>extends Ext.Toolbar</p>
		<pre class="brush:javascript;">
/*
 * enableOverflow:true  支持溢出弹出菜单
 */
 </pre>
		<pre class="brush:javascript;" code="code">
new Ext.Window({
  width:200,
  height:200,
  items:[{
    xtype:'toolbar',
    enableOverflow:true,
    items:[{text:'sdfasdf'},{text:'sdfasdf'},{text:'sdfasdf'},{text:'sdfasdf'},{text:'sdfasdf'},'|'
    ,{text:'sdfasdf'},{text:'sdfasdf'},{text:'sdfasdf'},{text:'sdfasdf'},{text:'sdfasdf'}]
  }]
}).show();
</pre>
		<input type="button" value="运行" class="run" />
	</div>

	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>


</body>
</html>