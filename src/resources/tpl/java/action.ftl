package ${config.actionPackage};

import ${config.package}.entity.${config.appName?cap_first};
import ${config.package}.${config.servicePackage}.${config.appName?cap_first}Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletResponse;

/**
* Created by creator
*/
@Controller("web${config.appName?cap_first}Controller")
@RequestMapping("${config.actionNamespace}")
public class ${config.appName?cap_first}Api {

	private static final Logger logger = LoggerFactory.getLogger(${config.appName?cap_first}Api.class);

	@Autowired
	private ${config.appName?cap_first}Service ${config.appName?uncap_first}Service;

}