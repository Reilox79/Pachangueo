package com.pachangueo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

/** Comprueba la configuración de seguridad del esqueleto: rutas abiertas y cerradas, CSRF, errores en español y BCrypt. */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class SeguridadTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    PasswordEncoder codificador;

    @Test
    void laPwaSeSirveSinSesion() throws Exception {
        mvc.perform(get("/index.html")).andExpect(status().isOk()).andExpect(content().string(containsString("Pachangueo")));
        mvc.perform(get("/js/app.js")).andExpect(status().isOk());
        mvc.perform(get("/manifest.webmanifest")).andExpect(status().isOk());
    }

    @Test
    void elEstadoEsPublico() throws Exception {
        mvc.perform(get("/api/estado"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("ok"));
    }

    @Test
    void laApiPideSesionConMensajeEnEspanol() throws Exception {
        mvc.perform(get("/api/partidos"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.mensaje").value("Tienes que iniciar sesión."));
    }

    @Test
    void conSesionLaRutaInexistenteDa404EnEspanol() throws Exception {
        mvc.perform(get("/api/no-existe").with(user("rafa")))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.mensaje").value("No existe esa dirección."));
    }

    @Test
    void sinTokenCsrfSeRechazaElPost() throws Exception {
        mvc.perform(post("/api/estado").with(user("rafa")))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.mensaje", containsString("token CSRF")));
    }

    @Test
    void conTokenCsrfElPostPasaLaSeguridad() throws Exception {
        // /api/estado solo admite GET: si llega al controlador, la seguridad ha dejado pasar el POST.
        mvc.perform(post("/api/estado").with(user("rafa")).with(csrf()))
            .andExpect(status().isMethodNotAllowed())
            .andExpect(jsonPath("$.mensaje").value("Esa operación no está permitida aquí."));
    }

    @Test
    void lasRutasDesconocidasFueraDeLaApiSeDeniegan() throws Exception {
        mvc.perform(get("/admin")).andExpect(status().isUnauthorized());
    }

    @Test
    void lasContrasenasSeGuardanConBcrypt() {
        String hash = codificador.encode("contraseña-larga");
        assertThat(hash).startsWith("$2");
        assertThat(codificador.matches("contraseña-larga", hash)).isTrue();
    }
}
