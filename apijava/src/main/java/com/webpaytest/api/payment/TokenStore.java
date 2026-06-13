package com.webpaytest.api.payment;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Almacenamiento en memoria para mapear preference_id (token)
 * con payment_id cuando esté disponible. Stateless entre reinicios.
 */
public class TokenStore {
    private final Map<String, String> preferenceToPayment = new ConcurrentHashMap<>();

    public void put(String preferenceId, String paymentId) {
        if (preferenceId != null && paymentId != null) {
            preferenceToPayment.put(preferenceId, paymentId);
        }
    }

    public Optional<String> getPaymentId(String preferenceId) {
        return Optional.ofNullable(preferenceToPayment.get(preferenceId));
    }
}
