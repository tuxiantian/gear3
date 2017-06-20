 <#if parameters.name!=""><#assign _tmp1=parameters.name/><#else><#assign _tmp1="deptName"/></#if>
<#if parameters.id!=""><#assign _tmp2=parameters.id/><#else><#assign _tmp2="deptId"/></#if>
<#assign type=session.getValue('SESSION_USER').orgmodel/>
<#if (type==5 || type==6 || type==2)>
<input type="text" id="${_tmp1}" name="${_tmp1}" readonly  value="${(user.deptName)!''}" style="width:250">
<input type="hidden" id="${_tmp2}" name="${_tmp2}" value="${(user.deptid)!''}">
<#else>
<input type="text" id="${_tmp1}" name="${_tmp1}" readonly onclick="$.showDept({checkModel:'single',rootId:'{user.deptId}',rootText:_ctx.deptName})" value="${(user.deptName)!''}" style="width:250">
<input type="hidden" id="${_tmp2}" name="${_tmp2}" value="${(user.deptid)!''}">
<input type="hidden" id="_mode" name="_mode" value="tree"/>
<script>
function _cb(ids,names){
	$('#_mode').val("list");
	$('#${_tmp2}').val(ids);
	var c=names.split(",");
	$('#${_tmp1}').val(c[0]+'...共'+c.length+'家');
	$('#${_tmp1}').attr('tips',c.join('<br/>'));
}
$(function(){$('#${_tmp1}').tips();});
</script>
<a href="#"  onclick="showDeptAdcWin(_cb)"><img style="margin:-2px 1px" width='16px' height='16px' src="${base}/style/search.png" title="高级选择"/></a>
</#if>