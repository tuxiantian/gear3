/**
 * 
 * 工厂，web容器参数管理常用工具
 */
package com.weihua.utils;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.struts2.ServletActionContext;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

public abstract class ServiceUtil
{

	public static final ApplicationContext ctx = getWebApplicationContext();// 静态初始化

	/**
	 * 函数介绍：获得spring 工厂环境 参数：无 返回值：spring 工厂环境对象
	 */
	private static WebApplicationContext getWebApplicationContext()
	{
		return WebApplicationContextUtils.getWebApplicationContext(getServletContext());
	}

	/**
	 * 函数介绍：获得servlet 容器 参数：无 返回值：servlet 容器对象
	 */
	private static ServletContext getServletContext()
	{
		return ServletActionContext.getServletContext();// 调用struts2 的静态类
	}

	/**
	 * 函数介绍：根据名称获得 Spring 工厂中管理 bean 参数：bean 名称 返回值：管理对象
	 */
	public static Object getBean(String beanName)
	{

		return ctx.getBean(beanName);
	}

	/**
	 * 函数介绍：得到web容器中session 值 参数：主键key 返回值：session 值对象
	 */
	public static Object getSessionValue(String name)
	{
		HttpSession session = ServletActionContext.getRequest().getSession();
		return session.getAttribute(name);
	}

	/**
	 * 函数介绍：设置web容器中session 值 参数：key，主键；value,值对象 返回值：session 值对象
	 */
	public static void setSessionValue(String key, Object value)
	{
		HttpSession session = ServletActionContext.getRequest().getSession();
		session.setAttribute(key, value);
	}

	/**
	 * 函数介绍：获得request单值请求值 参数：key，键名 返回值：request 值对象
	 */
	public static String getParameter(String name)
	{
		HttpServletRequest request = ServletActionContext.getRequest();
		return request.getParameter(name);
	}

	/**
	 * 函数介绍：获得request单值请求值数组 参数：key，键名 返回值：request 值对象数组
	 */
	public static String[] getParameterValues(String name)
	{

		HttpServletRequest request = ServletActionContext.getRequest();
		return request.getParameterValues(name);
	}

	public static void addObjectCache(String key, Object object, Integer lasting)
	{
		if (null == key || null == object || null == lasting) return;
		Map map = new HashMap();
		map.put("object", object);
		map.put("lasting", lasting + new Date().getTime());
		setSessionValue(key, map);

	}

	public static Object getObjectByCache(String key)
	{
		Object map = getSessionValue(key);
		if (map != null)
		{

			Object lasting = ((Map) map).get("lasting");
			if (((Long) lasting).longValue() >= new Date().getTime())
			{
				return ((Map) map).get("object");
			}
		}
		return null;
	}

	public static String getSessionId()
	{
		HttpSession session = ServletActionContext.getRequest().getSession();
		return session.getId();
	}

	public static String getRequestURL()
	{
		HttpServletRequest request = ServletActionContext.getRequest();
		return request.getRequestURL().toString();
	}

	// wjf2010-11-4 加入客户端请求的IP
	public static String getRequestIP()
	{
		HttpServletRequest request = ServletActionContext.getRequest();
		return request.getRemoteAddr().toString();
	}

}
