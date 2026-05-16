package com.webpaytest.api.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping; // Añadido para soportar el Health Check
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import com.webpaytest.api.dto.ApiResponse;
import com.webpaytest.api.dto.CreateTransactionRequest;
import com.webpaytest.api.dto.CreateTransactionResponse;
import com.webpaytest.api.dto.CommitTransactionRequest;
import com.webpaytest.api.dto.CommitTransactionResponse;
import com.webpaytest.api.dto.GetStatusRequest;
import com.webpaytest.api.dto.GetStatusResponse;
import com.webpaytest.api.dto.RefundTransactionRequest;
import com.webpaytest.api.dto.RefundTransactionResponse;
import com.webpaytest.api.service.WebpayService;

import java.util.HashMap; // Añadido para estructurar la respuesta limpia
import java.util.Map;     // Añadido para estructurar la respuesta limpia

/**
 * Rest para operaciones de Webpay Plus
 *
 * Expone los siguientes endpoints:
 * - POST /java/create: Crear transacción
 * - POST /java/commit: Confirmar transacción
 * - POST /java/status: Consultar estado
 * - POST /java/refund: Reembolsar transacción
 *
 * Todos los endpoints validan las requests y retornan
 * respuestas JSON consistentes.
 */
@RestController
@RequestMapping("/java")
@Validated
public class WebpayController {

    private static final Logger logger = LoggerFactory.getLogger(WebpayController.class);

    private final WebpayService webpayService;

    public WebpayController(WebpayService webpayService) {
        this.webpayService = webpayService;
    }

    /**
     * Crea una nueva transacción de Webpay
     *
     * Endpoint: POST /java/create
     *
     * Request JSON:
     * {
     * "amount": 50000,
     * "buyOrder": "ORD-001",
     * "sessionId": "sesion-001",
     * "returnUrl": "http://localhost:3000/return"
     * }
     *
     * Response (201 Created):
     * {
     * "success": true,
     * "message": "Transacción creada exitosamente",
     * "data": {
     * "token": "01928372ee1a2d9e",
     * "url": "https://webpay3gplus.transbank.cl/webpayplus/initTransaction",
     * "buyOrder": "ORD-001",
     * "sessionId": "sesion-001"
     * }
     * }
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CreateTransactionResponse>> createTransaction(
            @Valid @RequestBody CreateTransactionRequest request) {
        logger.info("Request para crear transacción recibida");

        CreateTransactionResponse data = webpayService.createTransaction(request);

        ApiResponse<CreateTransactionResponse> response = ApiResponse.success(
                data,
                "Transacción creada exitosamente");

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Confirma una transacción de Webpay
     *
     * Endpoint: POST /java/commit
     *
     * Se llamaría después de que el usuario retorna de Webpay
     * con el token en la URL (query param).
     *
     * Request JSON:
     * {
     * "token": "01928372ee1a2d9e"
     * }
     *
     * Response (200 OK):
     * {
     * "success": true,
     * "message": "Transacción confirmada exitosamente",
     * "data": {
     * "buyOrder": "ORD-001",
     * "cardNumber": "****6623",
     * "authorizationCode": "123456",
     * "paymentTypeCode": "VD",
     * "responseCode": 0,
     * "amount": "50000",
     * "status": "AUTHORIZED",
     * "installmentsNumber": null,
     * "installmentsAmount": null
     * }
     * }
     */
    @PostMapping("/commit")
    public ResponseEntity<ApiResponse<CommitTransactionResponse>> commitTransaction(
            @Valid @RequestBody CommitTransactionRequest request) {
        logger.info("Request para confirmar transacción recibida");

        CommitTransactionResponse data = webpayService.commitTransaction(request);

        ApiResponse<CommitTransactionResponse> response = ApiResponse.success(
                data,
                "Transacción confirmada exitosamente");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Consulta el estado de una transacción
     *
     * Endpoint: POST /java/status
     *
     * Request JSON:
     * {
     * "token": "01928372ee1a2d9e"
     * }
     *
     * Response (200 OK):
     * {
     * "success": true,
     * "message": "Estado consultado exitosamente",
     * "data": {
     * "buyOrder": "ORD-001",
     * "cardNumber": "****6623",
     * "authorizationCode": "123456",
     * "paymentTypeCode": "VD",
     * "responseCode": 0,
     * "status": "AUTHORIZED",
     * "installmentsNumber": null,
     * "installmentsAmount": null
     * }
     * }
     */
    @PostMapping("/status")
    public ResponseEntity<ApiResponse<GetStatusResponse>> getTransactionStatus(
            @Valid @RequestBody GetStatusRequest request) {
        logger.info("Request para consultar estado recibida");

        GetStatusResponse data = webpayService.getTransactionStatus(request);

        ApiResponse<GetStatusResponse> response = ApiResponse.success(
                data,
                "Estado consultado exitosamente");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Reembolsa o anula una transacción
     *
     * Endpoint: POST /java/refund
     *
     * Request JSON:
     * {
     * "token": "01928372ee1a2d9e"
     * }
     *
     * Response (200 OK):
     * {
     * "success": true,
     * "message": "Transacción reembolsada exitosamente",
     * "data": {
     * "type": "REFUND",
     * "token": "01928372ee1a2d9e",
     * "refundedAmount": 50000,
     * "balance": 0,
     * "status": "REFUNDED"
     * }
     * }
     */
    @PostMapping("/refund")
    public ResponseEntity<ApiResponse<RefundTransactionResponse>> refundTransaction(
            @Valid @RequestBody RefundTransactionRequest request) {
        logger.info("Request para reembolsar transacción recibida");

        RefundTransactionResponse data = webpayService.refundTransaction(request);

        ApiResponse<RefundTransactionResponse> response = ApiResponse.success(
                data,
                "Transacción reembolsada exitosamente");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Comprobación de estado para el Application Load Balancer de AWS
     *
     * Endpoint: GET /java/health
     *
     * Response (200 OK):
     * {
     * "status": "UP"
     * }
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        logger.debug("Health check invocado por el balanceador de carga");
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        return ResponseEntity.ok(status);
    }
}
