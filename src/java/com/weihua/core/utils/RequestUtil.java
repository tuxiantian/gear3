package com.weihua.core.utils;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.dom4j.Document;
import org.dom4j.io.SAXReader;
import com.weihua.core.Constants;
public class RequestUtil {
	protected final Log logger = LogFactory.getLog(getClass());

	public static Long getLong(String name, HttpServletRequest req) {
		return Long.parseLong(req.getParameter(name));
	}

	public static Integer getInt(String name, HttpServletRequest req) {
		return Integer.parseInt(req.getParameter(name));
	}

	public static Document getDoc(HttpServletRequest request) throws Exception {
		request.setCharacterEncoding(Constants.SYS_PAGE_ENCODE);
		SAXReader reader = new SAXReader();
		Document document = reader.read(request.getInputStream());
		return document;
	}
}
