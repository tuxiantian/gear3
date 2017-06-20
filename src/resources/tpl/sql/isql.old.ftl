<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE sqlMap PUBLIC "-//iBATIS.com//DTD SQL Map 2.0//EN"
    "http://ibatis.apache.org/dtd/sql-map-2.dtd">
<sqlMap namespace="${config.ibatisNamespace}"> 
 
   <!-- 分页 -->
    <select id="list${config.appName?cap_first}" resultClass="java.util.HashMap">
       <include refid="c.start"/>
	        select 
            <#list cols as item>
            <#if item_index gt 0>,</#if>${item.COLUMN_NAME}
            </#list>                 
			from  ${config.tableName} 
			where 1=1
            <#list cols as item>
            <#if isSubTable && item.COLUMN_NAME==config.foreignKey>
            AND  ${item.COLUMN_NAME}= #${item.COLUMN_NAME}#
            <#else>
            <isNotEmpty property="${item.COLUMN_NAME}">
			AND  ${item.COLUMN_NAME}= #${item.COLUMN_NAME}#
			</isNotEmpty>	
            </#if>
            </#list> 
	    <include refid="c.end"/>
		<include refid="c.order"/>	
    </select> 
    <!-- 分页 count-->
	<select id="list${config.appName?cap_first}Count" resultClass="long">
		    select count(1) cnt
			from  ${config.tableName} 
			where 1=1
            <#list cols as item>
            <isNotEmpty property="${item.COLUMN_NAME}">
			    AND  ${item.COLUMN_NAME}= #${item.COLUMN_NAME}#
			</isNotEmpty>	
            </#list> 	  
	</select>	
    
	<!-- 插入-->  
	<insert id="${config.appName}_insert">
		<selectKey resultClass="long" keyProperty="${pkey}" type="pre"> 
	        SELECT  ${config.sequnce}.NEXTVAL  AS ID FROM DUAL 
	    </selectKey> 	
        INSERT INTO  ${config.tableName}(
            <#list cols as item>
            <#if item_index gt 0 >,</#if>${item.COLUMN_NAME}
            </#list>        
        )
		VALUES(		    
            <#list cols as item>
               <#if item_index gt 0 >,</#if>#${item.COLUMN_NAME}#
            </#list> 
		)   
	</insert>
	<!-- 更新-->  
	<update id="${config.appName}_update">
	    UPDATE ${config.tableName} SET 
            <#list cols as item>
              <#if item.COLUMN_NAME!=pkey>
              <#if item_index gt 1 >,</#if>${item.COLUMN_NAME}=#${item.COLUMN_NAME}#
              </#if>
            </#list> 
		WHERE ${pkey}=#${pkey}#	
	</update>
	<!-- 删除-->  
	<delete id="${config.appName}_delete">
	    DELETE ${config.tableName}   WHERE ${pkey}=#${pkey}#		    
	</delete>
	
    <delete id="${config.appName}_batch_delete">
		DELETE ${config.tableName}   WHERE
		<dynamic prepend=" ${pkey} IN ">
			<iterate conjunction="," open="(" close=")">
				#[]#
			</iterate>
		</dynamic>
	</delete>
	
	<#if isSubTable>
	<!-- 关联删除-->  
	<delete id="${config.appName}_delete_by_${config.foreignKey}">
	    DELETE ${config.tableName}  WHERE ${config.foreignKey}=#${config.foreignKey}#    
	</delete>	
	
	<!-- 关联批量删除-->  
	<delete id="${config.appName}_batch_delete_by_${config.foreignKey}">
	    DELETE ${config.tableName}  WHERE
	    <dynamic prepend="  ${config.foreignKey} IN ">
			<iterate conjunction="," open="(" close=")">
				#[]#
			</iterate>
		</dynamic>
	</delete>		
	</#if>
	 <!-- 通过id查询-->  
	 <select id="${config.appName}_load" resultClass="java.util.HashMap">
	     select 
            <#list cols as item>
            <#if item_index gt 0>,</#if>${item.COLUMN_NAME}
            </#list>  
		from   ${config.tableName} 
		WHERE ${pkey}=#${pkey}#	
	 </select>      
</sqlMap>