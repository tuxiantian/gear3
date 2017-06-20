package com.weihua.mps.service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import com.weihua.utils.JsonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.weihua.core.web.DefaultCUDHandler;
import com.weihua.core.web.CUDTransactional;
import org.springframework.stereotype.Repository;
import com.weihua.core.orm.NameSpace;
import com.weihua.mps.dao.AppDao;
import com.weihua.mps.dao.AppportDao;
import com.weihua.mps.AppportCUDHandler;
@Service
@Transactional
public class AppService
{
	@Autowired
	private AppDao dao;	
	@Autowired
	private AppportDao appportDao;	
	public String listApp(Map param)
	{
		return dao.listApp(param);
	}

	public long saveOrUpdateApp(Map param)
	{
   
		String ID = (String) param.get("SEQ_ID");
		long re = dao.saveOrUpdateApp(param);// 如果是插入则返回新插入的ID
		if (StringUtils.isBlank(ID))// insert
		{
			ID = Long.toString(re);
		}
		CUDTransactional handler = new AppportCUDHandler(ID, JsonUtil.jsonToMapObject((String) param.get("appportData")));
		appportDao.saveGrid(handler);
		return re;    
	}

	public long deleteApp(Map param)
	{
        Map map=new HashMap();
		map.put("APP_ID", param.get("SEQ_ID"));
		appportDao.deleteAppportByAPP_ID(map);
        return dao.deleteApp(param);
	}
	
	public long deleteApps(Map param)
	{
		appportDao.deleteAppportByAPP_IDs(param);
        return dao.deleteApps(param);
	}
	

	public Object loadAppById(Map param)
	{
		return dao.loadAppById(param);
	}
	
	public void saveAppGrid(CUDTransactional transaction)
	{
		 dao.saveGrid(transaction);
	}

	/**
	 * Map 的json 结构为 { insert:[], //添加记录集合 update:[],//更新记录集合 delete:[]//删除记录集合 }
	 */
	public void saveAppGrid( Map data)
	{
		DefaultCUDHandler template = new DefaultCUDHandler("_app", data);
		saveAppGrid(template);
	}
}
