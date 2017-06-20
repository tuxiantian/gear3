package com.weihua;

import java.io.File;
import java.io.IOException;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.commons.io.FileUtils;

public class JavaTest
{
	public static void main1(String args[])
	{
		String path = "/sdf/";
		if (path.length() > 1 && path.split("/").length > 2)
		{

			path = "/";
		}
		System.out.println(path);

	}

	public static void main(String args[]) throws IOException
	{
		test();

	}

	public static void test() throws IOException
	{
		ScriptEngineManager manager = new ScriptEngineManager();
		ScriptEngine engine = manager.getEngineByName("javascript");
		String json2 = FileUtils.readFileToString(new File(JavaTest.class.getResource("json2.js").getPath()));
		String testjs = FileUtils.readFileToString(new File(JavaTest.class.getResource("test.js").getPath()));
		try
		{
			engine.eval(json2);
			engine.put("console", new Console());
			System.out.println(engine.eval(testjs));
		}
		catch (ScriptException e)
		{
			e.printStackTrace();
		}

	}

	static class Console
	{
		public void log(String str)
		{
			System.out.println(str);
		}
	}

}
