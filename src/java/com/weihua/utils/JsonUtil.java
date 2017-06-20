package com.weihua.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.googlecode.jsonplugin.JSONException;
import com.googlecode.jsonplugin.JSONPopulator;
import com.googlecode.jsonplugin.JSONUtil;

/**
 * 
 * @author faylai
 *
 */
public abstract class JsonUtil
{

	/**
	 * 
	 * @param obj
	 *            将要需要序列化的对象
	 * @return 序列化后的json 字符串
	 */
	public static String toJson(Object obj)
	{
		try
		{

			return JSONUtil.serialize(obj);
		}
		catch (Exception e)
		{
			e.printStackTrace();
			throw new RuntimeException(e.getCause());
		}

	}

	/**
	 * 
	 * @param obj
	 * @param excludeProperties
	 *            被排除列化的属性数组
	 * @return
	 */
	public static String toJsonByExcludes(Object obj, String[] excludeProperties)
	{
		return toJson(obj, excludeProperties, null, null, null);
	}

	/**
	 * 
	 * @param obj
	 * @param excludeProperties
	 *            被排除列化的属性数组
	 * @param ignoreHierarchy
	 *            忽略继承层次
	 * @param excludeNullProperties
	 *            忽略空值属性
	 * @return
	 */
	public static String toJsonByExcludes(Object obj, String[] excludeProperties, Boolean ignoreHierarchy, Boolean excludeNullProperties)
	{
		return toJsonByExcludes(obj, excludeProperties, null, null);
	}

	/**
	 * 
	 * @param obj
	 * @param includeProperties
	 *            包含属性数组
	 * @return
	 */
	public static String toJsonByIncludes(Object obj, String[] includeProperties)
	{
		return toJson(obj, null, includeProperties, null, null);
	}

	/**
	 * 
	 * @param obj
	 * @param includeProperties
	 *            包含属性数组
	 * @param ignoreHierarchy
	 *            忽略继承层次
	 * @param excludeNullProperties
	 *            忽略空值属性
	 * @return
	 */
	public static String toJsonByIncludes(Object obj, String[] includeProperties, Boolean ignoreHierarchy, Boolean excludeNullProperties)
	{
		return toJsonByIncludes(obj, includeProperties, null, null);
	}

	/**
	 * 
	 * @param obj
	 *            将要需要序列化的对象
	 * @param includeProperties
	 *            包含属性支持正则
	 * @param ignoreHierarchy
	 *            忽略继承层级结构（不解析子对象）
	 * @param excludeNullProperties
	 *            忽略值为 null 的属性
	 * @return String 序列化后的json 字符串
	 */
	public static String toJson(Object obj, String[] excludeProperties, String[] includeProperties, Boolean ignoreHierarchy, Boolean excludeNullProperties)
	{
		ArrayList<Pattern> excludePatternes = createPatterns(excludeProperties);
		ArrayList<Pattern> includePatternes = createPatterns(includeProperties);
		ignoreHierarchy = ignoreHierarchy == null ? false : true;
		excludeNullProperties = excludeNullProperties == null ? false : true;
		try
		{
			return JSONUtil.serialize(obj, excludePatternes, includePatternes, ignoreHierarchy, excludeNullProperties);
		}
		catch (JSONException e)
		{
			throw new RuntimeException(e.getCause());
		}

	}

	private static Pattern createPattern(String str)
	{
		return Pattern.compile(str);
	}

	private static ArrayList<Pattern> createPatterns(String[] stres)
	{
		ArrayList<Pattern> list;
		if (stres != null && stres.length > 0)
		{
			list = new ArrayList<Pattern>(stres.length);
			for (String str : stres)
			{
				list.add(createPattern(str));
			}
			return list;
		}
		else
		{
			return null;
		}
	}

	/**
	 * 
	 * @param jsonstr
	 *            符合规定的json 字符串
	 * @param target
	 *            转换成Bean对象
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static Object jsonToBean(String jsonstr, Object target)
	{
		try
		{
			JSONPopulator pop = new JSONPopulator();
			Object obj = JSONUtil.deserialize(jsonstr);
			if (obj instanceof Map)
			{
				pop.populateObject(target, (Map) obj);
				return target;
			}
			if (obj instanceof List)
			{
				return obj;
			}
			else
			{
				throw new Exception("错误json 格式");

			}

		}
		catch (Exception e)
		{
			e.printStackTrace();
			throw new RuntimeException(e.getCause());
		}

	}

	/**
	 * 抱字符josn串转换成Map 对象
	 * 
	 * @param jsonstr
	 *            json 字符串
	 * @return 返回 Map 示例对象
	 */

	@SuppressWarnings("unchecked")
	public static Map jsonToMapObject(String jsonstr)
	{
		try
		{
			JSONPopulator pop = new JSONPopulator();
			Object obj = JSONUtil.deserialize(jsonstr);
			if (obj instanceof Map)
			{
				return (Map) obj;
			}
			else
			{
				throw new Exception("错误json 格式");
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
			throw new RuntimeException(e.getCause());
		}
	}

	/**
	 * 把json 字符串转换成Arraylist对象
	 * 
	 * @param jsonstr
	 *            json 字符串
	 * @return 转换后的 Arraylist
	 */

	@SuppressWarnings("unchecked")
	public static ArrayList jsonToArrayObject(String jsonstr)
	{
		try
		{
			ArrayList alist = (ArrayList) JSONUtil.deserialize(jsonstr);
			return alist;
		}
		catch (Exception e)
		{
			e.printStackTrace();
			throw new RuntimeException(e.getCause());
		}
	}
}
