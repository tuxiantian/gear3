package com.weihua.mps.service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.weihua.core.web.DefaultCUDHandler;
import com.weihua.core.web.CUDTransactional;
import org.springframework.stereotype.Repository;
import com.weihua.core.orm.NameSpace;
import com.weihua.mps.dao.AppportDao;
@Service
@Transactional
public class AppportService
{
	@Autowired
	private AppportDao dao;
	public String listAppport(Map param)
	{
		return dao.listAppport(param);
	}

	public long saveOrUpdateAppport(Map param)
	{
        return dao.saveOrUpdateAppport(param);   
	}

	public long deleteAppport(Map param)
	{
        return dao.deleteAppport(param);
	}
	
	public long deleteAppports(Map param)
	{
        return dao.deleteAppports(param);
	}

	public Object loadAppportById(Map param)
	{
		return dao.loadAppportById(param);
	}
	
	public void saveAppportGrid(CUDTransactional transaction)
	{
		 dao.saveGrid(transaction);
	}

	/**
	 * Map 的json 结构为 { insert:[], //添加记录集合 update:[],//更新记录集合 delete:[]//删除记录集合 }
	 */
	public void saveAppportGrid(Map data)
	{
		DefaultCUDHandler template = new DefaultCUDHandler("_appport", data);
		saveAppportGrid(template);
	}
}
