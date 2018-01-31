package ${config.package}.${config.daoPackage};

import com.laijia.core.mybatis.EntityMapper;
import ${config.package}.entity.${config.appName?cap_first};
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ${config.appName?cap_first}Mapper extends EntityMapper<${config.appName}> {

}
