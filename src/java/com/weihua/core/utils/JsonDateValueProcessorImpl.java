package com.weihua.core.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

import net.sf.json.JsonConfig;
import net.sf.json.processors.JsonValueProcessor;

import com.weihua.core.Constants;

public class JsonDateValueProcessorImpl implements JsonValueProcessor {
	private String format;

	public JsonDateValueProcessorImpl() {
		format = Constants.SYS_DATE_FORMAT;
	}

	public JsonDateValueProcessorImpl(String format) {
		this.format = format;
	}

	public Object processArrayValue(Object value, JsonConfig jsonConfig) {
		String[] obj = {};
		if (value instanceof Date[]) {
			SimpleDateFormat sf = new SimpleDateFormat(format);
			Date[] dates = (Date[]) value;
			obj = new String[dates.length];
			for (int i = 0; i < dates.length; i++) {
				obj[i] = sf.format(dates[i]);
			}
		}
		return obj;
	}

	public Object processObjectValue(String key, Object value,
			JsonConfig jsonConfig) {
		if (null == value) {
			return "";
		} else if (value instanceof Date) {
			String str = new SimpleDateFormat(format).format((Date) value);
			return str;
		} else {
			return value.toString();
		}
 		
	}

	public String getFormat() {
		return format;
	}

	public void setFormat(String format) {
		this.format = format;
	}

}