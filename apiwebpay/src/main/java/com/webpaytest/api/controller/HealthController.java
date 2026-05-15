package com.webpaytest.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.webpaytest.api.dto.ApiResponse;

/**
 * Controlador de Health Check
 *
 * Proporciona endpoints para verificar el estado de la API.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

	/**
	 * Verifica que la API está funcionando
	 *
	 * Endpoint: GET /api/health
	 * Response: 200 OK
	 */
	@GetMapping("/health")
	public ResponseEntity<ApiResponse<String>> health() {
		ApiResponse<String> response = ApiResponse.success(
				"API running",
				"API está funcionando correctamente");

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	/**
	 * Información general de la API
	 *
	 * Endpoint: GET /api/info
	 */
	@GetMapping("/info")
	public ResponseEntity<ApiResponse<String>> info() {
		String message = "Webpay Plus Integration API v1.0 - "
				+ "Integration Environment - "
				+ "Endpoints disponibles: "
				+ "/api/webpay/create, /api/webpay/commit, /api/webpay/status, /api/webpay/refund";

		ApiResponse<String> response = ApiResponse.success(message, "Información de la API");

		return new ResponseEntity<>(response, HttpStatus.OK);
	}
}

