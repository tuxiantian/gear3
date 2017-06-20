package com.weihua.gen.web;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.weihua.core.utils.MapBean;
import com.weihua.gen.domain.ColumnDefinition;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Namespace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import com.weihua.core.web.BaseActionSupport;
import com.weihua.gen.domain.ActionCodeGenerator;
import com.weihua.widgets.service.WidgetsDao;

@Namespace(value = "/gen")
public class GenAction extends BaseActionSupport {
    /**
     *
     */
    private static final long serialVersionUID = 7767841488712647818L;
    @Autowired
    private WidgetsDao widgetsDao;

    @Action(value = "genCode")
    public void genCode() {
        String tableName = $("tableName");
        String database = $("database");
        List<ColumnDefinition> cols = getColsByTableName(tableName, database);
        Map map = new HashMap();
        map.put("cols", cols);
        map.put("pkey", getPk(cols));
        map.put("config", $map());
        try {
            // config
            ActionCodeGenerator gen = new ActionCodeGenerator();
            gen.setOutputDir($("position"));
            //删除前先清空目录
//            org.apache.commons.io.FileUtils.deleteDirectory(new File($("position"),"java"));
            this.genSql(gen, $map(), map, false);
            this.genJava(gen, $map(), map);
//            this.genJs(gen, $map(), map);
            this.genMainFtl(gen, $map(), map);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public ColumnDefinition getPk(List<ColumnDefinition> list) {
        if (list != null) {
            for (ColumnDefinition columnDefinition : list) {
                if (columnDefinition.getIsPk()) {
                    return columnDefinition;
                }
            }
        }
        return null;
    }

    public String lowFirstChar(String str) {
        return str.substring(0, 1).toLowerCase() + str.substring(1);
    }


    private List<ColumnDefinition> getColsByTableName(String tableName, String database) {
        List cols = widgetsDao.getTableMeta(tableName, database);
        MapBean tmp;
        List<ColumnDefinition> list = new LinkedList<ColumnDefinition>();
        for (int i = 0; i < cols.size(); i++) {
            tmp = (MapBean) cols.get(i);
            ColumnDefinition c = new ColumnDefinition(tmp);
            list.add(c);
        }
        return list;
    }

    private void genJava(ActionCodeGenerator gen, Map config, Map param) throws IOException {
        String appName = config.get("appName").toString();
        String daoPackage = config.get("daoPackage").toString();
        String servicePackage = config.get("servicePackage").toString();
        String actionPackage = config.get("actionPackage").toString();
        String entityPackage = "entity";
        String java = "java." + config.get("package");

        gen.generate("mapper.ftl", gen.getOutPutFile(java + "." + daoPackage, StringUtils.capitalize(appName) + "Mapper.java"), param);
        gen.generate("entity.ftl", gen.getOutPutFile(java + "." + entityPackage, StringUtils.capitalize(appName) + ".java"), param);
        gen.generate("service.ftl", gen.getOutPutFile(java + "." + servicePackage, StringUtils.capitalize(appName) + "Service.java"), param);
        gen.generate("action.ftl", gen.getOutPutFile(java + "." + actionPackage, StringUtils.capitalize(appName) + "Controller.java"), param);
    }

    private void genSql(ActionCodeGenerator gen, Map config, Map param, Boolean isSubTable) throws IOException {
        String appName = config.get("appName").toString();
        String ibatisFilePrefix = "Mapper";
        param.put("isSubTable", isSubTable);
        String basePack = String.valueOf(config.get("package"));
        String mapperPack = String.valueOf(config.get("daoPackage"));

        param.put("mapperNamespace", basePack + "." + mapperPack + "." + appName + ibatisFilePrefix);
        param.put("mapperEntityMap", basePack + ".entity." + appName);
        gen.generate("mapper.xml.ftl", gen.getOutPutFile("java."+basePack + "." + mapperPack, appName + ibatisFilePrefix + ".xml"), param);
    }

    private void genMainFtl(ActionCodeGenerator gen, Map config, Map param) throws IOException {
        String appName = config.get("appName").toString();
        String web = "";
        gen.generate("table.ftl", gen.getOutPutFile(web+File.separator+config.get("ftlName"),  "table.ftl"), param);
        gen.generate("info.ftl", gen.getOutPutFile(web+File.separator+config.get("ftlName"),  config.get("ftlEntityName")+".ftl"), param);
        gen.generate("list.ftl", gen.getOutPutFile(web+File.separator+config.get("ftlName"),  "list.ftl"), param);
//        gen.generate("Main.ftl", gen.getOutPutFile(web + File.separator + config.get("ftlName"), appName + "Main.js"), param);
    }

    private void genJs(ActionCodeGenerator gen, Map config, Map param) throws IOException {
        String appName = config.get("appName").toString();
        String web = "web." + appName;
        String genEditGrid = (String) config.get("genEditGrid");
        if (null == genEditGrid) {
            gen.generate("Grid.ftl", gen.getOutPutFile(web + File.separator + "js", StringUtils.capitalize(appName) + "Grid.js"), param);

            gen.generate("FormWindow.ftl", gen.getOutPutFile(web + File.separator + "js", StringUtils.capitalize(appName) + "FormWindow.js"), param);
        } else {
            gen.generate("EditGrid.ftl", gen.getOutPutFile(web + File.separator + "js", StringUtils.capitalize(appName) + "EditGrid.js"), param);
        }
    }

    private void genSubJs(ActionCodeGenerator gen, Map config, Map param) throws IOException {
        String appName = config.get("appName").toString();
        String web = "web." + appName;
        gen.generate("SubEditGrid.ftl", gen.getOutPutFile(web + File.separator + "js", StringUtils.capitalize(appName) + "EditGrid.js"), param);

    }

    @Action(value = "tableExist")
    public void tableExist() {
        String tableName = $("tableName");
        String database = $("database");
        List cols = widgetsDao.getTableMeta(tableName.toUpperCase(), database);
        if (cols.size() > 0) {
            this.renderJson(true, "ok");
        } else {
            this.renderJson(false, "false");
        }
    }

    @Action(value = "keyExist")
    public void keyExist() {
        String tableName = $("tableName");
        String database = $("database");
        String key = $("key");
        List cols = widgetsDao.getTableMeta(tableName.toUpperCase(), database);
        Map tmp;
        for (int i = 0; i < cols.size(); i++) {
            tmp = (Map) cols.get(i);
            if (tmp.get("COLUMN_NAME").equals(key)) {
                this.renderJson(true, "ok");
                return;
            }
        }

        this.renderJson(false, "false");
    }

    public static void main(String agrs[]) {
        System.out.println(StringUtils.capitalize("testAPP"));
    }
}
