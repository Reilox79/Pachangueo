package com.pachangueo;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Cookies contra el servidor de verdad (MockMvc cambia el almacén del token CSRF y no sirve aquí):
 * XSRF-TOKEN legible por la PWA, y la cookie de sesión HttpOnly, Secure y SameSite=Lax.
 */
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(CookiesTest.SesionDePrueba.class)
class CookiesTest {

    /** Solo para este test: una ruta abierta que crea sesión, para ver cómo sale la cookie JSESSIONID. */
    @TestConfiguration
    @RestController
    static class SesionDePrueba {

        @Bean
        @Order(0)
        SecurityFilterChain soloPrueba(HttpSecurity http) throws Exception {
            return http.securityMatcher("/prueba/**").authorizeHttpRequests(p -> p.anyRequest().permitAll()).build();
        }

        @GetMapping("/prueba/sesion")
        String crearSesion(HttpServletRequest peticion) {
            peticion.getSession(true);
            return "ok";
        }
    }

    @LocalServerPort
    int puerto;

    private List<String> cookiesDe(String ruta) throws Exception {
        HttpResponse<String> r;
        try (HttpClient cliente = HttpClient.newHttpClient()) {
            r = cliente.send(HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + ruta)).build(),
                HttpResponse.BodyHandlers.ofString());
        }
        assertThat(r.statusCode()).isEqualTo(200);
        return r.headers().allValues("Set-Cookie");
    }

    @Test
    void elTokenCsrfVaEnUnaCookieLegible() throws Exception {
        assertThat(cookiesDe("/api/csrf"))
            .anySatisfy(c -> assertThat(c).startsWith("XSRF-TOKEN=").doesNotContainIgnoringCase("HttpOnly"));
    }

    @Test
    void laCookieDeSesionEsHttpOnlySecureYLax() throws Exception {
        List<String> cookies = cookiesDe("/prueba/sesion");
        assertThat(cookies).anySatisfy(c -> assertThat(c)
            .startsWith("JSESSIONID=")
            .containsIgnoringCase("HttpOnly")
            .containsIgnoringCase("Secure")
            .containsIgnoringCase("SameSite=Lax"));
    }
}
