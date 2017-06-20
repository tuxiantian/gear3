package com.weihua.core.utils;

import java.util.Properties;

import org.apache.log4j.Logger;

public class PropertiesUtil {
	
	private static final Logger logger = Logger.getLogger(PropertiesUtil.class);

	public static Properties load(String fileName){
		if(fileName!=null && fileName.length()>0){
			try {
				Properties p = new Properties(); 
				p.load(PropertiesUtil.class.getClassLoader().getResourceAsStream(fileName));
				
				return p;
			} catch (Exception e) {
				logger.info("load properties error. fileName:"+fileName, e);
			}
		}
		return null;
	}

	public static String getStringValue(String key, Properties p){
		return getStringValue(key, null, p);
	}
	
	
	public static String getStringValue(String key, String defaultValue, Properties p){
		if(p!=null && key!=null && key.length()>0){
			String t = p.getProperty(key);
			if(t!=null){
				return t.trim();
			}
		}
		return defaultValue; 
	}
	
	public static boolean getBooleanValue(String key, Properties p){
		return getBooleanValue(key, false, p);
	}
	public static boolean getBooleanValue(String key, boolean defaultValue, Properties p){
		if(p!=null && key!=null && key.length()>0){
			String t = p.getProperty(key);
			if(t!=null){
				if("true".equals(t) || "1".equals(t)){
					return true;
				}else{
					return false;
				}
			}
		}
		return defaultValue; 
	}
	
	
}
