package com.weihua.core.orm;
import java.util.HashMap;
import java.util.Map;

import com.weihua.core.utils.MixUtil;
import com.weihua.core.utils.StringUtil;
@SuppressWarnings("unchecked")
public class SqlFilterHandler implements ISqlFilterHandler {
	protected Map<String, Map> sql = new HashMap<String, Map>();
	private Map<String, String> alias;

	public SqlFilterHandler(Map alias) {
		this.alias = alias;

		Map sqlString = MixUtil.newHashMap("like", " $field$ like '$value$%'");
		sqlString.put("nolike", " $field$  not like '$value$%'");
		sqlString.put("nullvalue", " $field$ is null");
		sqlString.put("notnullvalue", " $field$ is not null");

		Map sqlNumeric = MixUtil.newHashMap("eq", " $field$ = #value# ");
		sqlNumeric.put("gt", " $field$ > #value#");
		sqlNumeric.put("lt", " $field$ < #value#");
		sqlNumeric.put("ueq", " $field$ <> #value#");
		sqlNumeric.put("gteq", " $field$ >= #value#");
		sqlNumeric.put("lteq", " $field$ <= #value#");
		sqlNumeric.put("nullvalue", " $field$ is null");
		sqlNumeric.put("notnullvalue", " $field$ is not null");

		Map sqlList = MixUtil.newHashMap("in", " $field$ in ($value$) ");

		Map sqlDate = MixUtil.newHashMap("eq", " $field$ = to_date(#value#,#format#) ");
		sqlDate.put("gt", " $field$ > to_date(#value#,#format#)");
		sqlDate.put("lt", " $field$ < to_date(#value#,#format#)");

		sql.put("string", sqlString);
		sql.put("numeric", sqlNumeric);
		sql.put("list", sqlList);
		sql.put("date", sqlDate);
	}

	public SqlFilterHandler() {
		this(null);
	}

	public String handler(Map params) {
		Map<String, FilterFieldInfo> fieldMap = new HashMap<String, FilterFieldInfo>();
		int i = 0;
		while (params.get("filter[" + i + "][field]") != null) {
			String field = (String) params.get("filter[" + i + "][field]");
			String type = (String) params.get("filter[" + i + "][data][type]");
			String comparison = (String) params.get("filter[" + i + "][data][comparison]");
			String value = (String) params.get("filter[" + i + "][data][value]");
			comparison = "list".equals(type) ? "in" : comparison;

			if ((comparison.equals("nullvalue") || comparison.equals("notnullvalue")) && value.equals("false")) {
				i++;
				continue;
			}
			String sqlStrng = (String) sql.get(type).get(comparison);
			String fieldAlias=(alias!=null&&alias.get(field)!=null)?alias.get(field):field;
			String tempSql = StringUtil.parseSql(sqlStrng, MixUtil.newHashMap("field", fieldAlias, "value", value, "type", type, "comparison", comparison));
			if (tempSql != null) {
				FilterFieldInfo filterFieldInfo = fieldMap.get(field);
				if (filterFieldInfo == null || filterFieldInfo.getList() == null) {
					boolean isOrJoin = Boolean.valueOf((String) params.get("filter[" + i + "][data][orjoin]")).booleanValue();
					boolean isNot = Boolean.valueOf((String) params.get("filter[" + i + "][data][not]")).booleanValue();
					filterFieldInfo = new FilterFieldInfo(isOrJoin, isNot);
					filterFieldInfo.getList().add(tempSql);
					fieldMap.put(field, filterFieldInfo);
				} else {
					filterFieldInfo.getList().add(tempSql);
				}
			}
			i++;
		}
		StringBuffer filterSql = new StringBuffer();
		if (!fieldMap.values().isEmpty()) {
			filterSql.append(" and ( ");
			int j = 0;
			for (FilterFieldInfo info : fieldMap.values()) {
				filterSql.append(info.getSql(j++));
			}
			filterSql.append(" )");
		}
		return filterSql.toString();
	}
}
