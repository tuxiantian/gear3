package com.weihua.mps.dao;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.weihua.core.orm.DefaultDao;
import com.weihua.core.orm.NameSpace;
@Repository
@NameSpace("app")
public class AppDao extends DefaultDao
{

	public String listApp(Map param)
	{
		return this.getJsonPaging("listApp", param);
	}
	
	public long saveOrUpdateApp(Map param)
	{
		if (StringUtils.isBlank((String) param.get("SEQ_ID")))
		{
			return this.inserApp(param);
		}
		else
		{
			return this.updateApp(param);
		}
	}

	public long inserApp(Map param)
	{
		return this.insert("app_insert", param);

	}

	public long updateApp(Map param)
	{
		return this.update("app_update", param);

	}

	public long deleteApp(Map param)
	{
		if (StringUtils.isNotBlank((String) param.get("SEQ_ID")))
		{
			return this.delete("app_delete", param);
		}
        return 0;
	}
	public long deleteApps(Map param)
	{
		Object IDS = param.get("IDS");
		if (IDS != null)
		{
			if (IDS instanceof String)
			{

				IDS = new String[]{ (String) IDS };
			}
			return this.delete("app_batch_delete", IDS);
		}
        return 0;
	}	
	

	public Object loadAppById(Map param)
	{
		return this.queryForObject("app_load", param);
	}

}
