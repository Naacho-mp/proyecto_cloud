package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para respuesta de reembolso o anulación
 *
 * Contiene el resultado de la operación de reembolso.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundTransactionResponse {

	private String type;
	private String token;
	private Long refundedAmount;
	private Integer balance;
	private String status;
}

