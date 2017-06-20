package com.weihua.core.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import com.weihua.core.Constants;

public class DateUtil {
	public static String sysdate(String format) {
		return format(new Date(), format);
	}

	public static String sysdate() {
		return sysdate(Constants.SYS_DATE_FORMAT);
	}

	public static String format(Date date, String format) {
		SimpleDateFormat sf = new SimpleDateFormat(format);
		return sf.format(date);
	}

	public static String format(Date date) {
		return format(date, Constants.SYS_DATE_FORMAT);
	}
	
	public static Date parse(String date, String format) throws ParseException {
		SimpleDateFormat sf = new SimpleDateFormat(format);
		return sf.parse(date);
	}
	
	public static Date parse(String date) throws ParseException {
		return parse(date,Constants.SYS_DATE_FORMAT);
	}
	
    public static String getFrontDate(String date) {
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		try {
			Date newDate = dateFormat.parse(date);
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(newDate);
			calendar.add(Calendar.DATE, -1);
			int year = calendar.get(Calendar.YEAR);
			int month = calendar.get(Calendar.MONTH) + 1;
			int day = calendar.get(Calendar.DATE);
			String returnValue = year + "-" + month + "-" + day;
			return returnValue;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "";
	}
    
    public static String getWeekName(Date d){
    	if(d!=null){
    		 Calendar c = Calendar.getInstance();
    		 c.setTime(d);
    		  
    		 int wd = c.get(Calendar.DAY_OF_WEEK);
    		 String x = "星期日";
    		 switch(wd){
    		 case 2:
    			 x="星期一";
    			 break;
    		 case 3:
    			 x="星期二";
    			 break;
    		 case 4:
    			 x="星期三";
    			 break;
    		 case 5:
    			 x="星期四";
    			 break;
    		 case 6:
    			 x="星期五";
    			 break;
    		 case 7:
    			 x="星期六";
    			 break;
    		 }
    		 return x;
    	}
    	return null;
    }
}
