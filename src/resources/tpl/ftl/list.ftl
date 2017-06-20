<#noparse> <@p.breadcrumbs</#noparse> title="${config.ftlTipName}管理" <#noparse> /></#noparse>
<!-- 面包屑导航结束 -->
<!-- 页面内容开始 -->
<div class="page-content" id="page-content">
    <div class="row">
        <div class="col-xs-12 page-col-xs">
            <div class="space-2"></div>
            <div class="table-header">
                <div class="row">
                    <div class="col-xs-12 col-md-3">
                        <a class="btn btn-success" data-backdrop="static" data-target="#publicmodal" data-toggle="modal"
                           href="<#noparse>${base}</#noparse>${config.actionNamespace}/add"><span class="glyphicon glyphicon-plus"></span> 添加</a>
                    </div>
                </div>
            </div>
            <div class="table-responsive">
            <#noparse><#include</#noparse> '${config.actionNamespace}/table.ftl'<#noparse>/></#noparse>
            </div>
        </div>
    </div>
</div>
<!-- 页面内容结束 -->