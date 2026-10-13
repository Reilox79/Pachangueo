package com.pachangueo.api;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** Convierte las excepciones de la API en respuestas JSON con el mensaje en español. */
@RestControllerAdvice
public class ManejadorErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorErrores.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorRespuesta> datosNoValidos(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> campos.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new ErrorRespuesta("Revisa los datos del formulario.", campos));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ErrorRespuesta> cuerpoIlegible(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(new ErrorRespuesta("Los datos enviados no tienen el formato correcto."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErrorRespuesta> noEncontrado(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorRespuesta("No existe esa dirección."));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ErrorRespuesta> metodoNoPermitido(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new ErrorRespuesta("Esa operación no está permitida aquí."));
    }

    /** Errores de negocio lanzados por los servicios: su motivo ya va en español. */
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ErrorRespuesta> conEstado(ResponseStatusException ex) {
        String mensaje = ex.getReason() != null ? ex.getReason() : "No se ha podido completar la operación.";
        return ResponseEntity.status(ex.getStatusCode()).body(new ErrorRespuesta(mensaje));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorRespuesta> inesperado(Exception ex) {
        log.error("Error no controlado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorRespuesta("Ha habido un error en el servidor. Inténtalo de nuevo más tarde."));
    }
}
