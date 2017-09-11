<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.member.web.auth.mapper.WebGroupMapper">

    <!-- sql 缓存 -->
    <cache type="org.mybatis.caches.ehcache.EhcacheCache"/>

    <resultMap id="entityMap" type="com.member.web.auth.entity.WebGroup">
        <id property="id" column="ID"></id>
        <result property="name" column="NAME"/>
        <result property="describe" column="DESCRI"/>
        <result property="mainShopId" column="MAIN_SHOP_ID"/>
        <result property="shopId" column="SHOP_ID"/>
        <result property="addDate" column="ADD_DATE"/>
        <result property="sysType" column="SYS_TYPE"/>
        <result property="inx" column="INX"/>
    </resultMap>

    <!-- 添加文章信息 开始 -->
    <insert id="save" parameterType="com.member.web.auth.entity.WebGroup">
        <selectKey keyProperty="id" resultType="String" order="BEFORE">
            select uuid()
        </selectKey>

        INSERT INTO WEB_GROUP
        <!-- 添加表字段 -->
        <trim prefix="(" suffix=")" suffixOverrides=",">
            ID,
            <if test="name != null">NAME,</if>
            <if test="describe != null">DESCRI,</if>
            <if test="mainShopId != null">MAIN_SHOP_ID,</if>
            <if test="shopId != null">SHOP_ID,</if>
            <if test="sysType != null">SYS_TYPE,</if>
            <if test="inx != null">INX,</if>
            ADD_DATE,
        </trim>
        <!-- 注入控制层字段 -->
        <trim prefix="values (" suffix=")" suffixOverrides=",">
		#{id},
            <if test="name != null">#{name},</if>
            <if test="describe != null">#{describe},</if>
            <if test="mainShopId != null">#{mainShopId},</if>
            <if test="shopId != null">#{shopId},</if>
            <if test="sysType != null">#{sysType},</if>
            <if test="inx != null">#{inx},</if>
            NOW(),
        </trim>
    </insert>


    <update id="update" parameterType="com.member.web.auth.entity.WebGroup">
        UPDATE WEB_GROUP
        <set>
            <if test="name != null">NAME=#{name},</if>
            <if test="describe != null">DESCRI=#{describe},</if>
            <if test="inx != null">INX=#{inx},</if>
        </set>
        WHERE ID = #{id} AND SHOP_ID=#{shopId} AND MAIN_SHOP_ID=#{mainShopId}
    </update>

    <sql id="selectHead">
        SELECT
        T.ID,
        T.NAME,
        T.DESCRI,
        T.MAIN_SHOP_ID,
        T.ADD_DATE,
        T.SYS_TYPE,
        T.SHOP_ID,
        T.INX
        FROM WEB_GROUP T WHERE 1=1 AND T.SHOP_ID=#{shopId} AND T.MAIN_SHOP_ID=#{mainShopId}
    </sql>

    <sql id="condition">
        <if test="id != null">
            AND T.ID= #{id}
        </if>
    </sql>
    <sql id="orderBy">
        ORDER BY T.INX DESC
    </sql>
    <!--查询列表 -->
    <select id="findBy" resultMap="entityMap">
        <include refid="selectHead"/>
        AND T.ID=#{id} LIMIT 1
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
        SELECT COUNT(*) FROM WEB_GROUP T WHERE 1=1 AND T.SHOP_ID=#{shopId} AND T.MAIN_SHOP_ID=#{mainShopId}
        <include refid="condition"/>
    </select>

    <select id="checkUse" resultType="int">
        SELECT COUNT(*) FROM USER_GROUP T WHERE T.GROUP_ID=#{id} AND T.SHOP_ID=#{shopId} AND T.MAIN_SHOP_ID=#{mainShopId}
    </select>

    <select id="findMaxInx" resultType="int">
        SELECT MAX(INX) FROM WEB_GROUP T WHERE 1=1 AND T.SHOP_ID=#{shopId} AND T.MAIN_SHOP_ID=#{mainShopId}
    </select>

    <delete id="delete">
        DELETE FROM WEB_GROUP WHERE ID=#{id} AND SHOP_ID=#{shopId} AND MAIN_SHOP_ID=#{mainShopId}
    </delete>
</mapper>