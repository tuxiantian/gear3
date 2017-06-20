package ${config.package}.${config.actionPackage};

import ${config.package}.entity.${config.appName?cap_first};
import ${config.package}.${config.servicePackage}.${config.appName?cap_first}Service;
import com.laijia.core.entity.MapBean;
import com.laijia.core.entity.Page;
import com.laijia.core.web.AbstractController;
import com.laijia.core.web.ControllerHelper;
import com.laijia.core.web.IActionValidate;
import com.laijia.core.web.ValidateHelper;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletResponse;

/**
* Created by creator
*/
@Controller("web${config.appName?cap_first}Controller")
@RequestMapping("${config.actionNamespace}")
public class ${config.appName?cap_first}Controller extends AbstractController {

	private static final Logger logger = LoggerFactory.getLogger(${config.appName?cap_first}Controller.class);

	@Autowired
	private ${config.appName?cap_first}Service ${config.appName?uncap_first}Service;

	@RequestMapping("page")
	public String page() {
		return "${config.ftlName}/list";
	}

	@RequestMapping("/query")
	public ResponseEntity<MapBean> query(ModelMap mv) {
		MapBean params = $map();
		Page<${config.appName?cap_first}> page = ControllerHelper.getPage();
        page = this.${config.appName?uncap_first}Service.find(page, params);
        return renderPage(page);
	}

	@RequestMapping("/add")
	public String add(ModelMap mv) {
		return "${config.ftlName}/${config.ftlEntityName}";
	}

	@RequestMapping("/edit/{id}")
	public String edit(@PathVariable("id") String id, ModelMap mv) {
		${config.appName?cap_first} entity = this.${config.appName?uncap_first}Service.findBy(id);
        mv.put("entity", entity);
        return "${config.ftlName}/${config.ftlEntityName}";
	}

	@RequestMapping("/saveOrUpdate")
	public void saveOrUpdate(${config.appName?cap_first} entity, HttpServletResponse response) {
		MapBean params = $map();
		boolean isEdit = false;
		if (entity != null && entity.getId()!=null) {
			isEdit = true;
		}
		IActionValidate av = isEdit ? validEdit(params) : validAdd(params);
		boolean isOk = av.isCon();
		String msg = av.getMsg();
		if (isOk) {
			this.${config.appName?uncap_first}Service.saveOrUpdate(entity);
		}
		if (isOk) {
			renderJavascript(response, onSuccessScript("${config.ftlName}/page", null));
		} else {
			renderJavascript(response, onErrorScript(StringUtils.defaultString(msg, "保存失败")));
		}
	}

	@RequestMapping("/delete/{id}")
	public ResponseEntity<MapBean> delete(@PathVariable("id") String id, ModelMap mv) {
		//boolean isOk = this.${config.appName?uncap_first}Service.checkDelete(id);
		boolean isOk = true;
		if (isOk) {
			this.${config.appName?uncap_first}Service.delete(id);
		}
		if (!isOk) {
			return this.renderFail("您删除的信息正在使用，无法删除。");
		}
		return this.renderSuccess("删除成功", "${config.ftlName}/page");
	}

	private IActionValidate validAdd(MapBean params) {
		IActionValidate vh = new ValidateHelper(params);
		vh.validBlank("name", "名称");
		return vh;
	}

	private IActionValidate validEdit(MapBean params) {
		return validAdd(params).validBlank("id", "id");
	}
}