package com.weihua.core.orm;

import java.io.Serializable;
import java.lang.reflect.ParameterizedType;
import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.util.Assert;
@SuppressWarnings("unchecked")
public class BeanDao<T> extends BaseDaoSupport {
	private String module;

	protected void setModule(String module) {
		this.module = module;
	}

	public BeanDao() {
		super();
		init();
	}

	protected void init() {
		Class<T> entityClass = (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
		this.setModule(entityClass.getSimpleName());
	}

	public T load(Serializable pk, DbType dbType) throws DataAccessException {
		Assert.notNull(pk);
		return (T) this.queryForObject("load" + module, pk, dbType);
	}

	public Long insert(T entity, DbType dbType) throws DataAccessException {
		Assert.notNull(entity);
		return this.insert("insert" + module, entity, dbType);
	}

	public int update(T entity, DbType dbType) throws DataAccessException {
		Assert.notNull(entity);
		return this.update("update" + module, entity, dbType);
	}

	public int delete(Object params, DbType dbType) throws DataAccessException {
		Assert.notNull(params);
		return this.delete("delete" + module, params, dbType);
	}

	public T findOne(Object params, DbType dbType) throws DataAccessException {
		Assert.notNull(params);
		return (T) this.queryForObject("findOne" + module, params, dbType);
	}

	public List<T> find(Object params, DbType dbType) throws DataAccessException {
		return this.queryForList("find" + module, params, dbType);
	}

	/**
	 * 默认CRUD方法,跟module绑定
	 */
	public T load(Serializable pk) throws DataAccessException {
		return load(pk, defaultDataSource);
	}

	public Long insert(T entity) throws DataAccessException {
		Assert.notNull(entity);
		return this.insert("insert" + module, entity);
	}

	public int update(T entity) throws DataAccessException {
		Assert.notNull(entity);
		return this.update("update" + module, entity);
	}

	public int delete(Object params) throws DataAccessException {
		Assert.notNull(params);
		return this.delete("delete" + module, params);
	}

	public T findOne(Object params) throws DataAccessException {
		return findOne(params, defaultDataSource);
	}

	public List<T> find(Object params) throws DataAccessException {
		return find(params, defaultDataSource);
	}

}
