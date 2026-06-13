package com.webpaytest.api.config;

import cl.transbank.webpay.webpayplus.WebpayPlus;
import com.webpaytest.api.payment.MercadoPagoGateway;
import com.webpaytest.api.payment.PaymentGateway;
import com.webpaytest.api.payment.TokenStore;
import com.webpaytest.api.payment.WebpayGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentProviderConfig {
    private static final Logger logger = LoggerFactory.getLogger(PaymentProviderConfig.class);

    @Value("${payment.provider:WEBPAY}")
    private String provider;

    @Value("${mp.access.token:}")
    private String mpAccessToken;

    @Value("${mp.success.url:}")
    private String mpSuccessUrl;

    @Value("${mp.failure.url:}")
    private String mpFailureUrl;

    @Value("${mp.pending.url:}")
    private String mpPendingUrl;

    @Bean
    public TokenStore tokenStore() {
        return new TokenStore();
    }

    @Bean
    public PaymentGateway paymentGateway(WebpayPlus.Transaction webpayTransaction, TokenStore tokenStore) {
        String selected = provider == null ? "WEBPAY" : provider.trim().toUpperCase();
        logger.info("Inicializando PaymentGateway con proveedor={} ", selected);
        if ("MP".equals(selected) || "MERCADOPAGO".equals(selected)) {
            return new MercadoPagoGateway(mpAccessToken, mpSuccessUrl, mpFailureUrl, mpPendingUrl, tokenStore);
        }
        // default WEBPAY
        return new WebpayGateway(webpayTransaction);
    }
}
