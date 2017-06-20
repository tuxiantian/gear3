package com.xfan;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.orm.ibatis.SqlMapClientFactoryBean;

@SuppressWarnings("unchecked")
public class XmlFilesManager {
	private static Map monitoredXmls = new HashMap<String, XmlFile>();
	protected static final Log logger = LogFactory
			.getLog(XmlFilesManager.class);

	private static boolean xmlFilesLoaded = false;
	private static volatile boolean isReloadingConfig = false;
	private static volatile boolean isScanningClassPath = false;

	public static void registerXmlFile(File file) {
		String name = file.getName();
		if (!monitoredXmls.containsKey(name)) {
			XmlFile xmlFile = new XmlFile(file);
			monitoredXmls.put(name, xmlFile);
		}
	}

	public static void clearXmlFiles() {
		monitoredXmls = new HashMap<String, XmlFile>();
	}

	public static boolean checkFilesForChanges() {
		boolean hasChanged = false;
		for (XmlFile file : getMonitoredFiles()) {
			hasChanged = hasChanged || file.hasChanged();
		}
		return hasChanged;
	}

	/* Just for debugging.. remove from production */
	public static void debug() {
		logger.debug("以下ibatis文件被监控:");
		for (XmlFile xmlfile : getMonitoredFiles()) {
			SimpleDateFormat sf = new SimpleDateFormat("HH:mm:ss");
			String date = sf.format(new Date(xmlfile.getRealLastModified()));
			logger.debug("文件:" + xmlfile + " 最后修改 时间 = " + date + " - 最后记录时间="
					+ sf.format(new Date(xmlfile.getLastModified())));
		}
	}

	private static Collection<XmlFile> getMonitoredFiles() {
		return monitoredXmls.values();
	}

	public static List<XmlFile> getModifyFiles() {
		List modifies = new ArrayList<XmlFile>();
		for (XmlFile file : getMonitoredFiles()) {
			if (file.hasChanged()) {
				modifies.add(file);
			}
		}
		return modifies;
	}

	public static void reScanClasspath() {
		logger.debug("===重新扫描Ibatis文件===");
		if (isScanningClassPath)
			return;
		boolean reload = false;
		if (!xmlFilesLoaded) {
			updateXmlFilesToBeMonitored();
			xmlFilesLoaded = true;
		}
		XmlFilesManager.debug();
		if (haveXmlFilesBeenChanged()) {
			reload = true;
		}

		if (reload) {
			reloadIbatisConfiguration();
		}
	}

	/**
	 * 添加新增的ibatis文件
	 */
	private static void updateXmlFilesToBeMonitored() {

	}

	static boolean haveXmlFilesBeenChanged() {
		boolean haveChanged = XmlFilesManager.checkFilesForChanges();
		if (haveChanged) {
			logger.debug(" =====> ibatis文件发生更改!!");
		} else {
			logger.debug(" =====> ibatis文件没有更改");
		}
		return haveChanged;
	}

	private static void reloadIbatisConfiguration() {
		if (isReloadingConfig)
			return;
		synchronized (XmlFilesManager.class) {
			isReloadingConfig = true;
			List<XmlFile> files = XmlFilesManager.getModifyFiles();
			for (int i = 0; i < files.size(); i++) {
				XmlFile file = files.get(0);
				try {
					SqlMapClientFactoryBean.mapParser.parse(file
							.getInputStream());
				} catch (Exception e) {
					logger.debug(e.getMessage());
				} finally {
					file.change();
					isReloadingConfig = false;
				}
			}
		}
	}
}
