package com.weihua.core;

public class Constants {
	/**
	 * sys开头为系统参数
	 */
	public static final String SYS_SESSION_TEMP = "TEMP_";
	public static final String SYS_SESSION_USER = "SYS_SESSION_USER";
	public static final String SYS_SESSION_USER_CODE = "SYS_SESSION_USER_CODE";
	public static final String SYS_PAGE_ENCODE = "UTF-8";
	public static final String SYS_DATE_FORMAT = "yyyy-MM-dd";
	public static final String SYS_AJAX_RESULT_FLAG = "success";
	public static final String SYS_AJAX_RESULT_MESSAGE = "msg";
	public static final String SYS_AJAX_RESULT_DATA = "data";
	public static final String SYS_ACTION_MESSAGE = "msg";
    public static final String RELOG_FLAG_KEY = "login";
    public static final String SESSION_OUT = "session_out";
    public static final String NO_AUTHORITY_ACCESS  = "no_authority_access"; //访问限制
	/**
	 * app开头的为程序中用到的参数
	 */
	public static final String APP_LOGIN_IMGE_CODE = "APP_LOGIN_IMGE_CODE";

	/**
	 *  
	 */
	public static final String APP_SQL_START = "start";
	public static final String APP_SQL_LIMIT = "limit";
	public static final String APP_SQL_ALIAS = "APP_SQL_ALIAS";
	public static final String APP_SQL_END = "endNo";
	public static final String APP_SQL_BEGIN = "beginNo";
	public static final String APP_SQL_FILTER = "filterSql";
	public static final int APP_SQL_BATCH_NUM = 200;
	public static final String APP_SQL_BATCH_KEY = "sqlName";

	public static final String APP_EXCEL_COLID = "excelColIds";
	public static final String APP_EXCEL_COLTEXT = "excelColTexts";
	public static final String APP_EXCEL_FILENAME = "fileName";
	
	public static final String JPEGCODE="JPEGCODE";
	
	public static final int DOC_TYPE_TEXT = 1;
	
	public static final int DOC_TYPE_TPL = 2;

}
