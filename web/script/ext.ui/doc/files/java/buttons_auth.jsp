<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
<head>
<title>按钮权限文档</title>
<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
</head>
<body>

	<pre class="brush:javascript;" code="code">
/**
* 全局配置
* 如果没找到按钮权限的返回值 可以根据自己的需求进行配置
**/

Auth.defaults='-';


        </pre>
	<pre class="brush:javascript;" code="code">
/**
* 通过key查询是否有次按钮的权限
* @param key{string} 必选 和权限配置中的 按钮代码 对应
* @param groupName{string} [可选] 分组名称
**/

 Auth.hasButton(key,groupName)


        </pre>
        
	<pre class="brush:javascript;" code="code">
/**
* 通过角色code查询用户是否有该角色
* @param code{string} 必选 角色代码或者角色名称
**/

 Auth.hasRole(code)


        </pre>        

	<pre class="brush:javascript;" code="code">
/**
* 通过config.key 查询按钮
* @param config{object} 自定义配置里面必须包含key
* @param groupName{string} 分组名称 用于区分不同分组的按钮
* @param fn(boolean found ,Object config, Object dbConfig):Object  found 是否有权限，config 原始配置，dbConfig 数据库配置;[需要返回值] 
**/

 Auth.getButton(config,groupName,fn)


        </pre>


	<pre class="brush:javascript;" code="code">
/**
* 通过configs数组批量查询按钮
* @param configs{Array}
* @param groupName{string} 分组名称 用于区分不同分组的按钮
*  @param fn(boolean found ,Object config, Object dbConfig):Object  found 是否有权限，config 原始配置，dbConfig 数据库配置;[需要返回值] 
**/

Auth.getButtons(configs,groupName,fn)


        </pre>

<div style="padding-left:10px;">
<font color=red size=6>使用例子</font>
</div>

<div style="padding-left:10px;">
 1、 (卫华)在页面中引如下代码注意却掉 "\"
  <textarea style="display:block;width:95%;height:40px;">  
    <script type="text/javascript" src="$\{base\}/widgets/buttons.do?menuid=$\{param._menuid\}"></script>
  </textarea>
  <br/>
   1、 (修修)在页面中引如下代码注意却掉 "\"
  <textarea style="display:block;width:95%;height:40px;">  
     <script type="text/javascript" src="${ctx}/admin/common/authorizedOperate.jhtml?menuId=$\{param.menuId\}"></script>
  </textarea>
</div>

<div style="padding-left:10px;">
 2、 在Ext 中 tbar 获得按钮的代码
 <pre class="brush:javascript;" code="code">
      var tbar=[
             new Ext.ui.SearchField({
             width:150,
             emptyText:'请输入type',
             listeners:{
               search:function(isSearch,field){
               	  var store= Ext.getCmp('t_sys_sql').store;
                  if(isSearch){
                     store.baseParams['type']=field.getValue();
                  }else{
                     delete store.baseParams['type'];   
                  }
                  store.load({params:{start:0}});
               }
             }
           }),
           '->',
           '-',
           Auth.getButton({
             text:'增加一行',
             key:'toadd',// 和数据库对应
             iconCls:'add',
             handler:function(){
               Ext.getCmp('t_sys_sql').insertFirst();
             }
           }),
           Auth.getButton({
             text:'删除一行',
             key:'todelete',// 和数据库对应
             iconCls:'row-delete',
             handler:function(){
               var g=Ext.getCmp('t_sys_sql');
               if(g.getSelected()){
                 g.deleteRow();                
               }else{
                 Ext.tip("提示","<font color=red>请选择一行!</font>")                        
               }
             }
           }) ];
 </pre>
</div>

	<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
</body>

</html>