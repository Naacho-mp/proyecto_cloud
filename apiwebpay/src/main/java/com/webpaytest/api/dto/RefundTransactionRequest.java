package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para solicitar reembolso o anulación de transacción
 *
 * Recibe el token de la transacción a reembolsar.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundTransactionRequest {

	@NotBlank(message = "El token es requerido")
	private String token;
}

