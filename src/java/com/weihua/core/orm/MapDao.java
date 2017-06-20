package com.weihua.core.orm;

import java.util.Map;

@SuppressWarnings("unchecked")
public class MapDao extends BeanDao<Map> {
	@Override
	public void init() {
		if (this.getClass().isAnnotationPresent(Module.class)) {
			Module p = this.getClass().getAnnotation(Module.class);
			this.setModule(p.value());
		} else {
			throw new RuntimeException("请指定Module名");
		}
	}
}
