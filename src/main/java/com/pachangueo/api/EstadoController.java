package com.pachangueo.api;

import java.util.Map;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints públicos para comprobar que el servidor responde y preparar el token CSRF. */
@RestController
@RequestMapping("/api")
public class EstadoController {

    @GetMapping("/estado")
    Map<String, String> estado() {
        return Map.of("estado", "ok", "aplicacion", "Pachangueo");
    }

    /**
     * La PWA lo llama al arrancar: así el servidor escribe la cookie XSRF-TOKEN
     * y las peticiones POST, PUT y DELETE siguientes pueden llevar la cabecera X-XSRF-TOKEN.
     */
    @GetMapping("/csrf")
    Map<String, String> csrf(CsrfToken token) {
        return Map.of("cabecera", token.getHeaderName());
    }
}
