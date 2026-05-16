package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para respuesta de consulta de estado
 *
 * Contiene el estado actual de la transacción
 * y detalles de la respuesta de Webpay.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetStatusResponse {

	private String buyOrder;
	private String cardNumber;
	private String authorizationCode;
	private String paymentTypeCode;
	private Integer responseCode;
	private String status;
	private String installmentsNumber;
	private String installmentsAmount;
}

