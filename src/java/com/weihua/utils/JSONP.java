package com.weihua.utils;

import javax.servlet.http.HttpServletRequest;

public class JSONP
{

	public String prefix;
	public String endfix;
	public String name;

	public JSONP(HttpServletRequest request, String name)
	{
		String agent = request.getHeader("User-Agent");
		if (agent.indexOf("Firefox") >= 0)
		{
			prefix = "var " + name + "=(<r><![CDATA[\r\n";
			endfix = "]]></r>).toString();\r\n";
		} else
		{
			prefix = "var " + name + "  =function(){\r\r/*";
			endfix = "*/};\r\n";
		}

		this.name = name;
	}

}
