package ${config.package}.${config.servicePackage};

import com.pony.core.mybatis.EntityMapper;
import com.pony.core.service.AbstractService;
import ${config.package}.${config.daoPackage}.${config.appName?cap_first}Mapper;
import ${config.package}.entity.${config.appName?cap_first};
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
* Created by creator
*/
@Service
@Transactional
public class ${config.appName?cap_first}Service extends AbstractService<${config.appName?cap_first}>{

	private static final Logger logger = LoggerFactory.getLogger(${config.appName?cap_first}Service.class);

	@Autowired
	private ${config.appName?cap_first}Mapper mapper;

	@Override
	protected EntityMapper<${config.appName?cap_first}> getMapper() {
    	return mapper;
    }
}