package com.weihua.core.orm;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.dom4j.Document;
import org.springframework.dao.DataAccessException;
import org.springframework.orm.ibatis.SqlMapClientCallback;
import org.springframework.stereotype.Repository;

import com.ibatis.sqlmap.client.SqlMapExecutor;
import com.weihua.core.utils.MixUtil;
import com.weihua.core.utils.StringUtil;
import com.weihua.core.utils.XmlUtil;
@SuppressWarnings("unchecked")
@Repository
public class XmlDao extends BaseDaoSupport {
	public final static String ACTION_FIELD = "_act";
	public final static String PK = "_ID";

	public void saveXml(Document doc, String[] sqlName) throws DataAccessException {
		saveXml(doc, sqlName, this.defaultDataSource);
	}
	
	public void saveXml(final Document doc, final String[] sqlName, DbType dbType) throws DataAccessException {
		final List<Map> lst = XmlUtil.getList(doc);
		final Map map = XmlUtil.getMap(doc);
		
		  MixUtil.addUserParams(map);
		
		final boolean m = map != null && !map.isEmpty(), l = lst != null && lst.size() > 0;
		if (!l) {
			this.update(sqlName[0], map, dbType); // 单条记录
		} else this.getTemplate(dbType).execute(new SqlMapClientCallback() {
			public Object doInSqlMapClient(SqlMapExecutor executor) throws SQLException {
				executor.startBatch();
				String act = (String) map.get(ACTION_FIELD);
				if (m && StringUtil.isNotBlank(act)) {
						map.put(PK, executor.update(sqlName[0] + act, map));
				}
				for (int i = 0, n = lst.size(); i < n; i++) {
					Map info = lst.get(i);
					if (m) info.putAll(map);
					 MixUtil.addUserParams(map);
					act = (String) info.get(ACTION_FIELD);
					if (StringUtil.isNotBlank(act)) {
						executor.update(sqlName[1] + act, info);
					}
				}
				executor.executeBatch();
				return null;
			}
		});
	}
}
