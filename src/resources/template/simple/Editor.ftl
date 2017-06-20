<textarea type="hidden" id="${id}" name="${id}" style="display:none">
<#assign vm=parameters.name?default(id)/>
<#assign v=stack.findString(vm)/>
<#if v==''>
${stack.findString('#request.'+vm)}
<#else>
${v}
</#if>
</textarea>
<iframe id="myiframe" src="${base}/script/SinaEditor/editor.htm?id=${id}&ReadCookie=${parameters.ReadCookie?default(0)}" frameborder="0" scrolling="no" width="${parameters.width?default(800)}" height="${parameters.height?default(460)}"></iframe>