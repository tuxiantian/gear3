package com.weihua.core.web;

import com.weihua.core.orm.DefaultDao;


public interface CUDTransactional
{
	public void doTransaction(DefaultDao dao);
}
