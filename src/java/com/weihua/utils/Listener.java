package com.weihua.utils;

public abstract class Listener implements Runnable
{

	public abstract void onEvent(Object... param);

	private Object[] param;
	
	private String eventName;
	

	@Override
	public void run()
	{
		this.onEvent(this.getParam());
		
	}

	public Object[] getParam()
	{
		return param;
	}

	public void setParam(Object[] param)
	{
		this.param = param;
	}

	public String getEventName()
	{
		return eventName;
	}

	public void setEventName(String eventName)
	{
		this.eventName = eventName;
	}
	
	

}
