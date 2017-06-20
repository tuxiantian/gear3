package com.weihua.core.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.weihua.core.orm.DefaultDao;

public abstract class AbstractCUDHandler implements CUDTransactional
{
	public abstract void insert(Object record);

	public abstract void update(Object record);

	public abstract void delete(Object record);

	public abstract boolean beforeInsert(Object record);

	public abstract boolean beforeUpdate(Object record);

	public abstract boolean beforeDelete(Object record);

	public abstract boolean beforeHanding(Object record);

	/**
	 * {add:[],update:[],delete:[]}
	 */
	protected Map _data_ = new HashMap();
	
	protected DefaultDao dao;
	
	protected String sqlCode;
	
	public AbstractCUDHandler(String SqlCode,Map data)
	{
        this.sqlCode=sqlCode;
		this._data_ = data;
	}

	private void _insert(Object record)
	{
		if (beforeInsert(record))
		{
			insert(record);
		}
	}

	private void _update(Object record)
	{
		if (beforeUpdate(record))
		{
			update(record);
		}
	}

	private void _delete(Object record)
	{
		if (beforeDelete(record))
		{
			delete(record);
		}
	}

	public void doTransaction(DefaultDao dao)
	{
		this.dao=dao;
		List array = this.getArrayByKey("insert");
		int i = 0;
		for (i = 0; i < array.size(); i++)
		{
			if (beforeHanding(array.get(i)))
			{
				this._insert(array.get(i));
			}

		}
		array = this.getArrayByKey("update");
		for (i = 0; i < array.size(); i++)
		{
			if (beforeHanding(array.get(i)))
			{
				this._update(array.get(i));
			}
		}
		array = this.getArrayByKey("delete");
		for (i = 0; i < array.size(); i++)
		{
			if (beforeHanding(array.get(i)))
			{
				this._delete(array.get(i));
			}
		}

	}

	private List getArrayByKey(String key)
	{
		return (List) _data_.get(key);
	}

}
