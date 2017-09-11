package ${config.package}.entity;

import com.laijia.core.entity.Entity;
import com.laijia.core.entity.AbsBaseEntity;

import java.io.Serializable;
import java.util.Date;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ${config.appName?cap_first} extends AbsBaseEntity  {
	<#list cols as item>
	<#if item.comment?? && item.comment!=''>//${item.comment}</#if>
	private ${item.javaTypeBox} ${item.javaFieldName};
	</#list>

    <#if pkey.columnName=='id'>
	@Override
    public ${pkey.javaTypeBox} get${pkey.javaFieldName?cap_first}(){
    	return ${pkey.javaFieldName};
    }


    public void set${pkey.javaFieldName?cap_first}(${pkey.javaTypeBox} ${pkey.javaFieldName}){
    	this.${pkey.javaFieldName} = ${pkey.javaFieldName};
    }
	<#else>
    @Override
    public ${pkey.javaTypeBox} getId(){
    	return ${pkey.javaFieldName};
    }

    public ${pkey.javaTypeBox} get${pkey.javaFieldName?cap_first}(){
    	return ${pkey.javaFieldName};
    }

    public void set${pkey.javaFieldName?cap_first}(${pkey.javaTypeBox} ${pkey.javaFieldName}){
    	this.${pkey.javaFieldName} = ${pkey.javaFieldName};
    }
    </#if>

	<#list cols as item>
		<#if !item.isPk >
	public ${item.javaTypeBox} get${item.javaFieldName?cap_first}(){
		return ${item.javaFieldName};
	}
		</#if>

		<#if !item.isPk>
	public void set${item.javaFieldName?cap_first}(${item.javaTypeBox} ${item.javaFieldName}){
        this.${item.javaFieldName} = ${item.javaFieldName};
    }
		</#if>

	</#list>
}