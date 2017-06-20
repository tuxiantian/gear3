package com.weihua.core.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JsonConfig;
@SuppressWarnings("unchecked")
public class JsonUtil {
	public static final JsonConfig cfg = new JsonConfig();
	static {
		cfg.registerJsonValueProcessor(java.util.Date.class, new JsonDateValueProcessorImpl());
		cfg.registerJsonValueProcessor(java.sql.Date.class, new JsonDateValueProcessorImpl());
		cfg.registerJsonValueProcessor(java.sql.Timestamp.class, new JsonDateValueProcessorImpl());
	}

	public static JsonConfig getJsonConfig(String dataformat) {
		JsonConfig cfg = new JsonConfig();
		cfg.registerJsonValueProcessor(java.util.Date.class, new JsonDateValueProcessorImpl(dataformat));
		cfg.registerJsonValueProcessor(java.sql.Date.class, new JsonDateValueProcessorImpl(dataformat));
		cfg.registerJsonValueProcessor(java.sql.Timestamp.class, new JsonDateValueProcessorImpl(dataformat));
		return cfg;
	}

	public static String getJson(Object target) {
		return getJson(target, cfg);
	}
	
	public static JSONObject toObject(String json) {
		//将null替换成空字符串
		json=json.replaceAll("\":null,\"", "\":\"\",\"");
		return JSONObject.fromObject(json, cfg);
	}
	
	public static JSONArray toArray(String json) {
		return JSONArray.fromObject(json, cfg);
	}
	
	/**
	 * 将对象转成JSON字符串
	 */
	public static String getJson(Object target, JsonConfig cfg) {
		if (target == null) return "{}";
		String str = "";
		if (target instanceof List) {
			JSONArray arr = JSONArray.fromObject(target, cfg);
			str = arr.toString();
		} else {
			JSONObject obj = JSONObject.fromObject(target, cfg);
			str = obj.toString();
		}
		str = str.replaceAll("\"true\"", "true");
		str = str.replaceAll("\"false\"", "false");
		return str;
	}

	public static String getJson(Object target, String dataFormat) {
		JsonConfig cfg = getJsonConfig(dataFormat);
		if (target instanceof List) {
			JSONArray arr = JSONArray.fromObject(target, cfg);
			return arr.toString();
		}
		JSONObject obj = JSONObject.fromObject(target, cfg);
		return obj.toString();
	}

	public static String getJsonForExt(List data, Long count, Map attrs) {
		Map info = new HashMap();
		info.put("rows", data);
		info.put("success", Boolean.TRUE);
		if (attrs != null) info.put("attrs", attrs);
		if (count != null) info.put("total", count);
		JSONObject obj = JSONObject.fromObject(info, cfg);
		return obj.toString();
	}

	public static String getJsonForExt(List data, Long count) {
		return getJsonForExt(data, count, null);
	}

	public static String getJsonForExt(List data) {
		return getJsonForExt(data, null);
	}

	public static String getJsonForExt(Object data) {
		return getJsonForExt(MixUtil.newArrayList(data));
	}
	
	/**
	 * 用于AutoComplete
	 * @param query
	 * @param suggestions
	 * @param data
	 */
	public static String getJsonForAC(String query,List<Map> datas) {
		if(datas==null||datas.isEmpty()) return "{query:'"+query+"',suggestions:[],data:[]}";
		List suggestions =new ArrayList(),data =new ArrayList();
		for (int i = 0,n=datas.size(); i <n; i++) {
			Map tmp=datas.get(i);
			suggestions.add(tmp.get("TEXT"));
			data.add(tmp.get("ID"));
		}
		return getJson(new MapBean("query",query,"suggestions",suggestions,"data",data));
	}
}
