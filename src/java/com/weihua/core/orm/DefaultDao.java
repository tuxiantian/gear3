package com.weihua.core.orm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.weihua.core.utils.JsonUtil;
import com.weihua.core.utils.SqlUtils;
import com.weihua.core.web.CUDTransactional;
import com.weihua.core.web.DefaultCUDHandler;


@Transactional
/**
 * 这个dao扩张了namedjdbctemplate的功能
 */
public abstract class DefaultDao extends BaseDaoSupport
{

	protected final SimpleJdbcTemplate getSimpleJdbcTemplate(DbType dbType)
	{
		setDbContext(dbType);
		return new SimpleJdbcTemplate(this.getDataSource());
	}

	protected final SimpleJdbcTemplate getSimpleJdbcTemplate()
	{
		return this.getSimpleJdbcTemplate(DbType.ONL);
	}

	public List queryForListByTpl(String sqlName, Map params) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).queryForList(this.getSql(sqlName, params), params);
	}

	public Map<String, Object> queryForMapByTpl(String sqlName, Map params, String key) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).queryForMap(this.getSql(sqlName, params), params);
	}

	public int updateByTpl(String sqlName, Map params) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).update(this.getSql(sqlName, params), new MapSqlParameterSource((Map) params));
	}

	public int deleteByTpl(String sqlName, Map params) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).update(this.getSql(sqlName, params), new MapSqlParameterSource((Map) params));
	}

	public int insertByTpl(String sqlName, Map params) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).update(this.getSql(sqlName, params), new MapSqlParameterSource((Map) params));
	}

	public String getStringByTpl(String sqlName, Map params) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).queryForObject(this.getSql(sqlName, params), String.class, params);
	}

	public Map getMapByTpl(String sqlName, Map params) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).queryForObject(this.getSql(sqlName, params), HashMap.class, params);
	}

	public Long getLongByTpl(String sqlName, Map params) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).queryForLong(this.getSql(sqlName, params), params);
	}

	public Integer getIntByTpl(String sqlName, Map params) throws DataAccessException
	{
		return this.getSimpleJdbcTemplate(defaultDataSource).queryForInt(this.getSql(sqlName, params), params);
	}

	public void saveGrid(CUDTransactional transaction)
	{
		transaction.doTransaction(this);
	}

	/**
	 * Map 的json 结构为 { add:[], //添加记录集合 update:[],//更新记录集合 delete:[]//删除记录集合 }
	 */
	public void saveGrid(String sqlCode, Map data)
	{
		DefaultCUDHandler template = new DefaultCUDHandler(sqlCode, data);
		saveGrid(template);
	}
	
	public long insertRecord(String sqlName, Object params)
	{
		if (sqlName.startsWith("_"))
		{		
			return this.insert(sqlName.substring(1), params);
		}
		else
		{
			return this.getSimpleJdbcTemplate(defaultDataSource).update(this.getSql(sqlName, params), new MapSqlParameterSource((Map) params));
		}
	}

	public long updateRecord(String sqlName, Object params)
	{
		if (sqlName.startsWith("_"))
		{
			return this.update(sqlName.substring(1), params);
		}
		else
		{
			return this.getSimpleJdbcTemplate(defaultDataSource).update(this.getSql(sqlName, params), new MapSqlParameterSource((Map) params));
		}
	}

	/*
	 * oracle 下标是从1开始的
	 */
	public List pageingBySql(String querySql, Map params, int start, int limit)
	{
		if (start < 0)
		{
			start = 0;
		}
		if (limit < 0)
		{
			limit = 20;
		}
		if (limit > 1000)
		{
			limit = 1000;// 防止搞死内存
		}
		String placeHoldler = "@=@";
		String pagingSql = SqlUtils.parsePagingSql(placeHoldler, start, limit);
		if (pagingSql.indexOf('?') == pagingSql.lastIndexOf('?'))
		{ // start=0
			params.put("limit_", limit);
			pagingSql = pagingSql.split("\\?")[0] + ":limit_";
		}
		else
		{
			params.put("end_", start + limit);
			params.put("start_", start);
			String[] splits = pagingSql.split("\\?");
			pagingSql = splits[0] + ":end_" + splits[1] + ":start_";
		}
		querySql = pagingSql.replace(placeHoldler, querySql);
		return this.getSimpleJdbcTemplate(defaultDataSource).queryForList(querySql, params);
	}

	public List pageingBySqlcode(String code, Map params, int start, int limit)
	{
		String sql = this.getSql(code, params);
		return pageingBySql(sql, params, start, limit);
	}

	public String pageingBySqlForExt(String querySql, String countSql, Map params, int start, int limit)
	{
		List list = pageingBySql(querySql, params, start, limit);
		long count = this.getSimpleJdbcTemplate(defaultDataSource).queryForLong(countSql, params);
		return JsonUtil.getJsonForExt(list, count, new HashMap());
	}

	public String pageingBySqlcodeForExt(String sqlCode, Map params, int start, int limit)
	{
		if (sqlCode.startsWith("_"))
		{
			return this.getJsonPaging(sqlCode.substring(1), params);
		}
		String querySql = this.getSql(sqlCode, params);
		String countSql = this.getSql(sqlCode + "_count", params);
		if (countSql == null)
		{
			countSql = SqlUtils.parseCountSql(querySql);
		}
		return pageingBySqlForExt(querySql, countSql, params, start, limit);
	}

	public String pageingBySqlcodeForExt(String sqlCode, Map params)
	{
		int start = Integer.valueOf(params.get("start") + "");
		int limit = Integer.valueOf(params.get("limit") + "");
		params.remove("start");
		params.remove("limit");
		return pageingBySqlcodeForExt(sqlCode, params, start, limit);
	}

}
