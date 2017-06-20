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
@NameSpace("APPPORT")
public class AppportDao extends DefaultDao
{

	public String listAppport(Map param)
	{
		return this.getJsonPaging("listAppport", param);
	}
	
	public long saveOrUpdateAppport(Map param)
	{
		if (StringUtils.isBlank((String) param.get("PORTID")))
		{
			return this.inserAppport(param);
		}
		else
		{
			return this.updateAppport(param);
		}
	}

	public long inserAppport(Map param)
	{
		return this.insert("appport_insert", param);

	}

	public long updateAppport(Map param)
	{
		return this.update("appport_update", param);

	}

	public long deleteAppport(Map param)
	{
		if (StringUtils.isNotBlank((String) param.get("PORTID")))
		{
			return this.delete("appport_delete", param);
		}
        return 0;
	}
	public long deleteAppports(Map param)
	{
		Object IDS = param.get("IDS");
		if (IDS != null)
		{
			if (IDS instanceof String)
			{

				IDS = new String[]{ (String) IDS };
			}
			return this.delete("appport_batch_delete", IDS);
		}
        return 0;
	}	
	
	public long deleteAppportByAPP_ID(Map param)
	{
		if (StringUtils.isNotBlank((String) param.get("APP_ID")))
		{
			return this.delete("appport_delete_by_APP_ID", param);
		}
        return 0;
	}  
	
	public long deleteAppportByAPP_IDs(Map param)
	{
		Object IDS = param.get("IDS");
		if (IDS != null)
		{
			if (IDS instanceof String)
			{

				IDS = new String[]{ (String) IDS };
			}
			return this.delete("appport_batch_delete_by_APP_ID",IDS);
		}
        return 0;
	}  	

	public Object loadAppportById(Map param)
	{
		return this.queryForObject("appport_load", param);
	}

}
