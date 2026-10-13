package com.pachangueo.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfException;

/**
 * Seguridad de la aplicación (ver DecisionesDiseno.md §1):
 * sesión de Spring Security con cookie HttpOnly, Secure y SameSite=Lax (en application.properties),
 * CSRF activo con el token en la cookie XSRF-TOKEN para que la PWA lo devuelva en la cabecera X-XSRF-TOKEN,
 * y contraseñas con BCrypt. Nada de tokens en localStorage.
 */
@Configuration
public class SeguridadConfig {

    /** Archivos de la PWA: se sirven sin sesión. */
    private static final String[] PWA = {
        "/", "/index.html", "/manifest.webmanifest", "/sw.js", "/favicon.ico",
        "/css/**", "/js/**", "/iconos/**", "/datos/**",
    };

    @Bean
    SecurityFilterChain seguridad(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(peticiones -> peticiones
                .requestMatchers(PWA).permitAll()
                .requestMatchers("/api/estado", "/api/csrf", "/error").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll())
            // Cookie XSRF-TOKEN legible por JavaScript y token en la cabecera X-XSRF-TOKEN.
            .csrf(csrf -> csrf.spa())
            .exceptionHandling(errores -> errores
                .authenticationEntryPoint((peticion, respuesta, ex) ->
                    escribirError(respuesta, HttpServletResponse.SC_UNAUTHORIZED, "Tienes que iniciar sesión."))
                .accessDeniedHandler((peticion, respuesta, ex) ->
                    escribirError(respuesta, HttpServletResponse.SC_FORBIDDEN, ex instanceof CsrfException
                        ? "La petición no lleva un token CSRF válido. Recarga la página e inténtalo de nuevo."
                        : "No tienes permiso para hacer esto.")))
            // El inicio de sesión lo hará un endpoint propio de la API cuando existan los usuarios.
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout.disable());
        return http.build();
    }

    @Bean
    PasswordEncoder codificadorContrasenas() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Sin usuarios todavía: evita que Spring cree uno de prueba con la contraseña en el log.
     * Se sustituirá por el que lea la tabla de usuarios.
     */
    @Bean
    UserDetailsService usuarios() {
        return new InMemoryUserDetailsManager();
    }

    /** Respuesta de error en JSON con el mismo formato que ManejadorErrores. */
    private static void escribirError(HttpServletResponse respuesta, int estado, String mensaje) throws IOException {
        respuesta.setStatus(estado);
        respuesta.setContentType(MediaType.APPLICATION_JSON_VALUE);
        respuesta.setCharacterEncoding(StandardCharsets.UTF_8.name());
        respuesta.getWriter().write("{\"mensaje\":\"" + mensaje.replace("\"", "\\\"") + "\"}");
    }
}
