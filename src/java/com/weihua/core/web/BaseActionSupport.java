package com.weihua.core.web;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.struts2.ServletActionContext;
import org.dom4j.Document;
import org.springframework.web.util.WebUtils;

import com.opensymphony.xwork2.ActionSupport;
import com.opensymphony.xwork2.Preparable;
import com.weihua.core.Constants;
import com.weihua.core.utils.DateUtil;
import com.weihua.core.utils.JsonUtil;
import com.weihua.core.utils.MixUtil;
import com.weihua.core.utils.RequestUtil;
import com.weihua.core.utils.StringUtil;

@SuppressWarnings("unchecked")
public abstract class BaseActionSupport extends ActionSupport implements
		Preparable {
	private static final long serialVersionUID = -4540062085613373278L;
	protected final Log logger = LogFactory.getLog(getClass());
	public static final String LOGIN = "login";
	public static final String INDEX = "index";
	public static final String MSG_SUCCESS = "操作成功!";// 返回消息
	public static final String PAGE_JSON_KEY = "JSON_DATA"; // 默认提交JSON数据的参数名	
	public static final String JSONP_CALLBACK="callback";
	public static final String DETAIL="detail";
	private String msg;
	protected Map user;
	// 显示日期时使用
	public static final SimpleDateFormat sdf = new SimpleDateFormat(
			"yyyy年MM月dd日");

	/**
	 * 直接获取参数
	 */
	protected String $(String name) {
		return ServletActionContext.getRequest().getParameter(name);
	}

	/**
	 * 获取request所有的参数
	 */
	protected Map $map() {
		Map map = WebUtils.getParametersStartingWith(ServletActionContext
				.getRequest(), null);
		if (null != map && MixUtil.getUser() != null) {
			MixUtil.addUserParams(map);
		}
		return map;
	}

	protected Document $doc() {
		try {
			return RequestUtil.getDoc(ServletActionContext.getRequest());
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("解析xml出错!");
		}
	}

	protected Long $long(String name) {
		String v = $(name);
		return StringUtil.isBlank(v) ? null : Long.parseLong(v.trim());
	}

	protected Integer $int(String name) {
		String v = $(name);
		return StringUtil.isBlank(v) ? null : Integer.parseInt(v.trim());
	}

	protected Integer $int(String name, int def) {
		String v = $(name);
		return StringUtil.isBlank(v) ? def : Integer.parseInt(v.trim());
	}

	protected Boolean $bool(String name) {
		String v = $(name);
		return StringUtil.isBlank(v) ? null : Boolean.parseBoolean(v.trim());
	}

	protected Object $attr(String attrKey) {
		return ServletActionContext.getRequest().getAttribute(attrKey);
	}

	protected void $attr(String attrKey, Object attrValue) {
		ServletActionContext.getRequest().setAttribute(attrKey, attrValue);
	}

	protected void $attrs(Object... args) {
		HttpServletRequest req = ServletActionContext.getRequest();
		for (int i = 1; i < args.length; i += 2) {
			req.setAttribute(String.valueOf(args[i - 1]), args[i]);
		}
	}

	protected Map $data() {
		return JsonUtil.toObject($(PAGE_JSON_KEY));
	}

	protected List $listData() {
		return JsonUtil.toArray($(PAGE_JSON_KEY));
	}

	/**
	 * 直接输出.
	 * 
	 * @param contentType
	 *            内容的类型.html,text,xml的值见后，json为"text/x-json;charset=UTF-8"
	 */
	protected void render(String text, String contentType) {
		HttpServletResponse response = ServletActionContext.getResponse();
		try {
			response.setContentType(contentType + ";charset="
					+ Constants.SYS_PAGE_ENCODE);
			response.getWriter().write(text);
		} catch (IOException e) {
			// log.error(e.getMessage(), e);
		}
	}

	/**
	 * 直接输出纯字符串.
	 */
	protected void renderText(String text) {
		render(text, "text/plain");
	}

	/**
	 * 直接输出纯HTML.
	 */
	protected void renderHtml(String text) {
		render(text, "text/html");
	}

	/**
	 * 直接输出纯XML.
	 */
	protected void renderXML(String text) {
		render(text, "text/xml");
	}

	/**
	 * 直接输出JSON.
	 */
	protected void renderJson(Object obj) {
		render(JsonUtil.getJson(obj), "text/html");
	}
	
	protected void renderJsonp(Object param)
	{
		if(param instanceof String){
			render($(JSONP_CALLBACK)+"("+param+")","text/javascript");	
		}else{
			render($(JSONP_CALLBACK)+"("+JsonUtil.getJson(param)+")","text/javascript");	
		}
	}

	/**
	 * 直接输出Excel.
	 */
	protected void renderExcel(String cols) {
		try {
			MixUtil.exportExcel(cols);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 简单输出调用信息 {successs:true/false,msg:'....'}
	 */
	protected void renderJson(boolean success, String msg) {
		renderJson(MixUtil.newHashMap(Constants.SYS_AJAX_RESULT_FLAG, success,
				Constants.SYS_AJAX_RESULT_MESSAGE, msg));
	}
	
	/**
	 * 简单输出正确调用信息 {successs:true/false,msg:'....'}
	 */
	protected void renderSuccessJson(String msg) {
		renderJson(MixUtil.newHashMap(Constants.SYS_AJAX_RESULT_FLAG, true,
				Constants.SYS_AJAX_RESULT_MESSAGE, msg));
	}
	
	
	/**
	 * 简单输出错误调用信息 {successs:true/false,msg:'....'}
	 */
	protected void renderErrorJson(String msg,String detail) {
		renderJson(MixUtil.newHashMap(Constants.SYS_AJAX_RESULT_FLAG, false,
				Constants.SYS_AJAX_RESULT_MESSAGE, msg,DETAIL,detail));
	}
	
	/**
	 * 简单输出错误调用信息 {successs:true/false,msg:'....'}
	 */
	protected void renderErrorJson(String msg,Throwable t) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw, true);
        t.printStackTrace(pw);
        pw.flush();
        sw.flush();          
		renderJson(MixUtil.newHashMap(Constants.SYS_AJAX_RESULT_FLAG, false,
				Constants.SYS_AJAX_RESULT_MESSAGE, msg,DETAIL,sw.toString()));
	}

	/**
	 * 简单输出调用信息 {successs:true/false,msg:'....',data:{}}
	 */
	protected void renderJson(boolean success, String msg, Object data) {
		renderJson(MixUtil.newHashMap(Constants.SYS_AJAX_RESULT_FLAG, success,
				Constants.SYS_AJAX_RESULT_MESSAGE, msg,
				Constants.SYS_AJAX_RESULT_DATA, data));
	}

	/**
	 * 用于Ext的form
	 * 
	 * @param data
	 */
	protected void renderForm(Object data) {
		renderJson(JsonUtil.getJsonForExt(data));
	}

	/**
	 * 获取当前用户
	 */
	public Map getUser() {
		return user;
	}

	/**
	 * 预设一些变量，便于调用
	 */
	public void prepare() throws Exception {
		user = MixUtil.getUser();
	}

	/**
	 * 工具方法,用于页面
	 * 
	 * @return
	 */
	public List<List> chunk(List<Object> src, int num, Object instead) {
		List<List> rst = new ArrayList();
		int size = src.size();
		int len = (size / num + 1) * num;
		List<Object> dest = null;
		for (int i = 0; i < len; i++) {
			if (i % num == 0)
				dest = new ArrayList();
			if (i < size) {
				dest.add(src.get(i));
			} else {
				dest.add(instead);
			}
			if (i % num == num - 1)
				rst.add(dest);
		}
		return rst;
	}

	// 输出oracle自定义错误信息
	public void renderOraExpMsg(String msg) {
		if (null != msg && msg.indexOf("ORA-20501:") > 0) {
			this.renderJson(false, msg.replaceAll(
					"(?s).*ORA-20501:|ORA-06512:(?s).*", ""));
		} else {
			this.renderJson(false, msg);
		}
	}

	public boolean isRole(String roles, boolean isOr) {
		if (roles == null)
			return false;
		String[] strs = roles.trim().split("\\s*,\\s*");
		Integer[] roleIds = new Integer[strs.length];
		for (int i = 0; i < strs.length; i++) {
			roleIds[i] = Integer.parseInt(strs[i]);
		}
		return MixUtil.isRole(roleIds, isOr);
	}

	public boolean isRole(String roles) {
		return isRole(roles, true);
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	/**
	 * 设置显示内容到request，显示的内容为： 用户名 您好！今天是 当前日期。例如：王保全 您好！今天是2011年08月24日 星期三
	 * 
	 * @param name
	 *            设置到request得名字
	 */
	public void $attrDate(String name) {
		if (name != null) {
			// 设置显示日期
			Date d = new Date();
			$attr(name, MixUtil.getUser().getString("USERNAME")
					+ "&nbsp;&nbsp;您好！今天是" + sdf.format(d) + " "
					+ DateUtil.getWeekName(d));
		}
	}
}
