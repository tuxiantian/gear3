package com.weihua.core.utils;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import net.sf.json.JSONArray;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.struts2.ServletActionContext;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.util.Assert;
import org.springframework.web.context.support.WebApplicationContextUtils;
/**
 * 常用方法
 */
@SuppressWarnings("unchecked")
public class MixUtil {
	protected final Log logger = LogFactory.getLog(getClass());

	public static String[] toArray(List<String> list) {
		Assert.notNull(list);
		return list.toArray(new String[list.size()]);
	}

	public static Map<Object, Object> toMap(Object[] args) {
		Map<Object, Object> map = new HashMap<Object, Object>();
		for (int i = 1; i < args.length; i += 2) {
			map.put(args[i - 1], args[i]);
		}
		return map;
	}
	
	public static void addUserParams(Map map){
		map.put("CUR_USERNAME", MixUtil.getUser().get("USERNAME"));
		map.put("CUR_DEPTNAME", MixUtil.getUser().get("DEPTNAME"));
		map.put("CUR_USERID", MixUtil.getUser().get("USERID"));
		map.put("CUR_DEPTID", MixUtil.getUser().get("DEPTID"));
		map.put("CUR_COMPANYID", MixUtil.getUser().get("COMPANYID"));
		map.put("CUR_COMPANYNAME", MixUtil.getUser().get("COMPANYNAME"));
		map.put("CUR_U8CODE", MixUtil.getUser().get("U8CODE"));
	}
	
	public static Map beanToMap(Object bean) {
		if (bean == null) return new HashMap();
		Map rst = new HashMap();
		if (bean instanceof java.util.Map) {
			rst = (Map) bean;
		} else if (bean instanceof String || bean instanceof Long || bean instanceof Integer) {
			rst.put("value", bean);
		} else {
			try {
				rst.putAll(PropertyUtils.describe(bean));
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			} catch (InvocationTargetException e) {
				e.printStackTrace();
			} catch (NoSuchMethodException e) {
				e.printStackTrace();
			}
		}
		return rst;
	}

	public static <T> List<T> newArrayList(T... arg) {
		List<T> tmp = new ArrayList<T>();
		for (int i = 0; i < arg.length; i++) {
			tmp.add(arg[i]);
		}
		return tmp;
	}

	public static Map<Object, Object> newHashMap(Object... args) {
		return toMap(args);
	}

	/**
	 * 获取spring的bean
	 */
	public static Object getBean(String beanName) {
		ApplicationContext ctx = WebApplicationContextUtils.getRequiredWebApplicationContext(ServletActionContext
				.getServletContext());
		return ctx.getBean(beanName);
	}

	public static Object getBean(String beanName, HttpServletRequest req){
		ApplicationContext ctx = WebApplicationContextUtils.getRequiredWebApplicationContext(req.getSession().getServletContext());
		return ctx.getBean(beanName);
	}
	
	/**
	 * 获取当前线程的用户
	 * 
	 * @return
	 */
	public static MapBean getUser() {
		MapBean user = (MapBean) ServletActionContext.getRequest().getSession().getAttribute(
				com.weihua.core.Constants.SYS_SESSION_USER);
		return user;
	}

	/**
	 * 判断当前用户是否管理员
	 * 
	 * @return
	 */
	public static boolean isAdmin() {
		Long uid = getUserId();
		if (uid == null) return false;
		return isRole(uid, new Integer[] { 1 }, true);
	}

	public static boolean isRole(Long userid, Integer[] roleIds, boolean isOr) {
		if (userid == null || roleIds == null || roleIds.length == 0) {
			return false;
		}
		JdbcTemplate tpl = new JdbcTemplate((DataSource) MixUtil.getBean("dataSource"));
		StringBuilder roles = new StringBuilder(roleIds[0] + "");
		for (int i = 1; i < roleIds.length; i++) {
			roles.append("," + roleIds[i]);
		}
		List rst = tpl.queryForList("select 1 from t_sys_user_role t where userid=? and roleid in(" + roles
				+ ") group by userid,roleid", new Object[] { userid });
		int num = rst == null ? 0 : rst.size();
		return isOr ? num > 0 : num == roleIds.length;
	}

	public static boolean isRole(Integer[] roleIds, boolean isOr) {
		return isRole(MixUtil.getUserId(), roleIds, isOr);
	}

	public static boolean isRole(String[] roleNames, boolean isOr) {
		return isRole(MixUtil.getUserId(), roleNames, isOr);
	}

	public static boolean isRole(Long userid, String[] roleNames, boolean isOr) {
		if (userid == null || roleNames == null || roleNames.length == 0) {
			return false;
		}
		JdbcTemplate tpl = new JdbcTemplate((DataSource) MixUtil.getBean("dataSource"));
		StringBuilder roles = new StringBuilder("'"+roleNames[0] + "'");
		for (int i = 1; i < roleNames.length; i++) {
			roles.append(",'" + roleNames[i]+"'");
		}
		List rst = tpl.queryForList(
				"select 1 from t_sys_user_role t1,t_sys_role t2 where t1.roleid = t2.roleid and userid=? and t2.rolename in("
						+ roles.toString() + ") group by t1.userid,t1.roleid", new Object[] { userid });
		int num = rst == null ? 0 : rst.size();
		return isOr ? num > 0 : num == roleNames.length;
	}

	public static Long getUserId() {
		return getUser().getLong("USERID");
	}
	public static String getUserName(){
		return getUser().getString("USERNAME");
	}
	public static Long getDeptId() {
		return getUser().getLong("DEPTID");
	}
	public static Long getCompanyId() {
		return getUser().getLong("COMPANYID");
	}
	/**
	 * 转换变量
	 */
	public static Object transVar(Object s) {
		if ("{user.deptId}".equals(s)) {
			return getUser().get("DEPTID");
		} else {
			return s;
		}
	}

	public static void transVars(Map params, String[] keys) {
		for (int i = 0; i < keys.length; i++) {
			params.put(keys[i], transVar(params.get(keys[i])));
		}
	}

	public static void exportExcel(String cols) throws IOException {
		HttpServletResponse response = ServletActionContext.getResponse();
		response.reset();
		response.setContentType("application/zip;charset=UTF-8");
		response.addHeader("Content-Disposition", "inline;filename=a.xls");
		final PrintWriter sb = response.getWriter();
		cols = cols.trim();
		sb
				.append("<html xmlns:o='urn:schemas-microsoft-com:office:office'  xmlns:x='urn:schemas-microsoft-com:office:excel'  xmlns='http://www.w3.org/TR/REC-html40'>");
		sb.append("<head><meta http-equiv=Content-Type content='text/html;charset=UTF-8'></head><body>");
		sb.append("<table border='1'>");
		if (cols.startsWith("[") && cols.endsWith("]")) {
			JSONArray lst = JsonUtil.toArray(cols);
			final String[] info = new String[lst.size()];
			sb.append("<tr>");
			for (int i = 0; i < lst.size(); i++) {
				JSONArray row = (JSONArray) lst.get(i);
				info[i] = row.get(0).toString();
				sb.append("<td>").append(row.get(1) + "</td>");
				// sb.append("	").append(row.get(1) + "");
			}
			sb.append("</tr>");
			// sb.append("\n\r");
			JdbcTemplate tpl = new JdbcTemplate((DataSource) MixUtil.getBean("dataSource"));
			tpl.query("select * from t_goods_info where rownum < 65536", new RowCallbackHandler() {
				public void processRow(ResultSet rs) throws SQLException {
					sb.append("<tr>");
					for (int j = 0; j < info.length; j++) {
						// sb.append("	").append(StringUtil.nvl(rs.getString(info[j])));
						sb.append("<td>").append(StringUtil.nvl(rs.getString(info[j]))).append("</td>");
					}
					sb.append("</tr>");
					// sb.append("\n\r");
				}
			});
		} else {}
		sb.append("</table></body></html>");
		sb.flush();
	}

	public static JdbcTemplate getMysqlJdbcTemplate() {
		return (JdbcTemplate) MixUtil.getBean("mySqlJdbcTemplate");
	}

	public static String generateFileName(String fileName) {
		DateFormat format = new SimpleDateFormat("yyMMddHHmmss");
		String formatDate = format.format(new Date());
		int random = new Random().nextInt(1000);
		String randStr = UtilMD5.crypt(fileName + random);
		randStr = randStr.substring(2, 10);
		int position = fileName.lastIndexOf(".");
		String extension = fileName.substring(position);
		return formatDate + randStr + extension;
	}
	
	/**
	 * 产生文件名，只是文件名，不包含扩展名
	 * @return
	 */
	public static String generateFileName(){
		DateFormat format = new SimpleDateFormat("yyMMddHHmmss");
		String formatDate = format.format(new Date());
		int random = new Random().nextInt(1000);
		String randStr = UtilMD5.crypt(formatDate+random);
		randStr = randStr.substring(2, 10);
		
		return formatDate+randStr;
	}
	
	/**
	 * 根据源文件名，返回pdf或者swf的文件名
	 * @param fileName 文件名，可以带扩展名，也可以不带扩展名，判断扩展名标准为是否包含  . 如果包含，则其之后的为扩展名
	 * @param id 标志，pdf或者swf , 默认为pdf文件名。
	 * @return 新文件名
	 */
	public static String generateFileName(String fileName, String id){
		if(fileName!=null && id!=null){
			int p = fileName.lastIndexOf('.');
			//String ext = null;
			String tf = null;
			//第一个位置,就是.doc格式
			if(p==0){
			//	ext = fileName;
				tf = generateFileName();
			}else if(p>0){
				//ext = fileName.substring(p);
				tf = fileName.substring(0,p-1);
			}else{
				//没有扩展名
				tf = fileName;
			}
			
			if("swf".equals(id)){
				return tf + ".swf";
			}else{
				return tf + ".pdf";
			}
		}
		
		return null;
	}
	
	/**
	 * 根据参数手机号，返回解析的手机号
	 * @param handPhone
	 * @return
	 */
	public static String getDefaultMobile(String handPhone){
		if(handPhone!=null){
			String m = handPhone;
			if(handPhone.indexOf(",")>-1){
				m = handPhone.split(",")[0];
			}else if(handPhone.indexOf(" ")>-1){
				m = handPhone.split(" ")[0];
			}
			
			if(m.length()>11){
				m = m.substring(0, 11);
			}
			return m;
		}
		return "";
	}
}
