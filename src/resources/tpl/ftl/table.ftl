<div class="table-container">
    <table id="datalist"
           class="table table-striped table-bordered table-hover"
           data-toggle="table"
           data-show-export="true"
           data-show-refresh="true"
           data-show-columns="true"

           data-cookie="true"
           data-cookie-id-table="saveId"
           data-cookies-enabled="[bs.table.columns,bs.table.pageNumber]"

           data-click-to-select="true"
           data-single-select="true"
           data-toolbar=".toolbar"

           data-pagination="true"
           data-side-pagination="server"
           data-url="<#noparse>${base}</#noparse>${config.actionNamespace}/query"

           data-search="true"
           data-id-field="id"
           data-unique-id="id"
           data-export-data-type='all'
           data-export-types="['excel']"
           data-export-options="{fileName:'${config.ftlTipName}',ignoreColumn: ['${pkey.javaFieldName}','_opt']}">
        <thead>
        <tr>
            <th data-field="${pkey.javaFieldName}" data-checkbox="true"
                class="width-3"></th>
        <#list cols as item>
            <#if !item.isPk>
                <th data-field="${item.javaFieldName}">${item.title}</th>
            </#if>
        </#list>
            <th data-field="_opt" data-formatter="${config.appName?lower_case}OptFormatter" class="width-20"
                data-tableexport-display="none">操作
            </th>
        </tr>
        </thead>
    </table>
</div>
<!-- 页面内容结束 -->
<script>
    function ${config.appName?lower_case}OptFormatter(val, row, inx) {
        var id = row.${pkey.javaFieldName};
        var p = [
            '<div class="action-buttons btn-group">',
            tableUtil.btnFormat('<#noparse>${base}</#noparse>${config.actionNamespace}/edit/' + id, "编辑",
                    "btn-success",
                    "#publicmodal", "fa-edit"),
            tableUtil.btnDialogFormat('<#noparse>${base}</#noparse>${config.actionNamespace}/delete/' + id, "删除",
                    "btn-danger", "fa-trash"),
            '</div>'
        ];
        return p.join(' ');
    }
    $(function(){
        _hmt.push(['_trackPageview', '<#noparse>${base}</#noparse>${config.actionNamespace}/page']);
    });
</script>