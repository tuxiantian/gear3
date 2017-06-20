package com.weihua.core.exception;
public class BusinessException extends RuntimeException {
	private static final long serialVersionUID = -6566569926958436584L;
	private String code; // 异常编码
	private String msg; // 异常信息
	private String detail; // 具体信息

	public BusinessException(String code, String eMsg, String detail) {
		super(eMsg);
		this.setCode(code);
		this.setMsg(eMsg);
		this.setDetail(detail);
	}

	public BusinessException(String eMsg) {
		super(eMsg);
		this.setMsg(eMsg);
	}

	public String getDetail() {
		return detail;
	}

	public void setDetail(String detail) {
		this.detail = detail;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}
}
