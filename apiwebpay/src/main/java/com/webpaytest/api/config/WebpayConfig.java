package com.webpaytest.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import cl.transbank.common.IntegrationType;
import cl.transbank.webpay.common.WebpayOptions;
import cl.transbank.webpay.webpayplus.WebpayPlus;

/**
 * Configuración de Webpay Plus de Transbank
 *
 * Esta clase configura la SDK REAL de Transbank 6.1.0
 * Usa la clase WebpayOptions que es la forma CORRECTA de inicializar.
 *
 * Imports REALES y correctos:
 * - cl.transbank.common.IntegrationType
 * - cl.transbank.webpay.common.WebpayOptions
 * - cl.transbank.webpay.webpayplus.WebpayPlus
 *
 * Credenciales de Integración:
 * - Commerce Code: 597055555532
 * - API Key: 579B532A7440BB0C9079DED94D31EA1615BACEB7
 */
@Configuration
public class WebpayConfig {

	private static final Logger logger = LoggerFactory.getLogger(WebpayConfig.class);

	@Value("${transbank.commerce.code}")
	private String commerceCode;

	@Value("${transbank.api.key}")
	private String apiKey;

	@Value("${transbank.environment}")
	private String environment;

	/**
	 * Bean que retorna la transacción de Webpay Plus configurada
	 *
	 * Usa WebpayOptions que es LA FORMA CORRECTA en SDK 6.1.0
	 * IntegrationType.TEST = Ambiente de integración/pruebas
	 * IntegrationType.LIVE = Ambiente de producción
	 */
	@Bean
	public WebpayPlus.Transaction webpayTransaction() {
		logger.info("Inicializando Webpay Plus con Commerce Code: {}", commerceCode);
		logger.info("Ambiente: {}", environment);

		IntegrationType integrationType;
		if ("PRODUCTION".equalsIgnoreCase(environment) || "LIVE".equalsIgnoreCase(environment)) {
			integrationType = IntegrationType.LIVE;
		} else {
			integrationType = IntegrationType.TEST;
		}

		// Crear WebpayOptions con las credenciales
		WebpayOptions options = new WebpayOptions(
				commerceCode,
				apiKey,
				integrationType
		);

		// Crear la transacción con las opciones
		WebpayPlus.Transaction transaction = new WebpayPlus.Transaction(options);

		logger.info("Webpay Plus Transaction bean creado exitosamente con IntegrationType: {}", integrationType);
		return transaction;
	}
}
