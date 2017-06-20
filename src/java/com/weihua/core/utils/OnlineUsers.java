package com.weihua.core.utils;

import java.util.HashSet;
import java.util.Map;

public class OnlineUsers {

	public static HashSet userList = new HashSet();
	
	
	public static int add(Map user){
		if(user!=null){
			userList.add(user);
		}
		return userList.size();
	}
	
	public static int remove(Map user){
		if(user!=null){
			userList.remove(user);
		}
		return userList.size();
	}
	
	/**
	 * 返回在线人数
	 * @return
	 */
	public static int getCount(){
		return userList.size();
	}
}