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
        
        // Permitir explícitamente el origen de tu frontend
        config.setAllowedOrigins(Arrays.asList("http://nicolasmendez.cl", "https://nicolasmendez.cl"));
        
        // Métodos permitidos, incluyendo explícitamente OPTIONS para el preflight
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Cabeceras comunes que tu fetch de JS enviará
        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"));
        
        // Permitir credenciales si a futuro envías cookies o auth headers
        config.setAllowCredentials(true);
        
        // Mantener la respuesta preflight en caché del navegador por 1 hora
        config.setMaxAge(3600L);

        // Registrar la configuración para absolutamente todas las rutas
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
