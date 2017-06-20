package com.weihua.core.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Random;

import javax.imageio.ImageIO;
import javax.imageio.stream.ImageInputStream;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.struts2.ServletActionContext;

/**
 * 文件上传的辅助类
 * 
 * 生成上传路径，获取扩展名等。
 * @author wbq
 *
 */
public class FileUtils {

	public static final DateFormat format = new SimpleDateFormat("yyMMddHHmmssms");
	
	public static final DateFormat dateFomat = new SimpleDateFormat("yyyy-MM-dd");
	
	private static final org.apache.log4j.Logger logger =  org.apache.log4j.Logger.getLogger(FileUtils.class);
	
	/**
	 * 文件夹标志
	 */
	public static final String FILE_APPEND = "/";
	
	
	/**
	 * 根据文件名，产生新的文件名
	 * @param fileName
	 * @return
	 */
	@Deprecated
	public static String generateFileName(String fileName) {
		String formatDate = format.format(new Date());

		int random = new Random().nextInt(1000);
		String randStr = UtilMD5.crypt(fileName +  random);
		randStr = randStr.substring(2,10);
		int position = fileName.lastIndexOf(".");
		String extension = fileName.substring(position);

		return formatDate + randStr + extension;
	}
	
	/**
	 * 根据旧文件名，返回新文件名
	 * 新文件名生成规则：yyMMddHHmmss_deptId_userId.ext 当前日期的具体时间，当前用户所在部门id，当前用户id，扩展名
	 * 
	 * @param oldFileName
	 * @return
	 */
	public static String createFileName(String oldFileName){
		if(oldFileName!=null && oldFileName.length()>0){
			return format.format(new Date())+RandomStringUtils.randomAlphabetic(10)+"_"+MixUtil.getUserId()+"."+getExtension(oldFileName);
		}
		return null;
	}
	
	/**
	 * 根据扩展名，生成文件名
	 * 新文件名生成规则：yyMMddHHmmss_deptId_userId.ext 当前日期的具体时间，当前用户所在部门id，当前用户id，扩展名
	 * 
	 * @param oldFileName
	 * @return
	 */
	public static String createNewFileName(String extension){
		if(extension!=null && extension.length()>0){
			return format.format(new Date())+RandomStringUtils.randomAlphabetic(10)+"_"+MixUtil.getUserId()+"."+extension;
		}
		return null;
	}
	
	/**
	 * 判断指定路径是否存在，如果不在则创建
	 * @param dir 指定的路径，
	 * @return
	 */
	public static void createDirIsNotExists(String dir){
		if(dir!=null){
			String path = getPath(dir);
			if(path!=null && path.length()>0){
				String realPath = getAbsolutePath(path);
				if(realPath!=null && realPath.length()>0){
					File f = new File(realPath);
					if(!f.exists()){
						f.mkdirs();
					}
				}
			}
			
		}
	}
	
	/**
	 * 根据参数，返回文件名 （带扩展名）
	 * 
	 * a/b/c.txt --> c.txt
     * a.txt     --> a.txt
     * a/b/c     --> c
     * a/b/c/    --> ""
     * null      --> null
	 * @param pathAndName 可以是文件的绝对路径，也可以是相对路径，也可以是只是文件名，如果只是路径，不含文件名，则返回null
	 * @return
	 */
	public static String getFileName(String pathAndName){
		return FilenameUtils.getName(FilenameUtils.getName(pathAndName));
	}
	
	/**
	 * 返回文件夹路径
	 * C:\a\b\c.txt --> a\b\
     * ~/a/b/c.txt  --> a/b/
     * a.txt        --> ""
     * a/b/c        --> a/b/
     * a/b/c/       --> a/b/c/
	 * @param pathOrName
	 * @return
	 */
	public static String getPath(String pathOrName){
		return FilenameUtils.getPath(pathOrName);
	}
	
	/**
	 * 根据相对于项目的路径，返回硬盘上真实的路径，此方法依赖struts2
	 * @param path
	 */
	public static String getRealPath(String path){
		if(path!=null){
			return ServletActionContext.getServletContext().getRealPath(path);
		}
		return null;
	}

	/**
	 * 根据相对于项目的路径，返回硬盘上真实的路径，此方法依赖struts2
	 * @param path
	 */
	public static String getRealPath(String path, HttpServletRequest request){
		if(path!=null && request!=null){
			return request.getSession().getServletContext().getRealPath(path);
		}
		return null;
	}
	/**
	 * 根据配置的根路径，返回指定路径的硬盘上真实的路径，
	 * @param path
	 */
	public static String getAbsolutePath(String path){
		if(path!=null){
			String t = ConfigUtil.getUploadPath();
			if(t.endsWith(FILE_APPEND) || path.startsWith(FILE_APPEND)){
				return new File(t+path).getAbsolutePath();
			}else{
				return new File(t+FILE_APPEND+path).getAbsolutePath();
			}
		}
		return null;
	}
	/**
	 * 根据参数，返回文件名 （不带扩展名）
	 * 
	 * a/b/c.txt --> c
     * a.txt     --> a
     * a/b/c     --> c
     * a/b/c/    --> ""
     * null      --> null
	 * @param pathAndName 可以是文件的绝对路径，也可以是相对路径，也可以是只是文件名，如果只是路径，不含文件名，则返回null
	 * @return
	 */
	public static String getFileNameNoExt(String path){
		return FilenameUtils.getBaseName(path);
	}
	
	/**
	 * 返回扩展名
	 * 
	 * foo.txt      --> "txt"
     * a/b/c.jpg    --> "jpg"
     * a/b.txt/c    --> ""
     * a/b/c   
	 * 
	 * @param pathOrName
	 * @return
	 */
	public static String getExtension(String pathOrName){
		return FilenameUtils.getExtension(pathOrName);
	}
	
	/**
	 * 返回当前日期的文件路径
	 * 例如：今天是 2011-07-15，则返回路径为2011/07/15
	 * @return
	 */
	public static String getDatePath(){
		StringBuffer sb = new StringBuffer();
		String s[] = dateFomat.format(new Date()).split("-");
		for (int i = 0; i < s.length; i++) {
			sb.append(s[i]+'/');
		}
		if(sb.length()>0){
			sb.deleteCharAt(sb.length()-1);
		}
		return sb.toString();
	}
	

	
	/**
	 * 判断指定路径下的文件是否存在
	 * @param file 相对于项目的路径
	 * @return
	 */
	public static boolean isExistsFile(String file){
		if(file!=null && file.length()>0){
			File f = new File(getAbsolutePath(file));
			return f.exists();
		}
		return false;
	}
	
	/**
	 * 判断指定的文件是否为有效的图片格式
	 * @param file
	 * @return
	 */
	public static boolean isImage(File file){
		if(file==null || !file.exists() || !file.isFile())return false;
		ImageInputStream iis = null;
		try {
			iis = ImageIO.createImageInputStream(file);
			Iterator iter = ImageIO.getImageReaders(iis);
			if (!iter.hasNext()) {
			   return false;
			}else{
			    return true;
			}
		} catch (Exception e) {
			
		}finally{
			try {
				iis.close();
			} catch (Exception e) {
			}
		}
		return false;
	}
	
	
	public static void main(String[] args) {
		String s = "E:\\sys\\Fedora-15-x86_64-DVD.iso";
		System.out.println(FileUtils.getFileName(s));
		
		System.out.println(FileUtils.getDatePath());
		
		System.out.println(FileUtils.createNewFileName(".dox"));

    }
	
}
