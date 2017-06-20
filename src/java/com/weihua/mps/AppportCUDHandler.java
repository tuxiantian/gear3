package com.weihua.mps;

import java.util.Map;

import com.weihua.core.web.DefaultCUDHandler;

public class AppportCUDHandler extends DefaultCUDHandler
{
	private String id;

	public AppportCUDHandler(String id, Map data)
	{
		super("_appport", data);
		this.id = id;
	}

	@Override
	public boolean beforeInsert(Object record)
	{
		((Map) record).put("APP_ID", this.id);
		return true;
	}

}
