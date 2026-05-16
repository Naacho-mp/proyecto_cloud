package com.webpaytest.api.exception;

/**
 * Excepción personalizada para errores de Webpay
 *
 * Se lanza cuando ocurre un error en la comunicación
 * o procesamiento con la SDK de Transbank.
 */
public class WebpayException extends RuntimeException {

	private String errorCode;
	private int httpStatus;

	public WebpayException(String message) {
		super(message);
		this.errorCode = "WEBPAY_ERROR";
		this.httpStatus = 400;
	}

	public WebpayException(String message, String errorCode) {
		super(message);
		this.errorCode = errorCode;
		this.httpStatus = 400;
	}

	public WebpayException(String message, String errorCode, int httpStatus) {
		super(message);
		this.errorCode = errorCode;
		this.httpStatus = httpStatus;
	}

	public WebpayException(String message, Throwable cause) {
		super(message, cause);
		this.errorCode = "WEBPAY_ERROR";
		this.httpStatus = 400;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public int getHttpStatus() {
		return httpStatus;
	}
}

