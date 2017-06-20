package com.weihua.core.log;

import org.apache.log4j.spi.Filter;
import org.apache.log4j.spi.LoggingEvent;

public class UrlFilter extends Filter
{
	private String excludeUrl;

	private String excludes[];

	public int decide(LoggingEvent event)
	{

		String msg = event.getRenderedMessage();
		//System.out.println("-------------------------------->"+msg);
		String url = msg.split("\\|")[2];
		if (isExcluded(url))
		{
			return Filter.DENY;
		}
		else
		{
			return Filter.ACCEPT;
		}
	}

	public String getExcludeUrl()
	{
		return excludeUrl;
	}

	public void setExcludeUrl(String excludeUrl)
	{
		this.excludeUrl = excludeUrl;
		this.excludes = excludeUrl.split(",");
	}

	public boolean isExcluded(String url)
	{
		if (excludes != null)
		{
			org.springframework.util.AntPathMatcher apm = new org.springframework.util.AntPathMatcher();
			for (int i = 0; i < excludes.length; i++)
			{
				if (apm.match(excludes[i], url)) { return true; }
			}
		}

		return false;
	}

}
