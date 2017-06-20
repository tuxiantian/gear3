package com.weihua.widgets.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.simple.SimpleJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.weihua.core.orm.BaseDaoSupport;
import com.weihua.core.orm.DbType;
import com.weihua.core.orm.NameSpace;
import com.weihua.core.utils.JsonUtil;
import com.weihua.core.utils.MapBean;
import com.weihua.core.utils.MixUtil;

@SuppressWarnings("unchecked")
@Repository
@NameSpace("Widgets")
public class WidgetsDao extends BaseDaoSupport {
    public String getTree(String code, Map params) {
        if (params == null) params = new HashMap();
        if (MixUtil.getUser() != null) {
            MixUtil.addUserParams(params);
            MixUtil.transVars(params, new String[]{"node"});
        }
        if (code.startsWith("_")) {
            return JsonUtil.getJson(queryForList("getTree" + code, params));
        } else {
            SimpleJdbcTemplate tpl = new SimpleJdbcTemplate(this.getDataSource());
            return JsonUtil.getJson(tpl.queryForList(getSql(code, params), params));
        }
    }

    public String getCombo(String code, Map params) {
        if (params == null) params = new HashMap();
        if (null != MixUtil.getUser() && MixUtil.getUser().containsKey("USERID")) {
            MixUtil.addUserParams(params);
        }
        if (code.startsWith("_")) {
            params.put("code", code.substring(1));
            // 如果包含属性 _idIsId 则以id为id值，否则以key为默认值，见T_SYS_CONST表
            if (params.containsKey("_idIsId")) {
                return JsonUtil.getJsonForExt(queryForList("getComboTwo", params));
            } else {
                return JsonUtil.getJsonForExt(queryForList("getCombo", params));
            }
        } else {
            SimpleJdbcTemplate tpl = new SimpleJdbcTemplate(this.getDataSource());
            return JsonUtil.getJsonForExt(tpl.queryForList(getSql(code, params), params));
        }
    }

    public List getComboData(String code, Map params) {
        if (params == null) params = new HashMap();
        if (null != MixUtil.getUser() && MixUtil.getUser().containsKey("USERID")) {
            MixUtil.addUserParams(params);
        }
        if (code.startsWith("_")) {
            params.put("code", code.substring(1));
            // 如果包含属性 _idIsId 则以id为id值，否则以key为默认值，见T_SYS_CONST表
            if (params.containsKey("_idIsId")) {
                return queryForList("getComboTwo", params);
            } else {
                return queryForList("getCombo", params);
            }
        } else {
            SimpleJdbcTemplate tpl = new SimpleJdbcTemplate(this.getDataSource());
            return tpl.queryForList(getSql(code, params), params);
        }
    }

    public String getComboTwo(String code, Map params) {
        if (params == null) params = new HashMap();
        if (null != MixUtil.getUser() && MixUtil.getUser().containsKey("USERID")) {
            MixUtil.addUserParams(params);
        }
        if (code.startsWith("_")) {
            params.put("code", code.substring(1));
            return JsonUtil.getJsonForExt(queryForList("getCombo", params));
        } else {
            SimpleJdbcTemplate tpl = new SimpleJdbcTemplate(this.getDataSource());
            return JsonUtil.getJsonForExt(tpl.queryForList(getSql(code, params), params));
        }
    }

    public String getListData(String code, Map params) {
        if (params == null) params = new HashMap();
        return this.getJsonPaging("getListData" + code, params, DbType.ONL);
    }

    public String getListDataForOut(String code, Map params) {
        SimpleJdbcTemplate tpl = new SimpleJdbcTemplate(this.getDataSource());
        List datas = tpl.queryForList(getSql(code, params), params);
        if (datas != null && datas.size() > 0) {
            return JsonUtil.getJson(new MapBean("success", true, "datas", datas));
        } else {
            return "{success:true,datas:[]}";
        }
    }

    public String getUserByDeptId(Map params) {
        if (params == null) {
            params = new HashMap();
            params.put("deptId", MixUtil.getDeptId());
        }
        if (params.get("deptId") == null) {
            params.put("deptId", MixUtil.getDeptId());
        }
        if (params.containsKey("name")) {
            String s = (String) params.get("name");
            if (s != null) {
                if (s.length() > 0) {
                    s = "%" + s + "%";
                } else {
                    s = "%";
                }
            }
            if (s == null) {
                s = "%";
            }
            params.put("name", s);
        }

        return JsonUtil.getJsonForExt(queryForList("System.loadUserByDeptId", params));
    }

    public String autocomplete(String code, Map params) {
        List datas = null;
        if (params == null) params = new HashMap();
        if (code.startsWith("_")) {
            params.put("code", code.substring(1));
            datas = queryForList("AC." + code, params);
        } else {
            SimpleJdbcTemplate tpl = new SimpleJdbcTemplate(this.getDataSource());
            datas = tpl.queryForList(getSql(code, params), params);
        }
        String query = (String) params.get("query");
        return JsonUtil.getJsonForAC(query, datas);
    }

    public String getUserArchived(Map<String, Object> params) {
        return this.getJsonPaging("findUserArchivedList", params);
    }

    public List getTableMeta(String tableName, String database) {
        Map params = new HashMap();
        params.put("tablename", tableName);
        params.put("database", database);
        return this.queryForList("getTableMeta", params);
    }

    public String getTablePKey(String tableName) {
        Map params = new HashMap();
        params.put("tablename", tableName);
        Map map = (Map) this.queryForObject("getTablePKey", params);
        return (String) map.get("ID");
    }

    public String listTreeGrid(Map params) {
        return this.getJsonPaging("listtreegrid", params);

    }

}
