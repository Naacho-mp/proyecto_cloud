package com.webpaytest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para consultar estado de una transacción
 *
 * Recibe el token de la transacción a consultar.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetStatusRequest {

	@NotBlank(message = "El token es requerido")
	private String token;
}

