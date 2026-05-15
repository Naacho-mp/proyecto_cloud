package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para respuesta de confirmación de transacción
 *
 * Contiene la información completa de la transacción
 * confirmada incluyendo código de autorización y estado.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitTransactionResponse {

	private String buyOrder;
	private String cardNumber;
	private String authorizationCode;
	private String paymentTypeCode;
	private Integer responseCode;
	private String amount;
	private String status;
	private String installmentsNumber;
	private String installmentsAmount;
}

