package com.weihua.core.orm;
import java.util.ArrayList;
import java.util.List;
/**
 * 过滤字段信息
 * @author zenglihui
 * @date 2008-07-10
 */
@SuppressWarnings("unchecked")
public class FilterFieldInfo implements Comparable{
	/**
	 * 是否按“或者”连接过滤条件
	 */
	private boolean isOrJoin=false;
	/**
	 * 是否按“取反”过滤
	 */
	private boolean isNot=false;
	/**
	 * 该字段的过滤SQL
	 */
	private List list=null;
	
	/**
	 * 构造函数
	 */
	public FilterFieldInfo(){
		list=new ArrayList();
	}
	
	/**
	 * 构造函数
	 * @param isOrJoin
	 */
	public FilterFieldInfo(boolean isOrJoin,boolean isNot){
		this.isOrJoin=isOrJoin;
		this.isNot=isNot;
		list=new ArrayList();
	}
	
	/**
	 * 构造函数
	 * @param isOrJoin
	 * @param list
	 */
	public FilterFieldInfo(boolean isOrJoin,boolean isNot,List list){
		this.isOrJoin=isOrJoin;
		this.isNot=isNot;
		this.list=list;
	}
	
	/**
	 * 
	 * @return
	 */
	public boolean isOrJoin() {
		return isOrJoin;
	}
	
	/**
	 * 
	 * @param isOrJoin
	 */
	public void setOrJoin(boolean isOrJoin) {
		this.isOrJoin = isOrJoin;
	}
	
	/**
	 * 
	 * @return
	 */
	public boolean isNot() {
		return isNot;
	}
	
	/**
	 * 
	 * @param isNot
	 */
	public void setNot(boolean isNot) {
		this.isNot = isNot;
	}
	
	/**
	 * 
	 * @return
	 */
	public List getList() {
		return list;
	}
	
	/**
	 * 
	 * @param list
	 */
	public void setList(List list) {
		this.list = list;
	}
	
	/**
	 * 获得是否按“或者”连接过滤条件的SQL字符
	 * @return
	 */
	private String getJoinSign(){
		return (isOrJoin?" or ":" and ");
	}
	
	/**
	 * 获得连接过滤条件的SQL字符(index=0时返回""；否则返回sign)
	 * @param index
	 * @param sign
	 * @return
	 */
	private String getJoinSign(int index,String sign){
		if (index==0){
			return "";
		}else{
			return sign;
		}
	}
	
	/**
	 * 获得“取反”过滤的SQL字符
	 * @return
	 */
	private String getNotSign(){
		return (isNot?" not ":"");
	}
	
	/**
	 * 获得SQL语句
	 * @param index: 在条件中的排列位置
	 * @return
	 */
	public String getSql(int index){
		String sql="";
		
		if (list.size()>0){
			/**
			 * 不同字段间的连接
			 * 此字段排在getMultiFilter中的所有条件的第一个时，前面不加连接符
			 */
			sql=getJoinSign(index,getJoinSign())+getNotSign()+"(";
			
			for (int j = 0; j < list.size(); j++) {
				/**
				 * 相同字段间的连接:
				 * 此条件排在此字段的所有条件中的第一个时(一个字段可有多个条件，如：(A>? and A<? and A<>?))，
				 * 前面不加连接符
				 */
				sql=sql+getJoinSign(j," and ")+(String)list.get(j);
			}
			
			sql=sql+")";
		}
		return sql;
	}

	public int compareTo(Object obj) {
		/**
		 * 按 or 排序的字段排在后面； 按 and 排序的字段排在前面
		 */
		FilterFieldInfo other=(FilterFieldInfo)obj;
		if (this.isOrJoin){// or 
			if (other.isOrJoin){// or 
				return 0;
			}else{// and 
				return 1;
			}
		}else{// and 
			if (other.isOrJoin){// or 
				return -1;
			}else{// and 
				return 0;
			}
		}
	}


}
