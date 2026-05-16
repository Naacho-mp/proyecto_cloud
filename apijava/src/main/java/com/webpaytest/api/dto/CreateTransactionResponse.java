package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta de crear transacción
 *
 * Contiene el token de sesión y la URL para redirigir
 * al usuario a Webpay para ingresar datos de pago.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTransactionResponse {

	private String token;
	private String url;
	private String buyOrder;
	private String sessionId;
}

