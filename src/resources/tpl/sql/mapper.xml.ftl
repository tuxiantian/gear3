<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="${mapperNamespace}">

    <!-- sql 缓存 -->
    <cache type="org.mybatis.caches.ehcache.EhcacheCache"/>

    <resultMap id="entityMap" type="${mapperEntityMap}">
        <#list cols as item>
            <#if item.isPk>
                <id property="${item.javaFieldName}" column="${item.columnName?lower_case}"></id>
            <#else>
                <result property="${item.javaFieldName}" column="${item.columnName?lower_case}"></result>
            </#if>
        </#list>
    </resultMap>

    <!-- 添加文章信息 开始 -->
    <insert id="save" parameterType="${mapperEntityMap}" useGeneratedKeys="true"
            keyProperty="${pkey.javaFieldName}">

        INSERT INTO ${config.tableName?lower_case}
        <!-- 添加表字段 -->
        <trim prefix="(" suffix=")" suffixOverrides=",">

            <#list cols as item>
                <#if !item.isPk >
            <if test="${item.javaFieldName} != null">${item.columnName?lower_case},</if>
                </#if>
            </#list>
        </trim>
        <!-- 注入控制层字段 -->
        <trim prefix="values (" suffix=")" suffixOverrides=",">
         <#list cols as item>
             <#if !item.isPk>
         <if test="${item.javaFieldName} != null"><#noparse>#{</noparse>${item.javaFieldName}},</if>
             </#if>
         </#list>
        </trim>
    </insert>


    <update id="update" parameterType="${mapperEntityMap}">
        UPDATE ${config.tableName?lower_case}
        <set>
            <#list cols as item>
                <#if !item.isPk>
            <if test="${item.javaFieldName} != null">${item.columnName?lower_case}=<#noparse>#{</noparse>${item.javaFieldName}},</if>
                </#if>
            </#list>
        </set>
        WHERE ${pkey.columnName?lower_case}=<#noparse>#{</noparse>${pkey.javaFieldName}}
        </update>

    <sql id="selectHead">
        SELECT
        <#list cols as item>
            <#if item_has_next>
                t.${item.columnName?lower_case},
            <#else>
                t.${item.columnName?lower_case}
            </#if>
        </#list>
        FROM ${config.tableName?lower_case} t
        <#noparse>
        WHERE 1=1
        </#noparse>
    </sql>

    <sql id="condition">
        <if test="${pkey.javaFieldName} != null">
            AND t.${pkey.columnName?lower_case}=<#noparse>#{</noparse>${pkey.javaFieldName}}
        </if>
    </sql>
    <sql id="orderBy">
        ORDER BY t.${pkey.columnName?lower_case} DESC
    </sql>
    <!--根据主键查询 -->
    <select id="findBy" resultMap="entityMap">
        <include refid="selectHead"/>
         AND t.${pkey.columnName?lower_case}=<#noparse>#{</noparse>${pkey.javaFieldName}} LIMIT 1
    </select>

     <select id="findOne" resultMap="entityMap">
         <include refid="selectHead"/>
         <include refid="condition"/>
         limit 1
     </select>

    <!--查询列表 -->
    <select id="find" resultMap="entityMap">
        <include refid="selectHead"/>
        <include refid="condition"/>
        <include refid="orderBy"/>
    </select>

    <!-- 分页查询列表 -->
    <select id="findPage" resultMap="entityMap">
        <include refid="sys.begin"/>
        <include refid="selectHead"/>
        <include refid="condition"/>
        <include refid="orderBy"/>
        <include refid="sys.end"/>
    </select>

    <!-- 分页查询数量 -->
    <select id="findPageCount" resultType="long">
        SELECT COUNT(1) FROM ${config.tableName?lower_case}  t
        <#noparse>  WHERE 1=1 </#noparse>
        <include refid="condition"/>
    </select>


    <delete id="delete">
        DELETE FROM ${config.tableName?lower_case}
         WHERE ${pkey.columnName?lower_case}=<#noparse>#{</noparse>${pkey.javaFieldName}}
    </delete>

</mapper>