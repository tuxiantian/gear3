<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<link rel="stylesheet" type="text/css" href="${base}/script/ext341/resources/css/ext-all.css" />
<link rel="stylesheet" type="text/css" href="${base}/script/ext341/resources/css/customer.css" />
<link rel="stylesheet" type="text/css" href="${base}/style/ext-icon.css"/>
<script>
  var _ctx={base:'${pageContext.request.contextPath}',zoneName:'${user.zoneName}',deptName:'${user.deptName}'};
  var _jsessionid = '<%=request.getSession().getId()%>';
  var _base='${base}';
  var _companyId='${SYS_SESSION_USER.COMPANYID}';
  var _companyName='${SYS_SESSION_USER.COMPANYNAME}';
  var _itemId = '${ITEM.ITEMID}';
  var _topBomId = '${ITEM.BOMPID}';
  var _userId = '${SYS_SESSION_USER.USERID}';
  var _perid = '${SYS_SESSION_USER.PERID}';
  var _userName = '${SYS_SESSION_USER.USERNAME}';
  var _deptname = '${SYS_SESSION_USER.DEPTNAME}';
  var _deptid = '${SYS_SESSION_USER.DEPTID}';
  var _postId = '${SYS_SESSION_USER.POSTID}';
  var _postName = '${SYS_SESSION_USER.PNAME}';
  var _centid = '${SYS_SESSION_USER.CENTID}';
  var _centName = '${SYS_SESSION_USER.CENTNAME}';	
</script>
<script type="text/javascript" src="${base}/script/ext341/adapter/ext/ext-base-debug.js"></script>
<script type="text/javascript" src="${base}/script/ext341/ext-all-debug.js"></script>
<script type="text/javascript" src="${base}/script/ExtUtils.js"></script>
<script type="text/javascript" src="${base}/script/ui-all.js"></script>
<script type="text/javascript" src="${base}/script/ext341/src/locale/ext-lang-zh_CN.js"></script>
<script type="text/javascript">
  window._base='${base}';
  Ext.BLANK_IMAGE_URL ='${base}/script/ext341/resources/images/default/s.gif';
  Ext.form.Field.prototype.msgTarget = 'qtip';
  Ext.LoadMask.prototype.msg = "正在载入数据,请稍等...";
  Ext.QuickTips.init(false);
</script>

 