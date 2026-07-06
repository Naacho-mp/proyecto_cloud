
package com.webpaytest.api.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webpaytest.api.dto.*;
import com.webpaytest.api.exception.WebpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Implementación de PaymentGateway para MercadoPago respetando los DTOs y endpoints actuales.
 *
 * Notas:
 * - token = preference_id (create)
 * - url = init_point (create)
 * - Para commit/status/refund se necesita payment_id: se obtiene vía Merchant Orders
 */
public class MercadoPagoGateway implements PaymentGateway {
    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoGateway.class);

    private static final String MP_API_BASE = "https://api.mercadopago.com";

    private final String accessToken;
    private final String successUrl;
    private final String failureUrl;
    private final String pendingUrl;
    private final TokenStore tokenStore;

    private final HttpClient http;
    private final ObjectMapper mapper = new ObjectMapper();

    public MercadoPagoGateway(String accessToken,
                              String successUrl,  // Se mantiene en la firma pero se ignora el parámetro
                              String failureUrl,  // Se mantiene en la firma pero se ignora el parámetro
                              String pendingUrl,  // Se mantiene en la firma pero se ignora el parámetro
                              TokenStore tokenStore) {
        this.accessToken = accessToken;
        this.tokenStore = tokenStore;
        
        // URLs hardcodeadas directamente aquí
        this.successUrl = "http://nicolasmendez.cl/success";
        this.failureUrl = "http://nicolasmendez.cl/failure";
        this.pendingUrl = "http://nicolasmendez.cl/pending";
        
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .build();
    }

    @Override
    public CreateTransactionResponse create(CreateTransactionRequest request) {
        ensureConfigured();
        try {
            Map<String, Object> body = new HashMap<>();
            // Item mínimo para preference
            Map<String, Object> item = new HashMap<>();
            item.put("title", request.getBuyOrder());
            item.put("quantity", 1);
            item.put("currency_id", "CLP");
            item.put("unit_price", request.getAmount());
            body.put("items", new Object[]{ item });
            body.put("external_reference", request.getBuyOrder());

            Map<String, Object> payer = new HashMap<>();
            payer.put("email", request.getSessionId());
            body.put("payer", payer);

            Map<String, Object> backUrls = new HashMap<>();
            if (successUrl != null && !successUrl.isBlank()) {
                backUrls.put("success", successUrl);
                body.put("auto_return", "approved");   // Autorretorno activado para redirigir solo
            }
            if (failureUrl != null && !failureUrl.isBlank()) backUrls.put("failure", failureUrl);
            if (pendingUrl != null && !pendingUrl.isBlank()) backUrls.put("pending", pendingUrl);
            if (!backUrls.isEmpty()) body.put("back_urls", backUrls);

            String json = mapper.writeValueAsString(body);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(MP_API_BASE + "/checkout/preferences"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> resp = http.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 400) {
                throw new WebpayException("Error creando preferencia MP: HTTP " + resp.statusCode() + " - " + resp.body(), "CREATE_ERROR");
            }
            JsonNode node = mapper.readTree(resp.body());
            String preferenceId = node.path("id").asText();
            String initPoint = node.path("init_point").asText(null);
            if (initPoint == null || initPoint.isBlank()) initPoint = node.path("sandbox_init_point").asText("");

            logger.info("[MP] Preferencia creada preference_id={} url={}", preferenceId, initPoint);
            return CreateTransactionResponse.builder()
                    .token(preferenceId)
                    .url(initPoint)
                    .buyOrder(request.getBuyOrder())
                    .sessionId(request.getSessionId())
                    .build();
        } catch (WebpayException e) {
            throw e;
        } catch (Exception ex) {
            logger.error("[MP] Error al crear preferencia: {}", ex.getMessage(), ex);
            throw new WebpayException("Error al crear: " + ex.getMessage(), "CREATE_ERROR");
        }
    }

    @Override
    public CommitTransactionResponse commit(CommitTransactionRequest request) {
        ensureConfigured();
        try {
            String paymentId = resolvePaymentIdByPreference(request.getToken());
            if (paymentId == null) {
                throw new WebpayException("No se encontró un pago asociado al token (preference_id)", "COMMIT_ERROR", 400);
            }
            JsonNode payment = getPayment(paymentId);
            return mapPaymentToCommit(payment);
        } catch (WebpayException e) {
            throw e;
        } catch (Exception ex) {
            logger.error("[MP] Error al confirmar: {}", ex.getMessage(), ex);
            throw new WebpayException("Error al confirmar: " + ex.getMessage(), "COMMIT_ERROR", 400);
        }
    }

    @Override
    public GetStatusResponse status(GetStatusRequest request) {
        ensureConfigured();
        try {
            String paymentId = resolvePaymentIdByPreference(request.getToken());
            if (paymentId == null) {
                return GetStatusResponse.builder()
                        .buyOrder(null)
                        .cardNumber("****")
                        .authorizationCode(null)
                        .paymentTypeCode(null)
                        .responseCode(-1)
                        .status("PENDING")
                        .installmentsNumber(null)
                        .installmentsAmount(null)
                        .build();
            }
            JsonNode payment = getPayment(paymentId);
            return mapPaymentToStatus(payment);
        } catch (WebpayException e) {
            throw e;
        } catch (Exception ex) {
            logger.error("[MP] Error al consultar estado: {}", ex.getMessage(), ex);
            throw new WebpayException("Error al consultar: " + ex.getMessage(), "STATUS_ERROR");
        }
    }

    @Override
    public RefundTransactionResponse refund(RefundTransactionRequest request) {
        ensureConfigured();
        try {
            String paymentId = resolvePaymentIdByPreference(request.getToken());
            if (paymentId == null) {
                throw new WebpayException("No se encontró un pago asociado al token (preference_id)", "REFUND_ERROR");
            }
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(MP_API_BASE + "/v1/payments/" + paymentId + "/refunds"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString("{}", StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> resp = http.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 400) {
                throw new WebpayException("Error refund MP: HTTP " + resp.statusCode() + " - " + resp.body(), "REFUND_ERROR");
            }
            JsonNode refund = mapper.readTree(resp.body());
            long amount = refund.path("amount").asLong(0);
            return RefundTransactionResponse.builder()
                    .type("REFUND")
                    .token(request.getToken())
                    .refundedAmount(amount)
                    .balance(0)
                    .status("REFUNDED")
                    .build();
        } catch (WebpayException e) {
            throw e;
        } catch (Exception ex) {
            logger.error("[MP] Error al reembolsar: {}", ex.getMessage(), ex);
            throw new WebpayException("Error al reembolsar: " + ex.getMessage(), "REFUND_ERROR");
        }
    }

    private void ensureConfigured() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new WebpayException("MP_ACCESS_TOKEN no configurado", "CONFIG_ERROR", 500);
        }
    }

    private String resolvePaymentIdByPreference(String preferenceId) throws Exception {
        if (preferenceId == null) return null;
        var cached = tokenStore.getPaymentId(preferenceId);
        if (cached.isPresent()) return cached.get();
        
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(MP_API_BASE + "/merchant_orders?preference_id=" + preferenceId))
                .timeout(Duration.ofSeconds(25))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 400) {
            logger.warn("[MP] merchant_orders error HTTP {} - {}", resp.statusCode(), resp.body());
            return null;
        }
        JsonNode n = mapper.readTree(resp.body());
        if (!n.isArray() || n.size() == 0) return null;
        JsonNode mo = n.get(0);
        JsonNode payments = mo.path("payments");
        if (payments.isArray() && payments.size() > 0) {
            String pid = payments.get(0).path("id").asText(null);
            if (pid != null) tokenStore.put(preferenceId, pid);
            return pid;
        }
        return null;
    }

    private JsonNode getPayment(String paymentId) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(MP_API_BASE + "/v1/payments/" + paymentId))
                .timeout(Duration.ofSeconds(25))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 400) {
            throw new WebpayException("Error obteniendo payment: HTTP " + resp.statusCode() + " - " + resp.body(), "STATUS_ERROR");
        }
        return mapper.readTree(resp.body());
    }

    private CommitTransactionResponse mapPaymentToCommit(JsonNode p) {
        MappedPayment m = mapPaymentCommon(p);
        return CommitTransactionResponse.builder()
                .buyOrder(m.buyOrder)
                .cardNumber(m.cardMasked)
                .authorizationCode(m.authorizationCode)
                .paymentTypeCode(m.paymentType)
                .responseCode(m.responseCode)
                .amount(m.amountStr)
                .status(m.status)
                .installmentsNumber(m.installments)
                .installmentsAmount(m.installmentsAmount)
                .build();
    }

    private GetStatusResponse mapPaymentToStatus(JsonNode p) {
        MappedPayment m = mapPaymentCommon(p);
        return GetStatusResponse.builder()
                .buyOrder(m.buyOrder)
                .cardNumber(m.cardMasked)
                .authorizationCode(m.authorizationCode)
                .paymentTypeCode(m.paymentType)
                .responseCode(m.responseCode)
                .status(m.status)
                .installmentsNumber(m.installments)
                .installmentsAmount(m.installmentsAmount)
                .build();
    }

    private MappedPayment mapPaymentCommon(JsonNode p) {
        String status = p.path("status").asText("");
        String mappedStatus;
        int responseCode;
        switch (status) {
            case "approved":
                mappedStatus = "AUTHORIZED";
                responseCode = 0;
                break;
            case "in_process":
            case "pending":
                mappedStatus = "PENDING";
                responseCode = -1;
                break;
            default:
                mappedStatus = "FAILED";
                responseCode = 1;
        }
        String lastFour = p.path("card").path("last_four_digits").asText("");
        String cardMasked = (lastFour.isBlank() ? "****" : ("****" + lastFour));
        String authorization = p.path("authorization_code").asText(null);
        String paymentType = p.path("payment_type_id").asText(null);
        String amountStr = String.valueOf(p.path("transaction_amount").asDouble(0));
        String installments = p.path("installments").isMissingNode() ? null : p.path("installments").asText();
        String installmentAmount = null;
        if (p.path("transaction_details").has("installment_amount")) {
            installmentAmount = String.valueOf(p.path("transaction_details").path("installment_amount").asDouble());
        }
        String externalRef = p.path("external_reference").asText(null);
        return new MappedPayment(externalRef, cardMasked, authorization, paymentType, responseCode, amountStr, mappedStatus, installments, installmentAmount);
    }

    private static class MappedPayment {
        final String buyOrder;
        final String cardMasked;
        final String authorizationCode;
        final String paymentType;
        final int responseCode;
        final String amountStr;
        final String status;
        final String installments;
        final String installmentsAmount;
        MappedPayment(String buyOrder, String cardMasked, String authorizationCode, String paymentType, int responseCode, String amountStr, String status, String installments, String installmentsAmount) {
            this.buyOrder = buyOrder;
            this.cardMasked = cardMasked;
            this.authorizationCode = authorizationCode;
            this.paymentType = paymentType;
            this.responseCode = responseCode;
            this.amountStr = amountStr;
            this.status = status;
            this.installments = installments;
            this.installmentsAmount = installmentsAmount;
        }
    }
}

