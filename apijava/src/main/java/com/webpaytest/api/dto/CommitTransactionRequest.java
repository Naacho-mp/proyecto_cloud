package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para confirmar una transacción de Webpay
 *
 * Recibe el token retornado por Webpay después de que
 * el usuario completa el pago.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitTransactionRequest {

	@NotBlank(message = "El token es requerido")
	private String token;
}

