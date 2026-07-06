package com.webpaytest.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir TODOS los orígenes (el @CrossOrigin en el controller también se aplica)
        config.setAllowedOriginPatterns("*");
        
        // Métodos permitidos, incluyendo explícitamente OPTIONS para el preflight
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Permitir TODAS las cabeceras
        config.setAllowedHeaders("*");
        
        // Exponer cabeceras de respuesta importantes
        config.setExposedHeaders(Arrays.asList("Content-Type", "Authorization", "X-Total-Count"));
        
        // Permitir credenciales
        config.setAllowCredentials(true);
        
        // Mantener la respuesta preflight en caché del navegador por 1 hora
        config.setMaxAge(3600L);

        // Registrar la configuración para absolutamente todas las rutas
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
