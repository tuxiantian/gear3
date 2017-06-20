package ${config.package}.${config.servicePackage};
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
import ${config.package}.${config.daoPackage}.${config.appName?cap_first}Dao;
import ${config.package}.${config.daoPackage}.${config.subAppName?cap_first}Dao;
import ${config.package}.${config.subAppName?cap_first}CUDHandler;
@Service
@Transactional
public class ${config.appName?cap_first}Service
{
	@Autowired
	private ${config.appName?cap_first}Dao dao;	
	@Autowired
	private ${config.subAppName?cap_first}Dao ${config.subAppName}Dao;	
	public String list${config.appName?cap_first}(Map param)
	{
		return dao.list${config.appName?cap_first}(param);
	}

	public long saveOrUpdate${config.appName?cap_first}(Map param)
	{
   
		String ID = (String) param.get("${pkey}");
		long re = dao.saveOrUpdate${config.appName?cap_first}(param);// 如果是插入则返回新插入的ID
		if (StringUtils.isBlank(ID))// insert
		{
			ID = Long.toString(re);
		}
		CUDTransactional handler = new ${config.subAppName?cap_first}CUDHandler(ID, JsonUtil.jsonToMapObject((String) param.get("${config.subAppName}Data")));
		${config.subAppName}Dao.saveGrid(handler);
		return re;    
	}

	public long delete${config.appName?cap_first}(Map param)
	{
        Map map=new HashMap();
		map.put("${config.foreignKey}", param.get("${pkey}"));
		${config.subAppName}Dao.delete${config.subAppName?cap_first}By${config.foreignKey?cap_first}(map);
        return dao.delete${config.appName?cap_first}(param);
	}
	
	public long delete${config.appName?cap_first}s(Map param)
	{
		${config.subAppName}Dao.delete${config.subAppName?cap_first}By${config.foreignKey?cap_first}s(param);
        return dao.delete${config.appName?cap_first}s(param);
	}
	

	public Object load${config.appName?cap_first}ById(Map param)
	{
		return dao.load${config.appName?cap_first}ById(param);
	}
	
	public void save${config.appName?cap_first}Grid(CUDTransactional transaction)
	{
		 dao.saveGrid(transaction);
	}

	/**
	 * Map 的json 结构为 { insert:[], //添加记录集合 update:[],//更新记录集合 delete:[]//删除记录集合 }
	 */
	public void save${config.appName?cap_first}Grid( Map data)
	{
		DefaultCUDHandler template = new DefaultCUDHandler("_${config.appName}", data);
		save${config.appName?cap_first}Grid(template);
	}
}
