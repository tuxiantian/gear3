package com.weihua.core.utils;

import java.text.ParseException;
import java.util.Date;
import java.util.Properties;

/**
 * 返回配置属性
 * @author wbq
 *
 */
public class ConfigUtil extends PropertiesUtil{

	private static Properties all;
	
	private static final String fileName = "config.properties";
	
	private static final String _upload_path_defValue = "/opt/upload";
	
	static{
		all = load(fileName);
	}
	

	/**
	 * 根据属性文件配置，返回是否为单机部署（不是集群）
	 * @return
	 */
	public static boolean isSingle(){
		return getBooleanValue("config.is.single", all);
	}
	
	/**
	 * 根据属性配置，返回上传路径，如果找不到值，则返回默认值 （属性_upload_path_defValue定义）
	 * @return
	 */
	public static String getUploadPath(){
		return getStringValue("config.upload.path", _upload_path_defValue, all);
	}
	
	public static String getStringValue(String key){
		return getStringValue(key, all);
	}
	
	public static String getStringValue(String key, String defa){
		return getStringValue(key, defa, all);
	}
	
	public static Long getLongValue(String key){
		try {
			Long.parseLong(getStringValue(key));
		} catch (Exception e) {
		}
		return null;
	}
	
	public static Long getLongValue(String key, Long defa){
		Long t = getLongValue(key);
		if(t==null)return defa;
		return t;		
	}
	
	public static Double getDoubleValue(String key){
		try {
			Double.parseDouble(getStringValue(key));
		} catch (Exception e) {
		}
		return null;
	}
	
	public static Double getDoubleValue(String key, Double defa){
		Double t = getDoubleValue(key);
		if(t==null)return defa;
		return t;		
	}		
	
	public static boolean getBooleanValue(String key){
		return getBooleanValue(key, all);
	}	
	
	public static Date getDateValue(String key){
		try {
			return DateUtil.parse(getStringValue(key));
		} catch (Exception e) {
		}
		return null;
	}
	public static Date getDateValue(String key, String format, Date defa){
		try {
			return DateUtil.parse(getStringValue(key), format);
		} catch (Exception e) {
		}
		return defa;
	}
}
