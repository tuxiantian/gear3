package com.weihua.widgets.service;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.dom4j.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import com.weihua.core.orm.DbType;
import com.weihua.core.orm.DefaultDao;
import com.weihua.core.orm.NameSpace;
import com.weihua.core.orm.XmlDao;
import com.weihua.core.utils.StringUtil;
@SuppressWarnings("unchecked")
@Repository
@NameSpace("Widgets")
public class CommonDao extends DefaultDao {
	@Autowired
	private XmlDao xmlDao;

	public String query(String sqlName, Map params, DbType dbType) {
		return this.getJsonPaging(sqlName, params, dbType);
	}

	public void save(Document doc, String[] sqlName) {
		xmlDao.saveXml(doc, sqlName);
	}

	public void excel(String sqlName, Map params, DbType dbType) throws IOException {
		this.exportExcel(sqlName, params, dbType);
	}

	public Boolean isShop(String deptId) {
		Assert.notNull(deptId, "deptId is null");
		Integer v = (Integer) this.queryForObject("isShop", deptId);
		return v != null ? v == 1 : null;
	}

	public void saveByJson(Map info) {
		String type = (String) info.get("type"), sql = (String) info.get("sql");
		if (StringUtil.isBlank(type) || StringUtil.isBlank(sql)) return;
		if ("map".equals(type)) {
			this.update(sql, info.get("data"));
		} else if ("list".equals(type)) {
			List data = (List) info.get("data");
			for (int i = 0, n = data.size(); i < n; i++) {
				this.update(sql, data.get(i));
			}
		}
	}
	
}
