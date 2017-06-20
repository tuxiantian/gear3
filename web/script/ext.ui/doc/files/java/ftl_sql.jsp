<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ include file="/common/taglibs.jsp"%>
<html>
	<head>
		<title>taglib test</title>
		<%@ include file="/script/ext.ui/doc/common/scripts.jsp"%>
		<script type="text/javascript" src="${base}/script/ext.ui/doc/syntax_highlighter/scripts/shBrushSql.js"></script>
	</head>
	<body>



		<div class="block">

			<pre class="brush:javascript;" code="code">
/**
*为了快速开发，有一个数据表专门存储sql 表格[t_sys_sql]
*该表中的sql 执行走spring NamedJDBCTemplate 不走ibates
*为了兼顾ibates 特性，引入了freemaker 所以可以用freemaker 尽情的写动态sql 吧
*
*/
            </pre>
			
		</div>
<div>
下面的sql 是NamedJDBCTemplate 写法, <font color=red size=6>:name</font> 等同于ibates的<font color=red size=6>#name#</font>
   <pre class="brush:sql;">
insert into T_SYS_SQL(ID,CODE,NOTE,SQL_TEXT,TYPE) values(
 (select max(id)+1 from T_SYS_SQL),
 :CODE,
 :NOTE,
 :SQL_TEXT,
 :TYPE
)
   </pre>
</div>

<div>
下面的查询的sql 使用了freemaker 的语法
   <pre class="brush:sql;">
select * from T_SYS_SQL where 1=1
<#if code1?exists && code1?trim!=''>
  and  CODE like :code1||'%'
</#if>
<#if type?exists && type?trim!=''>
  and  type like :type||'%'
</#if>

   </pre>
</div>


		<%@ include file="/script/ext.ui/doc/common/bottom_script.jsp"%>
	</body>

</html>