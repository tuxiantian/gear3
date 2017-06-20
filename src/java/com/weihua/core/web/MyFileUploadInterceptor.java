package com.weihua.core.web;

import java.io.File;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Set;

import org.apache.struts2.interceptor.FileUploadInterceptor;

import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.ValidationAware;
import com.opensymphony.xwork2.inject.Inject;
import com.opensymphony.xwork2.util.LocalizedTextUtil;
import com.opensymphony.xwork2.util.PatternMatcher;
import com.opensymphony.xwork2.util.TextParseUtil;
import com.opensymphony.xwork2.util.logging.Logger;
import com.opensymphony.xwork2.util.logging.LoggerFactory;
import com.weihua.core.utils.FileUtils;

public class MyFileUploadInterceptor extends FileUploadInterceptor {

	private static final long serialVersionUID = -1714813144686215256L;
	
	protected static final Logger LOG = LoggerFactory.getLogger(MyFileUploadInterceptor.class);
	
	/**禁止使用的文件类型，对应mime属性*/
	protected Set<String> deniedTypesSet = Collections.emptySet();
	
	/**禁止的扩展名*/
	protected Set<String> deniedExtensionsSet = Collections.emptySet();
	
	private static final String DEFAULT_MESSAGE = "no.message.found";
	
	private static final String  CONTENT_TYPE_NOT_ALLOWED = "文件上传失败：您要上传的文件类型不允许！";
	
	private static final String  FILE_TOO_LARGE = "文件上传失败：您上传的文件太大，超过了限制（50M）！";
	
	private static final String  ERROR_UPLOADING = "文件上传失败：发生内部错误";
	
	private PatternMatcher matcher;
	
	@Inject
    public void setMatcher(PatternMatcher matcher) {
        this.matcher = matcher;
    }
	
	@Override
	public String intercept(ActionInvocation invocation) throws Exception {
		return super.intercept(invocation);
	}
	/**
	 * 判断文件大小，文件类型是否符合
	 * 文件类型判断规则 ： 先判断禁止列表是否不为空，如果不为空，就匹配禁止列表。如果禁止列表为空且允许列表不为空，则匹配是否在允许列表里
	 * 
	 */
	@Override
	protected boolean acceptFile(Object action, File file, String filename,
			String contentType, String inputName, ValidationAware validation,
			Locale locale) {
		 boolean isOk = true;
	        // If it's null the upload failed
	        if (file == null) {
	            if (validation != null) {
	                validation.addFieldError(inputName, ERROR_UPLOADING);
	            }
	            isOk = false;
	            LOG.warn(ERROR_UPLOADING);
	        } else if (maximumSize != null && maximumSize < file.length()) {
	            if (validation != null) {
	                validation.addFieldError(inputName, FILE_TOO_LARGE);
	            }
	            isOk = false;
	            LOG.warn(FILE_TOO_LARGE);
	        } 
	        
	        if(isOk && (!deniedTypesSet.isEmpty()  || !deniedExtensionsSet.isEmpty())){
	        	if ((!deniedTypesSet.isEmpty()) && containsItem(deniedTypesSet, contentType)) {
		            if (validation != null) {
		                validation.addFieldError(inputName, CONTENT_TYPE_NOT_ALLOWED);
		            }
		            isOk = false;
		            LOG.warn(CONTENT_TYPE_NOT_ALLOWED);
		        } else if ((!deniedExtensionsSet.isEmpty()) && hasAllowedExtension(deniedExtensionsSet, filename)) {
		            if (validation != null) {
		                validation.addFieldError(inputName, CONTENT_TYPE_NOT_ALLOWED);
		            }
		            isOk = false;
		            LOG.warn(CONTENT_TYPE_NOT_ALLOWED);
		        }
	        }else if(isOk && (!allowedTypesSet.isEmpty() || !allowedExtensionsSet.isEmpty())){
	        	if ((!allowedTypesSet.isEmpty()) && (!containsItem(allowedTypesSet, contentType))) {
		            if (validation != null) {
		                validation.addFieldError(inputName, CONTENT_TYPE_NOT_ALLOWED);
		            }
		            isOk = false;
		        } else if ((!allowedExtensionsSet.isEmpty()) && (!hasAllowedExtension(allowedExtensionsSet, filename))) {
		            if (validation != null) {
		                validation.addFieldError(inputName, CONTENT_TYPE_NOT_ALLOWED);
		            }
		            isOk = false;
		            LOG.warn(CONTENT_TYPE_NOT_ALLOWED);
		        }
	        }
	        return isOk;     
	}
	
	
	
	
	/**
     * Sets the denied extensions
     *
     * @param deniedExtensions A comma-delimited list of extensions
     */
    public void setDeniedExtensions(String deniedExtensions) {
    	deniedExtensionsSet = TextParseUtil.commaDelimitedStringToSet(deniedExtensions);
    }

    /**
     * Sets the denied mimetypes
     *
     * @param deniedTypes A comma-delimited list of types
     */
    public void setDeniedTypes(String deniedTypes) {
    	deniedTypesSet = TextParseUtil.commaDelimitedStringToSet(deniedTypes);
    }
    
    
    /**
     * @param extensionCollection - Collection of extensions (all lowercase).
     * @param filename            - filename to check.
     * @return true if the filename has an allowed extension, false otherwise.
     */
    protected boolean hasAllowedExtension(Collection<String> extensionCollection, String filename) {
        if (filename == null) {
            return false;
        }
        
        String ext = FileUtils.getExtension(filename);
        if(ext==null || ext.length()<1){
        	return false;
        }

        for (String extension : extensionCollection) {
            if (ext.equalsIgnoreCase(extension)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param itemCollection - Collection of string items (all lowercase).
     * @param item           - Item to search for.
     * @return true if itemCollection contains the item, false otherwise.
     */
    protected boolean containsItem(Collection<String> itemCollection, String item) {
        for (String pattern : itemCollection)
            if (matchesWildcard(pattern, item))
                return true;
        return false;
    }

    protected boolean matchesWildcard(String pattern, String text) {
        Object o = matcher.compilePattern(pattern);
        return matcher.match(new HashMap<String, String>(), text, o);
    }

    protected boolean isNonEmpty(Object[] objArray) {
        boolean result = false;
        for (int index = 0; index < objArray.length && !result; index++) {
            if (objArray[index] != null) {
                result = true;
            }
        }
        return result;
    }

    protected String getTextMessage(String messageKey, Object[] args, Locale locale) {
        return getTextMessage(null, messageKey, args, locale);
    }

    protected String getTextMessage(Object action, String messageKey, Object[] args, Locale locale) {
        if (args == null || args.length == 0) {
            if (action != null && useActionMessageBundle) {
                return LocalizedTextUtil.findText(action.getClass(), messageKey, locale);
            }
            return LocalizedTextUtil.findText(this.getClass(), messageKey, locale);
        } else {
            if (action != null && useActionMessageBundle) {
                return LocalizedTextUtil.findText(action.getClass(), messageKey, locale, DEFAULT_MESSAGE, args);
            }
            return LocalizedTextUtil.findText(this.getClass(), messageKey, locale, DEFAULT_MESSAGE, args);
        }
    }
}
