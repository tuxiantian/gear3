package com.weihua.core.orm;

import java.io.Serializable;

public class SqlInfo implements Serializable {
	private static final long serialVersionUID = -8704722663219981211L;
	private String sql;
	private Object[] params;

	public SqlInfo(String sql, Object[] params) {
		super();
		this.sql = sql;
		this.params = params;
	}

	public String getSql() {
		return sql;
	}

	public void setSql(String sql) {
		this.sql = sql;
	}

	public Object[] getParams() {
		return params;
	}

	public void setParams(Object[] params) {
		this.params = params;
	}

}
