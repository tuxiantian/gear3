package com.weihua.core.utils;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public abstract class SqlUtils
{	
	public static final String page_tpl_1 = "select * from ( sql ) where rownum <= ?";
	public static final String page_tpl_2 = "select * from ( select row_.*, rownum rownum_ from ( sql ) row_ where rownum <= ?) where rownum_ > ?";
	private static final freemarker.template.Configuration fmCfg = new freemarker.template.Configuration();
	static
	{
		fmCfg.setDefaultEncoding("UTF-8");
	}

	public static String getLimitString(String sql, int offset, int limit)
	{

		if (offset == 0)
		{
			return page_tpl_1.replace("sql", sql);
		}
		else
		{
			return page_tpl_2.replace("sql", sql);
		}
	}

	public static void main(String[] args)
	{
		String sql = "@=@";
		System.out.println(getLimitString(sql, 0, 10));

		// Map m = new TreeMap();
		// m.put("message", "xxx");
		// m.put("type", "combo");
		// System.out.println("s|dfsdf".substring(1));
		// System.out.println(parseSql("select * from t_sys_sql where 1=1" +
		// "\r\n<#if type?exists && type?trim!=''>" + "and type=#type_abc#" +
		// "</#if>", m));

	}

	public static String parseSql(String sql, Object param)
	{
		sql = parseSqlTmplate(sql, param);
		Pattern p = Pattern.compile("#([\\w]*)#|\\$([\\w]*)\\$");
		Matcher m = p.matcher(sql);
		StringBuffer sb = new StringBuffer();
		while (m.find())
		{
			if (m.group(1) != null)
			{
				m.appendReplacement(sb, ":" + m.group(1));

			}
			if (m.group(2) != null)
			{
				m.appendReplacement(sb, ":" + m.group(2));
			}
		}
		m.appendTail(sb);
		return sb.toString();
	}

	public static String parseSqlTmplate(String strInput, Object bindMap)
	{
		StringReader reader = new StringReader(strInput);
		try
		{
			String md5 = UtilMD5.crypt(strInput);
			freemarker.template.Template templateA = new freemarker.template.Template(md5, reader, fmCfg);
			StringWriter writerA = new StringWriter();
			templateA.process(bindMap, writerA);
			templateA = null;
			return writerA.toString();
		}
		catch (Throwable ex)
		{
			ex.printStackTrace();
			ByteArrayOutputStream bos = new ByteArrayOutputStream();
			ex.printStackTrace(new PrintStream(bos));
			ex.printStackTrace();
			return ex.getMessage() + bos.toString();
		}
		finally
		{
			reader.close();
		}
	}

	public static String parsePagingSql(String sql, int start, int limit)
	{
		return getLimitString(sql, start, limit);
	}

	public static String parseCountSql(String sql)
	{

		return "select count(*) " + parseSQLConditions(sql);
	}

	public static String parseSQLConditions(String sql)
	{
		List<Pair> pairs = pareToPairs('(', ')', sql);
		char[] chs = sql.toCharArray();
		for (Pair p : pairs)
		{
			for (int i = p.left.index; i <= p.right.index; i++)
			{
				chs[i] = '\0';
			}
		}
		String parseStr = new String(chs).toLowerCase();
		return sql.substring(parseStr.indexOf("from"));
	}

	public static List<Pair> pareToPairs(char left, char right, String str)
	{
		Stack<Pos> stack = new Stack<Pos>();

		Pos pos = null;
		List<Pair> pairs = new ArrayList<Pair>();

		for (int i = 0; i < str.length(); i++)
		{
			if (str.codePointAt(i) == left)
			{
				stack.push(new Pos(i, str.charAt(i)));
			}
			else
				if (str.codePointAt(i) == right)
				{
					pos = stack.pop();
					pairs.add(new Pair(pos, new Pos(i, str.charAt(i))));
				}

		}

		return pairs;
	}

	static class Pos
	{

		public int index;

		public char value;

		public Pos(int index, char value)
		{
			this.index = index;
			this.value = value;
		}
	}

	static class Pair
	{

		public Pair(Pos left, Pos right)
		{
			this.left = left;
			this.right = right;
		}

		public Pos left;

		public Pos right;

		public String toString()
		{
			return String.valueOf(left.value) + left.index + String.valueOf(right.value) + right.index;
		}

	}

}
