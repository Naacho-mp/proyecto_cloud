package com.webpaytest.api.payment;

import cl.transbank.webpay.webpayplus.WebpayPlus;
import com.webpaytest.api.dto.*;
import com.webpaytest.api.exception.WebpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementación de PaymentGateway basada en Webpay (actual)
 */
public class WebpayGateway implements PaymentGateway {
    private static final Logger logger = LoggerFactory.getLogger(WebpayGateway.class);

    private final WebpayPlus.Transaction transaction;

    public WebpayGateway(WebpayPlus.Transaction transaction) {
        this.transaction = transaction;
    }

    @Override
    public CreateTransactionResponse create(CreateTransactionRequest request) {
        logger.info("[WEBPAY] Creando transacción - Orden: {}, Monto: {}", request.getBuyOrder(), request.getAmount());
        String originalReturnUrl = request.getReturnUrl();
        String forcedHttpReturnUrl = originalReturnUrl.replace("https://", "http://");
        try {
            var output = transaction.create(
                    request.getBuyOrder(),
                    request.getSessionId(),
                    request.getAmount(),
                    forcedHttpReturnUrl
            );
            return CreateTransactionResponse.builder()
                    .token(output.getToken())
                    .url(output.getUrl())
                    .buyOrder(request.getBuyOrder())
                    .sessionId(request.getSessionId())
                    .build();
        } catch (Exception ex) {
            logger.error("[WEBPAY] Error al crear: {}", ex.getMessage(), ex);
            throw new WebpayException("Error al crear: " + ex.getMessage(), "CREATE_ERROR");
        }
    }

    @Override
    public CommitTransactionResponse commit(CommitTransactionRequest request) {
        logger.info("[WEBPAY] Confirmando transacción - Token: {}", request.getToken());
        try {
            var output = transaction.commit(request.getToken());
            String cardNumber = extractCardNumber(output);
            return CommitTransactionResponse.builder()
                    .buyOrder(output.getBuyOrder())
                    .cardNumber(cardNumber)
                    .authorizationCode(output.getAuthorizationCode())
                    .paymentTypeCode(output.getPaymentTypeCode())
                    .responseCode((int) output.getResponseCode())
                    .amount(String.valueOf(output.getAmount()))
                    .status(output.getStatus())
                    .installmentsNumber(String.valueOf(output.getInstallmentsNumber()))
                    .installmentsAmount(String.valueOf(output.getInstallmentsAmount()))
                    .build();
        } catch (Exception ex) {
            String errorMsg = ex.getMessage();
            logger.error("[WEBPAY] Error al confirmar: {}", errorMsg, ex);
            if (errorMsg != null && (errorMsg.contains("already locked") || errorMsg.contains("Transaction already") || errorMsg.contains("422"))) {
                throw new WebpayException(
                        "Esta transacción ya fue procesada. No se puede confirmar dos veces.",
                        "TRANSACTION_ALREADY_LOCKED",
                        422);
            }
            throw new WebpayException("Error al confirmar: " + errorMsg, "COMMIT_ERROR", 400);
        }
    }

    @Override
    public GetStatusResponse status(GetStatusRequest request) {
        logger.info("[WEBPAY] Consultando estado - Token: {}", request.getToken());
        try {
            var output = transaction.status(request.getToken());
            String cardNumber = extractCardNumber(output);
            return GetStatusResponse.builder()
                    .buyOrder(output.getBuyOrder())
                    .cardNumber(cardNumber)
                    .authorizationCode(output.getAuthorizationCode())
                    .paymentTypeCode(output.getPaymentTypeCode())
                    .responseCode((int) output.getResponseCode())
                    .status(output.getStatus())
                    .installmentsNumber(String.valueOf(output.getInstallmentsNumber()))
                    .installmentsAmount(String.valueOf(output.getInstallmentsAmount()))
                    .build();
        } catch (Exception ex) {
            logger.error("[WEBPAY] Error al consultar: {}", ex.getMessage(), ex);
            throw new WebpayException("Error al consultar: " + ex.getMessage(), "STATUS_ERROR");
        }
    }

    @Override
    public RefundTransactionResponse refund(RefundTransactionRequest request) {
        logger.info("[WEBPAY] Reembolsando - Token: {}", request.getToken());
        try {
            var output = transaction.refund(request.getToken(), 0d);
            return RefundTransactionResponse.builder()
                    .type(output.getType())
                    .token(request.getToken())
                    .refundedAmount((long) output.getNullifiedAmount())
                    .balance((int) output.getBalance())
                    .status(output.getResponseCode() == 0 ? "REFUNDED" : "FAILED")
                    .build();
        } catch (Exception ex) {
            logger.error("[WEBPAY] Error al reembolsar: {}", ex.getMessage(), ex);
            throw new WebpayException("Error al reembolsar: " + ex.getMessage(), "REFUND_ERROR");
        }
    }

    private String extractCardNumber(Object output) {
        try {
            var method = output.getClass().getMethod("getCardNumber");
            Object cardNum = method.invoke(output);
            if (cardNum != null) {
                return maskCardNumber(cardNum.toString());
            }
        } catch (Exception ignored) {}
        try {
            var method = output.getClass().getMethod("getCardDetail");
            Object cardDetail = method.invoke(output);
            if (cardDetail != null) {
                var cardNumMethod = cardDetail.getClass().getMethod("getCardNumber");
                Object cardNum = cardNumMethod.invoke(cardDetail);
                if (cardNum != null) {
                    return maskCardNumber(cardNum.toString());
                }
            }
        } catch (Exception ignored) {}
        return "****";
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "****";
        return "****" + cardNumber.substring(cardNumber.length() - 4);
    }
}
