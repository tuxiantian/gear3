package com.weihua.core.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.dom4j.Document;
import org.dom4j.Element;
@SuppressWarnings("unchecked")
public class XmlUtil {
	public static List<Map> getList(Document doc, String node) {
		List detail = new ArrayList();
		List list = doc.selectNodes(node);
		if (list != null) {
			for (int i = 0, n = list.size(); i < n; i++) {
				Element data = (Element) list.get(i);
				Map tmp = new HashMap();
				for (Iterator iter = data.elementIterator(); iter.hasNext();) {
					Element foo = (Element) iter.next();
					tmp.put(foo.getName(), foo.getTextTrim());
				}
				detail.add(tmp);
			}
		}
		return detail;
	}

	public static Map getMap(Document doc, String node) {
		Map master = new HashMap();
		Element m = (Element) doc.selectSingleNode(node);
		if (m != null) {
			for (Iterator i = m.elementIterator(); i.hasNext();) {
				Element foo = (Element) i.next();
				master.put(foo.getName(), foo.getTextTrim());
			}
		}
		return master;
	}

	public static Map getMap(Document doc) {
		return getMap(doc, "//master");
	}

	public static List<Map> getList(Document doc) {
		return getList(doc, "//data");
	}
}
