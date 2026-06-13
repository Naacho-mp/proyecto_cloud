package com.webpaytest.api.payment;

import com.webpaytest.api.dto.*;

/**
 * Abstracción de pasarela de pagos para mantener los endpoints y DTOs existentes
 * mientras se permite cambiar el proveedor (Webpay o MercadoPago) por configuración.
 */
public interface PaymentGateway {
    CreateTransactionResponse create(CreateTransactionRequest request);
    CommitTransactionResponse commit(CommitTransactionRequest request);
    GetStatusResponse status(GetStatusRequest request);
    RefundTransactionResponse refund(RefundTransactionRequest request);
}
