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
import com.weihua.mps.service.AppService;
@SuppressWarnings("unchecked")
@Controller
@Scope("prototype")
@Namespace(value = "/mps")
public class AppAction extends BaseActionSupport
{
	private static final Logger logger = Logger.getLogger(AppAction.class);
	@Autowired
	private AppService service;
    Object app;
    
    @Action(value = "listApp")
	public void listApp()
	{		
		this.renderText(service.listApp($map()));
	}	
	
    @Action(value = "saveOrUpdateApp")
	public void saveOrUpdateApp()
	{
		try
		{
			service.saveOrUpdateApp($map());
			this.renderSuccessJson("保存成功!");
		} catch (Exception e)
		{
			logger.error("保存失败!",e);
			this.renderErrorJson("保存失败!",e);
		}
	}
	
	@Action(value = "deleteApp")
	public void deleteApp()
	{
		try
		{
			service.deleteApp($map());
			this.renderSuccessJson("删除成功!");
		} catch (Exception e)
		{
			logger.error("删除失败!",e);
			this.renderErrorJson("删除失败!" , e);
		}
	}
	
	@Action(value = "deleteApps")
	public void deleteApps()
	{
		try
		{
			service.deleteApps($map());
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
	@Action(value = "saveAppGrid")
	public void saveAppGrid()
	{
		try
		{
			service.saveAppGrid(JsonUtil.jsonToMapObject($("json_data")));
			this.renderSuccessJson("保存成功!");
		}
		catch (Exception e)
		{
			logger.error("保存失败!",e);
			this.renderErrorJson("保存失败!",e);
		}
		
	}
	
    @Action(value = "loadAppById")
	public void  loadAppById()
	{
		app = service.loadAppById($map());
        this.renderJson(app);
	}

	public Object getApp()
	{
		return app;
	}

	public void setApp(Object app)
	{
		this.app = app;
	}

}
