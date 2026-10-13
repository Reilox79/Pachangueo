package com.pachangueo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Arranque de Pachangueo: sirve la PWA de static/ y la API REST bajo /api. */
@SpringBootApplication
public class PachangueoApplication {

    public static void main(String[] args) {
        SpringApplication.run(PachangueoApplication.class, args);
    }
}
