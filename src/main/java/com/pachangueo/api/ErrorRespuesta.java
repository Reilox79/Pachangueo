package com.pachangueo.api;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Cuerpo de todas las respuestas de error de la API.
 * mensaje: texto en español para enseñar al usuario. campos: errores por campo del formulario, si los hay.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ErrorRespuesta(String mensaje, Map<String, String> campos) {

    public ErrorRespuesta(String mensaje) {
        this(mensaje, Map.of());
    }
}
