package com.webpaytest.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import cl.transbank.webpay.webpayplus.WebpayPlus;
import com.webpaytest.api.dto.CreateTransactionRequest;
import com.webpaytest.api.dto.CreateTransactionResponse;
import com.webpaytest.api.dto.CommitTransactionRequest;
import com.webpaytest.api.dto.CommitTransactionResponse;
import com.webpaytest.api.dto.GetStatusRequest;
import com.webpaytest.api.dto.GetStatusResponse;
import com.webpaytest.api.dto.RefundTransactionRequest;
import com.webpaytest.api.dto.RefundTransactionResponse;
import com.webpaytest.api.exception.WebpayException;

/**
 * Servicio de integración con Webpay Plus
 *
 * Usa ÚNICAMENTE métodos REALES de WebpayPlus.Transaction:
 * - create(buyOrder, sessionId, amount, returnUrl)
 * - commit(token)
 * - status(token)
 * - refund(token, amount)
 *
 * Los objetos de salida vienen directamente de la SDK.
 * Accedemos a sus propiedades con los métodos getter reales.
 */
@Service
public class WebpayService {

	private static final Logger logger = LoggerFactory.getLogger(WebpayService.class);

	private final com.webpaytest.api.payment.PaymentGateway paymentGateway;

	public WebpayService(com.webpaytest.api.payment.PaymentGateway paymentGateway) {
		this.paymentGateway = paymentGateway;
	}

	/**
	 * Crea una nueva transacción (delegada al gateway configurado)
	 */
	public CreateTransactionResponse createTransaction(CreateTransactionRequest request) {
		logger.info("Creando transacción - Orden: {}, Monto: {}",
				request.getBuyOrder(), request.getAmount());
		return paymentGateway.create(request);
	}
	public CommitTransactionResponse commitTransaction(CommitTransactionRequest request) {
		logger.info("Confirmando transacción - Token: {}", request.getToken());
		return paymentGateway.commit(request);
	}

	/**
	 * Consulta el estado de una transacción
	 */
	public GetStatusResponse getTransactionStatus(GetStatusRequest request) {
		logger.info("Consultando estado - Token: {}", request.getToken());
		return paymentGateway.status(request);
	}

	/**
	 * Reembolsa una transacción (amount null = reembolso completo)
	 */
	public RefundTransactionResponse refundTransaction(RefundTransactionRequest request) {
		logger.info("Reembolsando - Token: {}", request.getToken());
		return paymentGateway.refund(request);
	}

	/**
	 * Extrae el número de tarjeta de forma segura
	 * La SDK real puede tener el cardNumber en diferentes estructuras.
	 * Intentamos acceder a él de varias formas para asegurar compatibilidad.
	 */
	private String extractCardNumber(Object output) {
		try {
			// Intentar obtener el número de tarjeta directamente
			// Primero intentamos si tiene getCardNumber()
			var method = output.getClass().getMethod("getCardNumber");
			Object cardNum = method.invoke(output);
			if (cardNum != null) {
				return maskCardNumber(cardNum.toString());
			}
		} catch (Exception e) {
			logger.debug("getCardNumber() no disponible, intentando CardDetail");
		}

		try {
			// Si no, intentamos getCardDetail().getCardNumber()
			var method = output.getClass().getMethod("getCardDetail");
			Object cardDetail = method.invoke(output);
			if (cardDetail != null) {
				var cardNumMethod = cardDetail.getClass().getMethod("getCardNumber");
				Object cardNum = cardNumMethod.invoke(cardDetail);
				if (cardNum != null) {
					return maskCardNumber(cardNum.toString());
				}
			}
		} catch (Exception e) {
			logger.debug("CardDetail no disponible");
		}

		// Si nada funciona, retornar valor por defecto
		return "****";
	}

	/**
	 * Enmascara el número de tarjeta (muestra solo últimos 4 dígitos)
	 */
	private String maskCardNumber(String cardNumber) {
		if (cardNumber == null || cardNumber.length() < 4) {
			return "****";
		}
		return "****" + cardNumber.substring(cardNumber.length() - 4);
	}
}
