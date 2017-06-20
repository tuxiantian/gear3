package com.weihua.core.exception;
public class FlowException extends BusinessException {
	private static final long serialVersionUID = 1L;

	public FlowException(String eMsg, String detail) {
		super("flow", eMsg, detail);
	}

	public FlowException(String eMsg) {
		super(eMsg);
	}
}
