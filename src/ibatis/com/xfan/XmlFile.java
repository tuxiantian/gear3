package com.xfan;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class XmlFile {
	private File file;
	private long lastModified;

	public XmlFile(File file) {
		this.file = file;
		lastModified = getRealLastModified();
	}

	public void change() {
		lastModified = getRealLastModified();
	}

	public boolean hasChanged() {
		return getRealLastModified() > getLastModified();
	}

	public String toString() {
		return "XmlFile with path=" + getPath();
	}

	public long getRealLastModified() {
		return file.lastModified();
	}

	public long getLastModified() {
		return lastModified;
	}

	public String getPath() {
		return file.getPath();
	}
	
	public String getName(){
		return file.getName();
	}
	
	public File getFile(){
		return file;
	}
	
	public FileInputStream getInputStream(){
		try {
			return new FileInputStream(file);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		return null;
	}
}
