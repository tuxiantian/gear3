package com.weihua.core.exception;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;
import org.springframework.dao.DataAccessException;

import com.opensymphony.xwork2.Action;
import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.ActionSupport;
import com.opensymphony.xwork2.config.ConfigurationException;
import com.weihua.core.utils.JsonUtil;
import com.weihua.core.utils.MapBean;
import com.weihua.core.web.BaseInterceptor;

public class ExceptionMappingInterceptor extends BaseInterceptor
{
	private static final long serialVersionUID = -788210094780998086L;

	private static final Logger logger = Logger.getLogger(ExceptionMappingInterceptor.class);

	public void renderText(String text)
	{
		HttpServletResponse response = ServletActionContext.getResponse();
		try
		{
			response.setCharacterEncoding("UTF-8");
			response.setContentType("application/json");
			response.setHeader("JsonError", "true");
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

	@Override
	public String intercept(ActionInvocation invocation) throws Exception
	{
		try
		{
			return invocation.invoke();
		}
		catch (Exception e)
		{
			logger.error(e);
			HttpServletRequest request = ServletActionContext.getRequest();
			boolean isAjax = "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
			ActionSupport actionSupport = (ActionSupport) invocation.getAction();
			exception(isAjax, e, actionSupport);
			// if(logger.isDebugEnabled()) logger.debug(e.getMessage());			
			return isAjax ? null : Action.ERROR;
		}
	}

	private void exception(boolean isAjax, Exception e, ActionSupport actionSupport) throws Exception
	{
		if (e instanceof DataAccessException)
		{
			DataAccessException dae = (DataAccessException) e;
			if (isAjax)
			{
				this.renderJson(new MapBean(SUCCESS, false, "code", "db", "msg", "数据库操作失败!", "detail", dae.getMessage()));
			}
			else
			{
				throw e;
			}
		}
		else
			if (e instanceof ConfigurationException)
			{
				if (isAjax)
				{
					this.renderJson(new MapBean(SUCCESS, false, "code", "cfg", "msg", "配置错误,请确认是否在struts.xml包含了该模块文件", "detail", e.getMessage()));
				}
				else
				{
					throw e;
				}
			}
			else
				if (e instanceof BusinessException)
				{
					if (isAjax)
					{
						BusinessException be = (BusinessException) e;
						this.renderJson(new MapBean(SUCCESS, false, "code", be.getCode(), "msg", be.getMsg(), "detail", be.getDetail()));
					}
					else
					{
						throw e;
					}
				}
				else
					if (e instanceof NoSuchMethodException)
					{
						if (isAjax)
						{
							this.renderJson(new MapBean(SUCCESS, false, "code", "NoSuchMethodException", "msg", "该请求对应的方法不存在!", "detail", e.getMessage()));
						}
						else
						{
							throw e;
						}
					}
					else
					{
						if (isAjax)
						{
							this.renderJson(new MapBean(SUCCESS, false, "code", "other", "msg", "系统运行出错!", "detail", e.getMessage()));

						}
						else
						{
							throw e;
						}
					}
	}
}