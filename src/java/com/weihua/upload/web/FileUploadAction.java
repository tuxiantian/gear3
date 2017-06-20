package com.weihua.upload.web;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Namespace;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;

import com.weihua.core.utils.MapBean;
import com.weihua.core.web.BaseActionSupport;

@Controller
@Scope("prototype")
@Namespace(value = "/upload")
@ParentPackage("uploadDefault")
public class FileUploadAction extends BaseActionSupport
{
	private static final long serialVersionUID = -5016873153441103539L;
	private File doc;
	private String docFileName;
	private String docContentType;

	/**
	 * 处理上传文件的方法
	 * 
	 * @return
	 */
	@Action(value = "doUpload")
	public void doUpload()
	{

		String path = "c:\\upload";
		// 复制文件
		logger.info("FileUploadAction from file:" + doc.getAbsolutePath());
		File to = new File(path +File.separator+ docFileName);
		logger.info("FileUploadAction to file:" + to.getAbsolutePath());
		try
		{
			FileUtils.copyFile(doc, to);
		}
		catch (IOException e)
		{
			e.printStackTrace();
			this.renderHtml(new MapBean("success", false, "text", "文件已经保存到:" + to.getAbsolutePath()).toJson());
			return;
		}
		this.renderHtml(new MapBean("success", true,"path",to.getName()).toJson());
	}

	public File getDoc()
	{
		return doc;
	}

	public void setDoc(File doc)
	{
		this.doc = doc;
	}

	public String getDocFileName()
	{
		return docFileName;
	}

	public void setDocFileName(String docFileName)
	{
		this.docFileName = docFileName;
	}

	public String getDocContentType()
	{
		return docContentType;
	}

	public void setDocContentType(String docContentType)
	{
		this.docContentType = docContentType;
	}
}
