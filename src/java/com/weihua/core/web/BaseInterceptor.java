package com.weihua.core.web;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.interceptor.AbstractInterceptor;
import com.weihua.core.utils.JsonUtil;

abstract public class BaseInterceptor extends AbstractInterceptor
{
	protected Logger logger = Logger.getLogger(this.getClass());
	private static final long serialVersionUID = 347981393527615692L;
	public static final String SUCCESS = "success";
	public static final String MSG = "msg";
	public static final String DETAIL = "detail";

	public void renderText(String text)
	{
		HttpServletResponse response = ServletActionContext.getResponse();
		try
		{
			response.setCharacterEncoding("UTF-8");
			response.setContentType("application/json");
			response.getWriter().write(text);
		}
		catch (IOException e)
		{
			logger.error(e);
		}
	}

	@SuppressWarnings("unchecked")
	public void renderJson(Map rst)
	{
		this.renderText(JsonUtil.getJson(rst));
	}
}
