package com.weihua.core.orm;

import java.sql.SQLFeatureNotSupportedException;
import java.util.logging.Logger;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class DynamicDataSource extends AbstractRoutingDataSource {
	protected final Log logger = LogFactory.getLog(getClass());
	@Override 
	protected Object determineCurrentLookupKey() {
		DbType dbType=DbContext.getContext(); 
		return dbType;    
	}
	@Override
	public Logger getParentLogger() throws SQLFeatureNotSupportedException {
		// TODO Auto-generated method stub
		return null;
	}

} 
