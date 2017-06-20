package com.weihua.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Bean
{
	private String name;

	private String sex;

	private String aa;

	private String cc;

	public String getName()
	{
		return name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public String getSex()
	{
		return sex;
	}

	public void setSex(String sex)
	{
		this.sex = sex;
	}

	public String getAa()
	{
		return aa;
	}

	public void setAa(String aa)
	{
		this.aa = aa;
	}

	public String getCc()
	{
		return cc;
	}

	public void setCc(String cc)
	{
		this.cc = cc;
	}

	public static void main(String[] args)
	{
		Bean bean = new Bean();
		bean.setAa("a");
		bean.setCc("c");
		bean.setName("name");
		bean.setSex("sex");		
		String beanJson=JsonUtil.toJsonByExcludes(bean, new String[]{"aa","cc"});
		System.out.println(beanJson);
		beanJson=JsonUtil.toJsonByIncludes(bean, new String[]{"name","sex"});
		System.out.println(beanJson);

		
	}

}
