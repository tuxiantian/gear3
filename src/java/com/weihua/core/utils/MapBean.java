package com.weihua.core.utils;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class MapBean extends HashMap<String, Object> {
	private static final long serialVersionUID = 5819387600888005124L;

	public MapBean() {
		super();
	}

	public MapBean(Object... args) {
		super();
		puts(args);
	}

	public Integer getInt(Object key) {
		Object value = get(key);
		if (value != null) {
			if (value instanceof Number) {
				return ((Number) value).intValue();
			} else if (value instanceof String) {
				return Integer.parseInt((String) value);
			}
			return (Integer) value;
		}else{
			return null;
		}
	}

	public Byte getByte(Object key) {
		Integer i = getInt(key);
		return i == null ? null : i.byteValue();
	}

	public Long getLong(Object key) {
		Object value = get(key);
		if (value != null) {
			if (value instanceof BigDecimal) {
				return ((BigDecimal) value).longValue();
			} else if (value instanceof String) {
				return Long.parseLong((String) value);
			}
		}
		return (Long) value;
	}
	
	public Double getDouble(Object key) {
		Object value = get(key);
		if (value != null) {
			if (value instanceof BigDecimal) {
				return ((BigDecimal) value).doubleValue();
			} else if (value instanceof String) {
				return Double.parseDouble((String) value);
			}
		}
		return (Double) value;
	}

	public String getString(Object key) {
		Object v = get(key);
		if (!(v instanceof String) && v != null) {
			return v.toString();
		}
		return (String) v;
	}

	public Byte getByte(Object key, byte defaultInt) {
		Byte b = getByte(key);
		return b == null ? defaultInt : b;
	}

	public int getInt(Object key, int defaultInt) {
		Integer i = getInt(key);
		return i == null ? defaultInt : i;
	}

	public long getLong(Object key, int defaultInt) {
		Long i = getLong(key);
		return i == null ? defaultInt : i;
	}

	public String getString(Object key, String defaultValue) {
		String value = getString(key);
		return value == null ? defaultValue : value;
	}

	public void puts(Object... args) {
		for (int i = 1; i < args.length; i += 2) {
			put(String.valueOf(args[i - 1]), args[i]);
		}
	}

	public String toJson() {
		return JsonUtil.getJson(this);
	}

	public String toJson(Object... keys) {
		Map<Object, Object> map = new HashMap<Object, Object>();
		for (int i = 0; i < keys.length; i++) {
			if (this.containsKey(keys[i]))
				map.put(keys[i], this.get(keys[i]));
		}
		return JsonUtil.getJson(map);
	}
}