package com.weihua.core.web;

import java.util.Map;

public class DefaultCUDHandler extends AbstractCUDHandler
{
	protected String i;// 添加Sql
	protected String u;// 更新sql
	private String d;// 删除sql

	/**
	 * data 的json 结构为 { add:[], //添加记录集合 update:[],//更新记录集合 delete:[]//删除记录集 }
	 */
	public DefaultCUDHandler(String sqlCode, Map data)
	{
		super(sqlCode, data);
		this.setI(sqlCode + "_insert");
		this.setU(sqlCode + "_update");
		this.setD(sqlCode + "_delete");
	}

	@Override
	public boolean beforeHanding(Object record)
	{
		return true;
	}

	@Override
	public boolean beforeInsert(Object record)
	{

		return true;
	}

	@Override
	public boolean beforeUpdate(Object record)
	{

		return true;
	}

	@Override
	public boolean beforeDelete(Object record)
	{

		return true;
	}

	@Override
	public void insert(Object record)
	{
		if (this.i != null)
		{
			this.dao.insertRecord(i, record);
		}
	}

	@Override
	public void update(Object record)
	{
		if (this.u != null)
		{
			this.dao.updateRecord(u, record);
		}
	}

	@Override
	public void delete(Object record)
	{
		if (this.d != null)
		{			
			this.dao.updateRecord(d, record);
		}
	}

	public String getI()
	{
		return i;
	}

	public void setI(String i)
	{
		this.i = i;
	}

	public String getU()
	{
		return u;
	}

	public void setU(String u)
	{
		this.u = u;
	}

	public String getD()
	{
		return d;
	}

	public void setD(String d)
	{
		this.d = d;
	}

}
