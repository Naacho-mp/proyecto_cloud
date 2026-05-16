package com.webpaytest.api.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import com.webpaytest.api.dto.ApiResponse;

/**
 * Manejador global de excepciones
 *
 * Captura todas las excepciones de la API y retorna
 * respuestas JSON consistentes con códigos HTTP apropiados.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	/**
	 * Maneja excepciones de Webpay
	 */
	@ExceptionHandler(WebpayException.class)
	public ResponseEntity<ApiResponse<Void>> handleWebpayException(
			WebpayException ex,
			WebRequest request) {
		logger.error("Error de Webpay: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);

		ApiResponse<Void> response = ApiResponse.error(
				ex.getMessage(),
				request.getDescription(false).replace("uri=", ""));

		return new ResponseEntity<>(response, HttpStatus.valueOf(ex.getHttpStatus()));
	}

	/**
	 * Maneja errores de validación
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> handleValidationException(
			MethodArgumentNotValidException ex,
			WebRequest request) {
		logger.warn("Error de validación: {}", ex.getBindingResult().getAllErrors());

		String message = ex.getBindingResult().getFieldErrors()
				.stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.findFirst()
				.orElse("Error de validación");

		ApiResponse<Void> response = ApiResponse.error(
				message,
				request.getDescription(false).replace("uri=", ""));

		return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Maneja excepciones genéricas
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleGeneralException(
			Exception ex,
			WebRequest request) {
		logger.error("Error no esperado", ex);

		ApiResponse<Void> response = ApiResponse.error(
				"Error interno del servidor",
				request.getDescription(false).replace("uri=", ""));

		return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}

