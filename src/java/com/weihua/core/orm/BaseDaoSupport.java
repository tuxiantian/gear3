package com.weihua.core.orm;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.ArrayUtils;
import org.apache.struts2.ServletActionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterUtils;
import org.springframework.jdbc.core.namedparam.ParsedSql;
import org.springframework.jdbc.core.simple.SimpleJdbcTemplate;
import org.springframework.orm.ibatis.SqlMapClientCallback;
import org.springframework.orm.ibatis.SqlMapClientTemplate;
import org.springframework.orm.ibatis.support.SqlMapClientDaoSupport;
import org.springframework.web.util.WebUtils;

import com.ibatis.common.beans.ProbeFactory;
import com.ibatis.sqlmap.client.SqlMapExecutor;
import com.ibatis.sqlmap.engine.impl.SqlMapClientImpl;
import com.ibatis.sqlmap.engine.mapping.parameter.ParameterMap;
import com.ibatis.sqlmap.engine.mapping.parameter.ParameterMapping;
import com.ibatis.sqlmap.engine.mapping.sql.Sql;
import com.ibatis.sqlmap.engine.mapping.statement.MappedStatement;
import com.ibatis.sqlmap.engine.scope.SessionScope;
import com.ibatis.sqlmap.engine.scope.StatementScope;
import com.weihua.core.Constants;
import com.weihua.core.cache.CacheKeys;
import com.weihua.core.cache.CacheManager;
import com.weihua.core.utils.JsonUtil;
import com.weihua.core.utils.MixUtil;
import com.weihua.core.utils.SqlUtils;
import com.weihua.core.utils.StringUtil;

@SuppressWarnings("unchecked")
public abstract class BaseDaoSupport extends SqlMapClientDaoSupport
{
	public final static String ACTION_FIELD = "_act";
	public final static String PK = "_ID";
	@Autowired
	protected CacheManager cacheManager;
	private String ns;
	protected int limit = 20;
	protected DbType defaultDataSource = DbType.ONL;
	private final Map parsedSqlCache = new HashMap();

	public BaseDaoSupport()
	{
		if (this.getClass().isAnnotationPresent(NameSpace.class))
		{
			NameSpace p = this.getClass().getAnnotation(NameSpace.class);
			ns = p.value();
		}
		else
		{
			if (StringUtil.isBlank(ns))
			{
				ns = this.getClass().getSimpleName();
				if (ns.endsWith("Dao"))
				{
					ns = ns.substring(0, ns.length() - 3);
				}
			}
		}
	}

	/**
	 * 设置数据库上下文
	 * 
	 * @param dbType
	 */
	protected void setDbContext(DbType dbType)
	{
		DbContext.setContext(dbType);
	}

	protected final SqlMapClientTemplate getTemplate(DbType dbType)
	{
		setDbContext(dbType);
		return getSqlMapClientTemplate();
	}

	protected final JdbcTemplate getJdbcTemplate(DbType dbType)
	{
		setDbContext(dbType);
		return new JdbcTemplate(this.getDataSource());
	}

	protected final JdbcTemplate getJdbcTemplate()
	{
		return this.getJdbcTemplate(DbType.ONL);
	}

	/**
	 * 如果sqlName包含".",则不加声明的NameSpace
	 */
	protected String getSqlName(String sqlName)
	{
		return sqlName.indexOf(".") > 0 ? sqlName : ns + "." + sqlName;
	}

	/** ---- 简单数据库操作 ------ **/
	protected List queryForList(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		return getTemplate(dbType).queryForList(getSqlName(sqlName), params);
	}

	protected Object queryForObject(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		return getTemplate(dbType).queryForObject(getSqlName(sqlName), params);
	}

	protected Map<String, Object> queryForMap(String sqlName, Object params, String key, DbType dbType) throws DataAccessException
	{
		return getTemplate(dbType).queryForMap(getSqlName(sqlName), params, key);
	}

	protected Map<String, Object> queryForMap(String sqlName, Object params, String key, String value, DbType dbType) throws DataAccessException
	{
		return getTemplate(dbType).queryForMap(getSqlName(sqlName), params, key, value);
	}

	protected int update(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		return getTemplate(dbType).update(getSqlName(sqlName), params);
	}

	protected int delete(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		return getTemplate(dbType).delete(getSqlName(sqlName), params);
	}

	protected Long insert(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		Object r = getTemplate(dbType).insert(getSqlName(sqlName), params);
		if (r == null)
		{
			return 0l;
		}
		else
		{
			return Long.valueOf(r.toString());
		}
	}

	/**
	 * 默认库
	 */
	protected List queryForList(String sqlName, Object params) throws DataAccessException
	{
		return queryForList(sqlName, params, defaultDataSource);
	}

	protected Object queryForObject(String sqlName, Object params) throws DataAccessException
	{
		return queryForObject(sqlName, params, defaultDataSource);
	}

	protected Map<String, Object> queryForMap(String sqlName, Object params, String key) throws DataAccessException
	{
		return queryForMap(sqlName, params, key, defaultDataSource);
	}

	protected Map<String, Object> queryForMap(String sqlName, Object params, String key, String value) throws DataAccessException
	{
		return queryForMap(sqlName, params, key, value, defaultDataSource);
	}

	protected int update(String sqlName, Object params) throws DataAccessException
	{
		return update(sqlName, params, defaultDataSource);
	}

	protected int delete(String sqlName, Object params) throws DataAccessException
	{
		return delete(sqlName, params, defaultDataSource);
	}

	protected Long insert(String sqlName, Object params) throws DataAccessException
	{
		return insert(sqlName, params, defaultDataSource);
	}

	/**
	 * get* 获取当个字段的值,简化操作
	 */
	protected String getString(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		return (String) queryForObject(sqlName, params, dbType);
	}

	protected Map getMap(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		return (Map) queryForObject(sqlName, params, dbType);
	}

	protected Long getLong(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		return (Long) queryForObject(sqlName, params, dbType);
	}

	protected Integer getInt(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		return (Integer) queryForObject(sqlName, params, dbType);
	}

	/**
	 * 默认库
	 */
	protected String getString(String sqlName, Object params) throws DataAccessException
	{
		return getString(sqlName, params, defaultDataSource);
	}

	protected Map getMap(String sqlName, Object params) throws DataAccessException
	{
		return getMap(sqlName, params, defaultDataSource);
	}

	protected Long getLong(String sqlName, Object params) throws DataAccessException
	{
		return getLong(sqlName, params, defaultDataSource);
	}

	protected Integer getInt(String sqlName, Object params) throws DataAccessException
	{
		return getInt(sqlName, params, defaultDataSource);
	}

	/** ---- 高级数据库操作 ------ **/
	/**
	 * 分页查询
	 */
	protected List getPagingList(String sqlName, Object param, DbType dbType) throws DataAccessException
	{
		HttpServletRequest req = ServletActionContext.getRequest();
		String start = req.getParameter(Constants.APP_SQL_START);
		int st = 0;
		if (!StringUtil.isBlank(start))
		{
			st = Integer.parseInt(start);
		}
		String limit = req.getParameter(Constants.APP_SQL_LIMIT);
		int lm = this.limit;
		if (!StringUtil.isBlank(limit))
		{
			lm = Integer.parseInt(limit);
		}
		Map params = new HashMap();
		params.put(Constants.APP_SQL_BEGIN, (st + 1) + "");
		params.put(Constants.APP_SQL_END, (st + lm) + "");
		if (param != null) params.putAll(MixUtil.beanToMap(param));
		ISqlFilterHandler s = new SqlFilterHandler((Map) params.get(Constants.APP_SQL_ALIAS));
		String filter = s.handler(WebUtils.getParametersStartingWith(req, null));
		params.put(Constants.APP_SQL_FILTER, filter);
		return this.queryForList(sqlName, params, dbType);
	}

	protected String getJsonPaging(String sqlName, Object params) throws DataAccessException
	{
		return getJsonPaging(sqlName, params, defaultDataSource);
	}

	/**
	 * @param sqlName
	 *            sql名字
	 * @param params
	 *            参数
	 * @param dbType
	 *            查询数据库
	 */
	protected String getJsonPaging(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		List lst = this.getPagingList(sqlName, params, dbType);
		Map attrs = this.getPagingCount(sqlName, params, dbType);
		Long count = (Long) attrs.get("COUNT");
		return JsonUtil.getJsonForExt(lst, count, attrs);
	}

	protected Map getPagingCount(String sqlName, Object params, DbType dbType) throws DataAccessException
	{
		Map finalParams = new HashMap();
		if (params != null) finalParams.putAll(MixUtil.beanToMap(params));
		// String filter = this.getFilterParams((Map)
		// finalParams.get(Constants.APP_SQL_ALIAS));
		// finalParams.put(Constants.APP_SQL_FILTER, filter);
		Object rst = this.queryForObject(sqlName + "Count", finalParams, dbType);
		Map attrs;
		Long count;
		if (rst instanceof Map)
		{
			attrs = (Map) rst;
			Object ct = attrs.get("COUNT");
			if (ct == null) ct = attrs.get("COUNT(*)");
			if (ct == null) ct = attrs.get("COUNT(1)");
			count = ct instanceof BigDecimal ? ((BigDecimal) ct).longValue() : (Long) ct;
		}
		else
		{
			count = (Long) rst;
			attrs = new HashMap();
		}
		attrs.put("COUNT", count);
		return attrs;
	}

	/**
	 * 获取正式库seq
	 */
	protected Long getSeq(String seqName) throws DataAccessException
	{
		return (Long) this.getSqlMapClientTemplate().queryForObject("c.getSeq", seqName);
	}

	/**
	 * 从数据库里面获取sql
	 */
	public String getSql(String code, Object param)
	{
		Map sqlInfo = getSqlInfo(code);
		if (sqlInfo == null)
		{
			return null;
		}
		String sql = (String) sqlInfo.get("SQL_TEXT");
		if (sql == null)
		{
			return null;
		}
		return SqlUtils.parseSql(sql, param);
	}

	protected ParsedSql getParsedSql(String sql)
	{
		synchronized (this.parsedSqlCache)
		{
			ParsedSql parsedSql = (ParsedSql) this.parsedSqlCache.get(sql);
			if (parsedSql == null)
			{
				parsedSql = NamedParameterUtils.parseSqlStatement(sql);
				this.parsedSqlCache.put(sql, parsedSql);
			}
			return parsedSql;
		}
	}

	protected Map<String, Object> getSqlInfo(String code)
	{
		Map<String, Object> sqls = (Map) cacheManager.get(CacheKeys.T_SYS_SQL);
		if (sqls == null || sqls.isEmpty())
		{
			sqls = this.queryForMap("c.getSql", null, "CODE", defaultDataSource);
			cacheManager.put(CacheKeys.T_SYS_SQL, sqls);
		}
		return (Map) sqls.get(code);
	}

	/**
	 * 获取ibatis文件的sql
	 */
	protected SqlInfo getIbatisOrJDBCSql(String sqlName, Map params)
	{
		if (sqlName.startsWith("_"))
		{
			sqlName = sqlName.substring(1);
			SqlMapClientTemplate sqlMapClientTemplate = super.getSqlMapClientTemplate();
			SqlMapClientImpl sqlMapClientImpl = (SqlMapClientImpl) sqlMapClientTemplate.getSqlMapClient();
			MappedStatement mappedStatement = sqlMapClientImpl.getMappedStatement(sqlName);
			Sql sql = mappedStatement.getSql();
			StatementScope ss = new StatementScope(new SessionScope());
			mappedStatement.initRequest(ss);
			if (logger.isDebugEnabled()) logger.debug(params);
			String sqlString = sql.getSql(ss, params);
			if (logger.isDebugEnabled()) logger.debug(sqlString);
			ParameterMap parameterMap = sql.getParameterMap(ss, params);
			ss.setParameterMap(parameterMap);
			Object[] parameterArr = parameterMap.getParameterObjectValues(ss, params);
			return new SqlInfo(sqlString, parameterArr);
		}
		else
		{
			int start = Integer.valueOf(params.get("start") + "");
			int limit = Integer.valueOf(params.get("limit") + "");
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
			String sql=this.getSql(sqlName, params);
			sql = pagingSql.replace(placeHoldler, sql);
			//System.out.println("--------------->"+sql);
			ParsedSql parsedSql = getParsedSql(sql);
			MapSqlParameterSource paramSource = new MapSqlParameterSource(params);
			String sqlToUse = NamedParameterUtils.substituteNamedParameters(parsedSql, paramSource);
			Object[] paramsObject = NamedParameterUtils.buildValueArray(parsedSql, paramSource, null);			
			return new SqlInfo(sqlToUse, paramsObject);
		}
	}

	/**
	 * 导出excel
	 */
	public void exportExcel(String sqlName, Map params, DbType dbType) throws IOException
	{
		final String[] keys = ((String) params.get(Constants.APP_EXCEL_COLID)).split(",");
		String[] names = ((String) params.get(Constants.APP_EXCEL_COLTEXT)).split(",");
		String fileName = StringUtil.nvl((String) params.get(Constants.APP_EXCEL_FILENAME), "导出");
		HttpServletResponse response = ServletActionContext.getResponse();
		response.reset();
		response.setContentType("application/octet-stream");
		response.addHeader("Content-Disposition", "attachment;filename=" + java.net.URLEncoder.encode(fileName + ".xls", "UTF-8"));
		final PrintWriter sb = response.getWriter();
		sb.append("<html xmlns:o='urn:schemas-microsoft-com:office:office'  xmlns:x='urn:schemas-microsoft-com:office:excel'  xmlns='http://www.w3.org/TR/REC-html40'>");
		sb.append("<head><meta http-equiv=Content-Type content='text/html;charset=UTF-8'><style type='text/css'><!-- td {mso-number-format:'\\@'} --></style></head><body>");
		sb.append("<table border='1'>");
		SqlInfo sqlInfo = this.getIbatisOrJDBCSql(sqlName, params);
		sb.append("<tr>");
		for (int i = 0; i < names.length; i++)
		{
			sb.append("<td>").append(names[i] + "</td>");
		}
		sb.append("</tr>");
		JdbcTemplate tpl = this.getJdbcTemplate(dbType);
		tpl.query(sqlInfo.getSql(), sqlInfo.getParams(), new RowCallbackHandler()
		{
			public void processRow(ResultSet rs) throws SQLException
			{
				sb.append("<tr>");
				for (int i = 0; i < keys.length; i++)
				{
					sb.append("<td>").append(StringUtil.nvl(rs.getString(keys[i]))).append("</td>");
				}
				sb.append("</tr>");
			}
		});
		sb.append("</table></body></html>");
		sb.flush();
	}

	/**
	 * 获取树结构的JSON串
	 */
	public String getTreeData(String code, Map params)
	{
		MixUtil.transVars(params, new String[]
		{ "rootId" });
		params.put("node", params.get("rootId"));
		List datas = null;
		if (code.startsWith("_"))
		{
			datas = queryForList(code, params);
		}
		else
		{
			SimpleJdbcTemplate tpl = new SimpleJdbcTemplate(this.getDataSource());
			datas = tpl.queryForList(getSql(code, params), params);
		}
		Map treeData = new HashMap(), levelMap = new HashMap();
		for (int i = 0; i < datas.size(); i++)
		{
			Map data = (Map) datas.get(i);
			int level = ((java.math.BigDecimal) data.get("LEVEL")).intValue();
			if (i == 0)
			{
				treeData = data;
			}
			else
			{
				Map parent = (Map) levelMap.get(level - 1);
				List children = (List) parent.get("children");
				if (children == null)
				{
					children = new ArrayList();
					parent.put("children", children);
				}
				children.add(data);
			}
			data.remove("LEVEL");
			levelMap.put(level, data);
		}
		return JsonUtil.getJson(treeData);
	}

	/**
	 * 根据组织结构树在t_sys_sql中定义的查询指定根节点下的所有节点
	 * 
	 * @param code
	 *            在t_sys_sql 中sql语句的code
	 * @param params
	 *            参数 主要用到rootId
	 * @return
	 */
	public String getTreeAllData(String code, Map params)
	{
		MixUtil.transVars(params, new String[]
		{ "rootId" });
		params.put("node", params.get("rootId"));
		List datas = null;
		if (code.startsWith("_"))
		{
			datas = queryForList(code, params);
		}
		else
		{
			SimpleJdbcTemplate tpl = new SimpleJdbcTemplate(this.getDataSource());
			datas = tpl.queryForList(getSql(code, params), params);
		}

		if (datas != null && datas.size() > 0)
		{
			Map root = new HashMap();
			Map maping = new HashMap();
			Iterator iterator = datas.iterator();
			Object id;
			Object parent;
			List childrenList;
			Map parentMap;
			boolean rootNotFound = true;
			while (iterator.hasNext())
			{
				Map tm = (Map) iterator.next();
				id = tm.get("id");
				parent = tm.get("PARENT");
				if (rootNotFound)
				{
					if (tm.get("id") != null && tm.get("id").toString().equals(params.get("rootId")))
					{
						root = tm;
						rootNotFound = false;
					}
				}
				if (id != null)
				{
					if (maping.get(id) == null)
					{
						tm.put("children", new ArrayList());

					}
					else
					{
						tm.put("children", ((Map) maping.get(id)).get("children"));
					}
					maping.put(id, tm);
					parentMap = (Map) maping.get(parent);
					if (parentMap == null)
					{
						parentMap = new HashMap();
						parentMap.put("children", new ArrayList());
						maping.put(parent, parentMap);
					}
					childrenList = (List) parentMap.get("children");
					childrenList.add(tm);
				}

			}

			if (root != null)
			{
				root.put("expanded", true);
				try
				{
					// resetRoot(root, datas);
					for (iterator = datas.iterator(); iterator.hasNext();)
					{
						Map m = (Map) iterator.next();
						List l2 = (List) m.get("children");
						if ((l2 == null || (l2 != null && l2.size() < 1)) && "false".equals((String) m.get("leaf")))
						{
							m.put("leaf", "true");
							m.put("iconCls", "icon-cls");
							m.put("cls", "package");
						}
					}
				}
				catch (Exception e)
				{
					/*
					 * e.printStackTrace(); System.out.println(e);
					 */
					logger.info("error", e);
				}
				return "[" + JsonUtil.getJson(root) + "]";
			}
		}

		return "";
	}

	private void resetRoot(Map root, List datas)
	{
		if (root != null && root.get("id") != null && datas != null && datas.size() > 0)
		{
			List children = (List) root.get("children");
			Map tm;
			if (children == null)
			{
				children = new ArrayList();
				root.put("children", children);
			}
			for (int i = 0; i < datas.size(); i++)
			{
				tm = (Map) datas.get(i);
				if (root.get("id").equals(tm.get("PARENT")) && !root.get("id").equals(tm.get("id")))
				{
					children.add(tm);
					// 删除子节
					// datas.remove(tm);
					resetRoot(tm, datas);
				}
			}
			for (int i = 0; i < children.size(); i++)
			{
				datas.remove(children.get(i));
			}
		}
	}

	/**
	 * 批量更新数据
	 */
	public int[] batch(final String sqlName, final List<Map> datas) throws DataAccessException
	{
		return batch(sqlName, datas, DbType.ONL);
	}

	public int[] batch(final String sqlName, final List<Map> datas, DbType dbType) throws DataAccessException
	{
		if (datas == null || datas.isEmpty()) return null;
		return (int[]) getTemplate(dbType).execute(new SqlMapClientCallback()
		{
			public Object doInSqlMapClient(SqlMapExecutor executor) throws SQLException
			{
				executor.startBatch();
				int batch = 0;
				int[] rst = new int[datas.size()];
				for (int i = 0, n = datas.size(); i < n; i++)
				{
					rst[i] = executor.update(getSqlName(sqlName), datas.get(i));
					batch++;
					if (batch == Constants.APP_SQL_BATCH_NUM)
					{
						executor.executeBatch();
						batch = 0;
					}
				}
				executor.executeBatch();
				return rst;
			}
		});
	}

	/**
	 * 批量更新数据,sqlName取MAP中的sqlName
	 */
	public int[] batch(final List<Map> datas, DbType dbType) throws DataAccessException
	{
		return (int[]) getTemplate(dbType).execute(new SqlMapClientCallback()
		{
			public Object doInSqlMapClient(SqlMapExecutor executor) throws SQLException
			{
				executor.startBatch();
				int batch = 0;
				int[] rst = new int[datas.size()];
				for (int i = 0, n = datas.size(); i < n; i++)
				{
					rst[i] = executor.update((String) datas.get(i).get(Constants.APP_SQL_BATCH_KEY), datas.get(i));
					batch++;
					if (batch == Constants.APP_SQL_BATCH_NUM)
					{
						executor.executeBatch();
						batch = 0;
					}
				}
				executor.executeBatch();
				return rst;
			}
		});
	}

	/**
	 * 根据t_sys_sql表的id, 返回对应的code值
	 * 
	 * @param id
	 * @return
	 * @throws DataAccessException
	 */
	public String getSqlCodeById(Long id)
	{
		if (id != null)
		{
			return (String) this.queryForObject("System.getSqlCodeById", id);
		}
		return null;
	}

	/**
	 * 打印完整的SQL语句
	 * 
	 * @param sqlName
	 * @param params
	 */
	protected void printFullSql(String sqlName, Object params)
	{
		SqlMapClientTemplate sqlMapClientTemplate = super.getSqlMapClientTemplate();
		SqlMapClientImpl sqlMapClientImpl = (SqlMapClientImpl) sqlMapClientTemplate.getSqlMapClient();
		MappedStatement mappedStatement = sqlMapClientImpl.getMappedStatement(getSqlName(sqlName));
		ParameterMap parameterMap = mappedStatement.getParameterMap();
		Object[] data = new Object[parameterMap.getParameterMappings().length];
		ParameterMapping[] mappings = parameterMap.getParameterMappings();
		for (int i = 0; i < mappings.length; i++)
		{
			data[i] = ProbeFactory.getProbe().getObject(params, mappings[i].getPropertyName());
		}
		Sql sql = mappedStatement.getSql();
		String fullSql = SqlUtils.parseSql(sql.getSql(null, null), data);
		logger.info("=========>>" + fullSql + ";");
	}
}
