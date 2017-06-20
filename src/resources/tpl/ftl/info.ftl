<#noparse><#if entity.</#noparse>${pkey.javaFieldName}<#noparse>??> <#assign</#noparse> title="编辑${config.ftlTipName}"<#noparse>/><#else><#assign </#noparse>title="添加${config.ftlTipName}"<#noparse>/></#if></#noparse>
<#noparse><@p.form</#noparse> action="<#noparse>${base}</#noparse>${config
.actionNamespace}/saveOrUpdate" name="${config.appName?lower_case}EditForm" >
<#noparse><@p.hidden name="</#noparse>${pkey.javaFieldName}" value="<#noparse>${</#noparse>entity.${pkey.javaFieldName}}" />
<#noparse><@p.modalHeader iconClass="glyphicon glyphicon-plus" title="${title}"/></#noparse>
<#noparse><@p.modalBody></#noparse>
        <#list cols as item>
            <#if !item.isPk>
            <#noparse><@p.textfield</#noparse> title="${item.title}" name="${item.javaFieldName}" <#noparse>value="${entity.</#noparse>${item.javaFieldName}}"
            class="width-80 form-control " dataVal="true"
            <#if item.nullAble >required=false<#else>required=true  dataValRequired="${item.title}是必需的。"   </#if>
            <#if item.len?? && item.len!=''> dataValLengthMax="${item.len}" dataValLength="${item.title}不能超过${item.len}个字。" </#if>placeholder="请输入${item.title}" />
            </#if>
        </#list>
<#noparse></@p.modalBody></#noparse>
<#noparse><@p.modalFooter></#noparse>
    <#noparse><@p.button type="submit" class="btn btn-info" title="提交" /></#noparse>
    <#noparse><@p.button type="button" class="btn btn-danger" title="关闭" dataDismiss="modal" /></#noparse>
<#noparse></@p.modalFooter></#noparse>
<#noparse></@p.form></#noparse>