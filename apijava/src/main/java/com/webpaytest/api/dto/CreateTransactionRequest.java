package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO para crear una transacción de Webpay
 *
 * Contiene los datos mínimos requeridos para iniciar
 * una transacción con Webpay Plus.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTransactionRequest {

	@NotNull(message = "El monto es requerido")
	@Positive(message = "El monto debe ser mayor a 0")
	private Long amount;

	@NotBlank(message = "La orden es requerida")
	private String buyOrder;

	@NotBlank(message = "El email del comprador es requerido")
	private String sessionId;

	@NotBlank(message = "La URL de retorno es requerida")
	private String returnUrl;
}
