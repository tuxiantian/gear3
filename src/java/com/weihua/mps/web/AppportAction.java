package com.weihua.mps.web;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.apache.struts2.convention.annotation.Namespace;
import com.weihua.utils.JsonUtil;
import org.apache.struts2.convention.annotation.Action;
import com.weihua.core.web.BaseActionSupport;
import com.weihua.mps.service.AppportService;
@SuppressWarnings("unchecked")
@Controller
@Scope("prototype")
@Namespace(value = "/mps")
public class AppportAction extends BaseActionSupport
{
	private static final Logger logger = Logger.getLogger(AppportAction.class);
	@Autowired
	private AppportService service;
    Object appport;
    
    @Action(value = "listAppport")
	public void listAppport()
	{		
		this.renderText(service.listAppport($map()));
	}	
	
    @Action(value = "saveOrUpdateAppport")
	public void saveOrUpdateAppport()
	{
		try
		{
			service.saveOrUpdateAppport($map());
			this.renderSuccessJson("保存成功!");
		} catch (Exception e)
		{
			logger.error("保存失败!",e);
			this.renderErrorJson("保存失败!",e);
		}
	}
	
	@Action(value = "deleteAppport")
	public void deleteAppport()
	{
		try
		{
			service.deleteAppport($map());
			this.renderSuccessJson("删除成功!");
		} catch (Exception e)
		{
			logger.error("删除失败!",e);
			this.renderErrorJson("删除失败!" , e);
		}
	}
	
	@Action(value = "deleteAppports")
	public void deleteAppports()
	{
		try
		{
			service.deleteAppports($map());
			this.renderSuccessJson("删除成功!");
		} catch (Exception e)
		{
			logger.error("删除失败!",e);
			this.renderErrorJson("删除失败!" , e);
		}
	}	
	
	/**
	 * Map 的json 结构为 { insert:[], //添加记录集合 update:[],//更新记录集合 delete:[]//删除记录集合 }
	 */
	@Action(value = "saveAppportGrid")
	public void saveAppportGrid()
	{
		try
		{
			service.saveAppportGrid(JsonUtil.jsonToMapObject($("json_data")));
			this.renderSuccessJson("保存成功!");
		}
		catch (Exception e)
		{
			logger.error("保存失败!",e);
			this.renderErrorJson("保存失败!",e);
		}
		
	}
	
    @Action(value = "loadAppportById")
	public void  loadAppportById()
	{
		appport = service.loadAppportById($map());
        this.renderJson(appport);
	}

	public Object getAppport()
	{
		return appport;
	}

	public void setAppport(Object appport)
	{
		this.appport = appport;
	}

}
