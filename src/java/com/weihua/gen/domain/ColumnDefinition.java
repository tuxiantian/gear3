package com.weihua.gen.domain;

import com.weihua.core.utils.FieldUtil;
import com.weihua.core.utils.MapBean;
import com.weihua.core.utils.SqlTypeUtil;

/**
 * 表字段信息
 */
public class ColumnDefinition {

    private String columnName; // 数据库字段名
    private String type; // 数据库类型
    private boolean isIdentity; // 是否自增
    private boolean isNullAble; // 是否允许为空
    private String len; // 是否允许为空
    private boolean isPk; // 是否主键
    private String comment; // 字段注释
    private String title; // 字段注释
    private String javaFieldName;

    public ColumnDefinition(MapBean map) {
        if (map != null) {
            this.columnName = map.getString("COLUMN_NAME");
            this.isNullAble = "YES".equalsIgnoreCase(map.getString("IS_NULLABLE"));
            this.type = map.getString("DATA_TYPE");
            if (map.getInt("LEN") != null) {
                this.len = String.valueOf(map.getInt("LEN") / 2);
            } else {
                this.len = null;
            }

            this.isPk = "1".equals(map.getString("IS_PK"));

            String comments = (String) map.get("COMMENTS");
            if (comments.indexOf("@") >= 0) {
                String[] v = comments.split("@");
                this.title = v[0];
                this.comment = v.length == 1 ? v[0] : v[1];
            } else {
                this.title = comments;
                this.comment = comments;
            }
        }
    }

    /**
     * 是否是自增主键
     *
     * @return
     */
    public boolean getIsIdentityPk() {
        return isPk && isIdentity;
    }

    /**
     * 返回java字段名,并且第一个字母大写
     *
     * @return
     */
    public String getJavaFieldNameUF() {
        return FieldUtil.upperFirstLetter(getJavaFieldName());
    }

    public String getJavaFieldName() {
        if (javaFieldName == null) {
            javaFieldName = FieldUtil.underlineFilter(columnName.toLowerCase());
        }
        return javaFieldName;
    }

    /**
     * 获得基本类型,int,float
     *
     * @return
     */

    public String getJavaType() {
        String typeLower = type.toLowerCase();
        return SqlTypeUtil.convertToJavaType(typeLower);
    }

    /**
     * 获得装箱类型,Integer,Float
     *
     * @return
     */

    public String getJavaTypeBox() {
        String typeLower = type.toLowerCase();
        return SqlTypeUtil.convertToJavaBoxType(typeLower);
    }

    public String getMybatisJdbcType() {
        String typeLower = type.toLowerCase();
        return SqlTypeUtil.convertToMyBatisJdbcType(typeLower);
    }

    public String getColumnName() {
        return columnName.toLowerCase();
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean getIsIdentity() {
        return isIdentity;
    }

    public void setIsIdentity(boolean isIdentity) {
        this.isIdentity = isIdentity;
    }

    public boolean getIsPk() {
        return isPk;
    }

    public void setIsPk(boolean isPk) {
        this.isPk = isPk;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        if (comment == null) {
            comment = "";
        }
        this.comment = comment;
    }

    public boolean isNullAble() {
        return isNullAble;
    }

    public String getLen() {
        return len;
    }

    public String getTitle() {
        return title;
    }

    public boolean getIsNullAble() {
        return isNullAble;
    }

}
