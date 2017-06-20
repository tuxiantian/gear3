package ${config.package};

import java.util.Map;

import com.weihua.core.web.DefaultCUDHandler;

public class ${config.subAppName?cap_first}CUDHandler extends DefaultCUDHandler
{
	private String id;

	public ${config.subAppName?cap_first}CUDHandler(String id, Map data)
	{
		super("_${config.subAppName}", data);
		this.id = id;
	}

	@Override
	public boolean beforeInsert(Object record)
	{
		((Map) record).put("${config.foreignKey}", this.id);
		return true;
	}

}
