package com.weihua.core.utils;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Locale;
import java.util.Map;

import freemarker.cache.TemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.TemplateException;

public class FreemarkerUtil {

	@SuppressWarnings("unchecked")
	public static String processTpl(String tpl, Map param) {
		if(StringUtil.isBlank(tpl)) return "";
		Configuration cfg = new Configuration();
		cfg.setNumberFormat("#");
		cfg.setLocale(Locale.CHINA);
		cfg.setClassicCompatible(true);
		cfg.setTemplateLoader(new StringTemplateLoader(tpl));
		StringWriter writer = new StringWriter();
		try {
			cfg.getTemplate("").process(param, writer);
		} catch (TemplateException e) {
			e.printStackTrace();
			throw new RuntimeException("解析模板出错!\n模板:" + tpl + "\n参数:" + param);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return writer.toString();
	}

	private static class StringTemplateLoader implements TemplateLoader {
		private String temp;

		public StringTemplateLoader(String str) {
			temp = str;
		}

		public void closeTemplateSource(Object templateSource)
				throws IOException {
		}

		public Object findTemplateSource(String name) throws IOException {
			return temp;
		}

		public long getLastModified(Object templateSource) {
			return 0;
		}

		public Reader getReader(Object templateSource, String encoding)
				throws IOException {
			return new StringReader((String) templateSource);
		}
	}
}
