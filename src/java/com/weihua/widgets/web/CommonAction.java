package com.weihua.widgets.web;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;

import com.weihua.core.exception.BusinessException;
import com.weihua.core.orm.DbType;
import com.weihua.core.orm.DefaultDao;
import com.weihua.core.web.BaseActionSupport;
import com.weihua.utils.JsonUtil;
import com.weihua.widgets.service.CommonDao;

@Controller
@Scope("prototype")
@SuppressWarnings("unchecked")
public class CommonAction extends BaseActionSupport
{
	private static final long serialVersionUID = 6636219036903242943L;
	@Autowired
	private CommonDao commonDao;

	public void query()
	{
		String sqlName = $("sqlName"), tmp = $("dbType");
		DbType dbType = "1".equals(tmp) ? DbType.ONL : DbType.HIS;
		Map params = $map();
		if ("true".equals($("_excel")))
		{
			logger.info("执行通用导出:sqlName=" + sqlName + " DbType=" + dbType);
			try
			{
				commonDao.excel(sqlName, params, dbType);
			}
			catch (IOException e)
			{
				throw new BusinessException("excel", "导出发生错误", e.getMessage());
			}
		}
		else
		{
			logger.info("执行通用查询:sqlName=" + sqlName + " DbType=" + dbType);
			this.renderText(commonDao.query(sqlName, params, dbType));
		}
	}

	public void save()
	{
		commonDao.save($doc(), new String[]
		{ $("m"), $("d") });
		this.renderJson(true, "操作成功");
	}

	public void saveByXml()
	{
		commonDao.save($doc(), new String[]
		{ $("m"), $("d") });
		this.renderJson(true, "操作成功");
	}

	public void saveByJson()
	{
		Map info = $data();
		commonDao.saveByJson(info);
		this.renderJson(true, MSG_SUCCESS);
	}

	public void excel()
	{
		String sqlName = $("sqlName"), tmp = $("dbType");
		if(sqlName==null || sqlName.trim().equals(""))
		{
			sqlName=$("sqlCode");
		}
		DbType dbType = "1".equals(tmp) ? DbType.ONL : DbType.HIS;
		Map params = $map();
		try
		{
			commonDao.excel(sqlName, params, dbType);
		}
		catch (IOException e)
		{
			throw new BusinessException("excel", "导出发生错误", e.getMessage());
		}
	}

	/**
	 * Map 的json 结构为 { add:[], //添加记录集合 update:[],//更新记录集合 delete:[]//删除记录集合 }
	 */
	public void saveGrid()
	{
		commonDao.saveGrid($("sqlCode"), JsonUtil.jsonToMapObject($("json_data")));
		this.renderJson(true, MSG_SUCCESS);
	}

	public void extPaging()
	{
		String sql = $("sqlCode");
		// System.out.println(sql);
		// System.out.println($map().toString());
		this.renderText(commonDao.pageingBySqlcodeForExt(sql, $map()));
	}

	public void test()
	{

		throw new RuntimeException("test error occur");
	}
}
