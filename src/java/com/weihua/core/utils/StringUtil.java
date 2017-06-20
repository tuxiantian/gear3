package com.weihua.core.utils;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
@SuppressWarnings("unchecked")
public class StringUtil {
	public static String nvl(Object str, String def) {
		return (str == null || "".equals(str.toString())) ? def : str.toString();
	}

	public static String nvl(Object str) {
		return nvl(str, "");
	}

	public static boolean isEmpty(String str) {
		return str == null || "".equals(str.trim());
	}
	public static boolean isEmpty(Object str) {
		if(null == str) return true;
		return isEmpty(str.toString());
	}
	
	public static boolean isNumber(Object str) {
		try{
			Double.valueOf(str.toString());
			return true;
		}catch(Exception e){
			return false;
		}
	}
	
	public static boolean isNotEmpty(String str) {
		return !isEmpty(str);
	}

	public static boolean isBlank(String str) {
		return str == null || "".equals(str.trim());
	}

	public static boolean isNotBlank(String str) {
		return !isBlank(str);
	}
	
	public static boolean isNullOrBlank(String str){
		return str == null || "null".equals(str) || isBlank(str);
	}
	
	public static boolean isNotNullAndBlank(String str){
		return !isNullOrBlank(str);
	}

	public static String format(String formatStr, Object... args) {
		try {
			return MessageFormat.format(formatStr, args);
		} catch (Exception e) {
			return formatStr;
		}
	}

	public static String join(String[] target, String separator) {
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < target.length; i++) {
			if (i != 0) sb.append(separator);
			sb.append(StringUtil.nvl(target[i], ""));
		}
		return sb.toString();
	}

	public static String[] match(String str, String rgExp) {
		List<String> finds = new ArrayList<String>();
		try {
			Pattern regex = Pattern.compile(rgExp);
			Matcher regexMatcher = regex.matcher(str);
			while (regexMatcher.find()) {
				finds.add(regexMatcher.group());
			}
		} catch (Exception ex) {
			System.out.println(ex.getMessage());
		}
		String[] result = new String[finds.size()];
		return finds.toArray(result);
	}
	
	public static String parseSql(String sql, Map param) {
		Pattern p = Pattern.compile("#([^#]*)#|\\$([^$]*)\\$");
		Matcher m = p.matcher(sql);
		StringBuffer sb = new StringBuffer();
		while (m.find()) {
			if (m.group(1) != null) {
				m.appendReplacement(sb, "'" + StringUtil.nvl(param.get(m.group(1)), "") + "'");

			}
			if (m.group(2) != null) {
				m.appendReplacement(sb, StringUtil.nvl(param.get(m.group(2)), ""));
			}
		}
		m.appendTail(sb);
		return sb.toString();
	}	

	
	/**
	 * 格式化字符串，直接替换
	 * @param str
	 * @param param
	 * @return
	 */
	public static String parseSqlNoSingleQuote(String str, Map param) {
		Pattern p = Pattern.compile("#([^#]*)#|\\$([^$]*)\\$");
		Matcher m = p.matcher(str);
		StringBuffer sb = new StringBuffer();
		while (m.find()) {
			if (m.group(1) != null) {
				m.appendReplacement(sb, StringUtil.nvl(param.get(m.group(1)), ""));
			}			
		}
		m.appendTail(sb);
		return sb.toString();
	}
	
	/**
	 * 格式化字符串，直接替换
	 * 
	 * @param str
	 * @param con 替换的字符串
	 * @return
	 */
	public static String parseStr(String str, String con) {
		if(str!=null ){
			return str.replaceAll("#([^#]*)#|\\$([^$]*)\\$", con==null?"":con);
		}
		return null;
	}

   public static String joinString(String key,String value,String deli,String seperate){
	    return new StringBuffer(seperate).append(key).append(deli).append(value).toString();
   }
   
   
   public static Pattern p1 = Pattern.compile("^((\\+{0,1}86){0,1})((13[0-9])|(15[^4,\\D])|(18[0,5-9]))\\d{8}$");

   public static Pattern p2 = Pattern.compile("^((\\+{0,1}86){0,1})");

	/**
	 * 用JAVA正则表达式来校验手机号码以及替换+86或者86 user java reg to check phone number and
	 * replace 86 or +86 only check start with "+86" or "86" ex +8615911119999
	 * 13100009999 replace +86 or 86 with ""
	 * 
	 * @param phoneNum
	 * @return
	 * @throws Exception
	 */
	public static String checkPhoneNum(String phoneNum) {
		Matcher m1 = p1.matcher(phoneNum);
		if (m1.matches()) {
			Matcher m2 = p2.matcher(phoneNum);
			StringBuffer sb = new StringBuffer();
			while (m2.find()) {
				m2.appendReplacement(sb, "");
			}
			m2.appendTail(sb);
			return sb.toString();
		}
		return null;
	}

	/**
	 * 验证手机号是否为正确号码。
	 * 
	 * @param p
	 * @return
	 */
	public static boolean isMobile(String p) {
		if (p != null && p.length() > 0) {
			if (checkPhoneNum(p) != null)
				return true;
		}
		return false;
	}

	/**
	 * 判断手机号是否合法。
	 * 
	 * 要更加准确的匹配手机号码只匹配11位数字是不够的，比如说就没有以144开始的号码段， 故先要整清楚现在已经开放了多少个号码段，国家号码段分配如下：
	 * 移动：134、135、136、137、138、139、150、151、157(TD)、158、159、187、188
	 * 联通：130、131、132、152、155、156、185、186 电信：133、153、180、189、（1349卫通） 见：
	 * http://my.oschina.net/william1/blog/4752
	 * http://blog.myspace.cn/e/405268924.htm
	 * 
	 * @param mobiles
	 * @return
	 */
	public static boolean isMobileNO(String mobiles) {
		return Pattern.compile("^((13[0-9])|(15[^4,\\D])|(18[0,5-9]))\\d{8}$").matcher(mobiles).matches();
	}
}
