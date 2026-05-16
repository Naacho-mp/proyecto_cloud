package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO genérico de respuesta API
 *
 * Usado para todas las respuestas de la API.
 * Incluye código de éxito/error, mensaje y datos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

	private boolean success;
	private String message;
	private T data;
	private String timestamp;
	private String path;

	public static <T> ApiResponse<T> success(T data, String message) {
		return ApiResponse.<T>builder()
				.success(true)
				.message(message)
				.data(data)
				.timestamp(java.time.LocalDateTime.now().toString())
				.build();
	}

	public static <T> ApiResponse<T> error(String message, String path) {
		return ApiResponse.<T>builder()
				.success(false)
				.message(message)
				.path(path)
				.timestamp(java.time.LocalDateTime.now().toString())
				.build();
	}
}

