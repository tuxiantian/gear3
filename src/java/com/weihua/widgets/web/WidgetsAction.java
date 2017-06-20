package com.weihua.widgets.web;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import com.opensymphony.oscache.util.StringUtil;
import com.weihua.core.utils.MixUtil;
import com.weihua.core.web.BaseActionSupport;
import com.weihua.utils.JsonUtil;
import com.weihua.utils.ServiceUtil;
import com.weihua.widgets.service.WidgetsDao;

@Controller
public class WidgetsAction extends BaseActionSupport {
    private static final long serialVersionUID = 2421535051685878974L;
    @Autowired
    private WidgetsDao widgetsDao;

    public void getTree() {
        this.renderText(widgetsDao.getTree($("code"), $map()));
    }

    public void getCombo() {
        this.renderText(widgetsDao.getCombo($("code"), $map()));
    }

    public void getTreeData() {
        this.renderText(widgetsDao.getTreeData($("code"), $map()));
    }

    public void getTreeAllData() {
        Map m = $map();
        if (!m.containsKey("rootId")) {
            m.put("rootId", MixUtil.getCompanyId());
        }
        this.renderText(widgetsDao.getTreeAllData($("code"), m));
    }

    public void getUserByDeptId() {
        this.renderText(widgetsDao.getUserByDeptId($map()));
    }

    public void getListData() {
        this.renderText(widgetsDao.getListData($("code"), $map()));
    }

    public void autocomplete() {
        this.renderText(widgetsDao.autocomplete($("code"), $map()));
    }

    public void getArchivedAllData() {
        this.renderHtml(widgetsDao.getUserArchived($map()));
    }

    public void listTreeGrid() {
        this.renderHtml(widgetsDao.listTreeGrid($map()));
    }

    /**
     * 为邮件系统提供数据
     */
    @SuppressWarnings("unchecked")
    public void getData() {
        String type = $("type");
        String code = $("code");
        if (StringUtil.isEmpty(type) || StringUtil.isEmpty(code)) {
            this.renderJson(false, "参数不正确:type,code不能会空!");
            return;
        } else {
            if (!code.startsWith("out_")) {
                this.renderJson(false, "参数不正确:code必须为out_开头!");
                return;
            }
        }
        Map params = $map();
        if ("tree".equals(type)) {
            this.renderText($("jsoncallback") + "([" + widgetsDao.getTreeData(code, params) + "])");
        }
        if ("node".equals(type)) {
            this.renderText($("jsoncallback") + "(" + widgetsDao.getTree(code, params) + ")");
        }
        if ("list".equals(type)) {
            this.renderText($("jsoncallback") + "(" + widgetsDao.getListDataForOut(code, params) + ")");
        }
    }

    /**
     * 获得表格列信息
     */
    public void tableMeta() {
        String tableName = $("tablename");
        String database = $("database");
        List cols = null;
        Map tmp = null;

        boolean inited = false;
        // System.out.println("test--------------------->");
        // System.out.println(widgetsDao==ServiceUtil.getBean("widgetsDao"));
        String comments = null;
        if (tableName != null && !tableName.trim().equals("")) {
            for (String name : tableName.split(",")) {
                cols = widgetsDao.getTableMeta(name, database);
                for (int i = 0; i < cols.size(); i++) {
                    tmp = (Map) cols.get(i);
                    tmp.put("name", tmp.get("COLUMN_NAME"));
                    comments = (String) tmp.get("COMMENTS");
                    if (comments != null && !comments.trim().equals("")) {
                        comments = comments.split("//")[0];
                    } else {
                        comments = (String) tmp.get("name");
                    }
                    tmp.put("header", comments);
                    tmp.remove("COLUMN_NAME");
                    tmp.remove("COMMENTS");
                }
                StringBuffer sb = new StringBuffer();
                if (!inited) {
                    sb.append("var Metas=Metas||{};\n");
                    inited = true;
                }
                sb.append("Metas['" + name + "']=");
                sb.append(JsonUtil.toJson(cols));
                sb.append(";\n");
                this.renderHtml(sb.toString());
            }
        }
    }
}
