<table id="datalist" class="table table-striped table-bordered table-hover">
    <thead>
    <tr>
        <th class="center">
            <label>
       <#noparse><input type="checkbox" class="ace"/></#noparse>
                <span class="lbl"></span>
            </label>
        </th>
        <th>序号</th>
        <#list cols as item>
            <#if item.javaFieldName!='id' && item.javaFieldName!='inx' && item.javaFieldName!='shopId' && item.javaFieldName!='mainShopId' && item.javaFieldName!='addDate' && item.javaFieldName!='isDel'>
         <th>${item.comment}</th>
            </#if>
        </#list>
        <th>操作</th>
    </tr>
    </thead>
    <tbody>
    <#noparse>[#list page as item]</#noparse>
    <tr>
        <td class="center">
            <label>
            <#noparse><input type="checkbox" class="ace" value="${item.id}"/></#noparse>
                <span class="lbl"></span>
            </label>
        </td>
    <#noparse><td>${item.inx }</td></#noparse>
    <#list cols as item>
        <#if item.javaFieldName!='id' && item.javaFieldName!='inx' && item.javaFieldName!='shopId' && item.javaFieldName!='mainShopId' && item.javaFieldName!='addDate'&& item.javaFieldName!='isDel'>
            <td><#noparse>${item.</#noparse>${item.javaFieldName} }</td>
        </#if>
    </#list>
        <td>
            <div class="visible-md visible-lg hidden-sm hidden-xs action-buttons btn-group">
                <#noparse><a class="btn btn-success btn-xs" data-backdrop="static" data-target="#publicmodal" data-toggle="modal" href="${base}</#noparse>${config.actionNamespace}/edit/<#noparse>${item.id}</#noparse>"><i class="fa fa-edit"></i>编辑</a>
                <#noparse><a class="btn btn-danger btn-xs" href="${base}</#noparse>${config.actionNamespace}/delete/<#noparse>${item.id}</#noparse>" title="删除"><i class="fa fa-trash"></i> 删除</a>
            </div>
        </td>
    </tr>
    <#noparse>[/#list]</#noparse>
    </tbody>
</table>