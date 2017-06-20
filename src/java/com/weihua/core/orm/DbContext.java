package com.weihua.core.orm;
import java.io.Serializable;
public class DbContext implements Serializable {
	private static final long serialVersionUID = -235875394412767342L;
	static ThreadLocal<DbType> ctxHolder = new ThreadLocal<DbType>();

	public static void setContext(DbType dbType) {
		ctxHolder.set(dbType);
	}

	public static DbType getContext() {
		DbType db = ctxHolder.get();
		if (db == null) {
			db = DbType.ONL;
			setContext(db);
		}
		return db;
	}

	public static void clearContext() {
		ctxHolder.remove();
	}
}
