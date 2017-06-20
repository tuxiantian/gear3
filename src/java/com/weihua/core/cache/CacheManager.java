package com.weihua.core.cache;
import java.util.Date;

import com.opensymphony.oscache.base.CacheEntry;
import com.opensymphony.oscache.base.NeedsRefreshException;
import com.opensymphony.oscache.general.GeneralCacheAdministrator;

public class CacheManager {
	private String keyPrefix = "base";
	private GeneralCacheAdministrator cacheAdmin;

	public void put(String key, Object value) {
		boolean updated = false;
		try {
			cacheAdmin.putInCache(this.keyPrefix + "_" + key, value);
			updated = true;
		} finally {
			if (!updated) {
				cacheAdmin.cancelUpdate(keyPrefix + "_" + key);
			}
		}
	}

	public Object get(String key, int refreshPeriod) {
		try {
			return cacheAdmin.getFromCache(this.keyPrefix + "_" + key, refreshPeriod);
		} catch (NeedsRefreshException e) {
			cacheAdmin.cancelUpdate(this.keyPrefix + "_" + key);
			return null;
		}
	}

	public Object get(String key) {
		try {
			return cacheAdmin.getFromCache(this.keyPrefix + "_" + key,CacheEntry.INDEFINITE_EXPIRY);
		} catch (Exception e) {
			cacheAdmin.cancelUpdate(this.keyPrefix + "_" + key);
			return null;
		}
	}

	public void remove(String key) {
		cacheAdmin.flushEntry(this.keyPrefix + "_" + key);
	}

	public void removeAll(Date date) {
		cacheAdmin.flushAll(date);
	}

	public void removeAll() {
		cacheAdmin.flushAll();
	}

	public String getKeyPrefix() {
		return keyPrefix;
	}

	public void setKeyPrefix(String keyPrefix) {
		this.keyPrefix = keyPrefix;
	}

	public GeneralCacheAdministrator getCacheAdmin() {
		return cacheAdmin;
	}

	public void setCacheAdmin(GeneralCacheAdministrator cacheAdmin) {
		this.cacheAdmin = cacheAdmin;
	}
}
