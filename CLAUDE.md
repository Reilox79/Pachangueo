# Pachangueo

PWA para organizar partidos de fútbol (F7 y F11) y encontrar jugadores de la zona. Proyecto Intermodular de 2º DAW.

- Stack: PWA en HTML, CSS y JS sin framework servida desde `static/` · Spring Boot con Java 21 y Maven · MySQL en el servidor doméstico del usuario (cliente DBeaver) · Flyway · sesión de Spring Security · mapa con MapLibre GL + OpenFreeMap.
- Hay un prototipo PWA estático en `src/main/resources/static/` (datos de ejemplo en `datos/demo.json`, reglas en `js/datos.js`). Aún no hay backend: el proyecto Maven irá en la raíz del repo. Se arranca con `jwebserver -d src/main/resources/static -p 8000` (configuración `pwa-estatica` en `.claude/launch.json`, que no se sube).
- Maqueta: https://www.figma.com/design/4gB4RLpy8DBXpSIX90t0Be. Los colores de `css/estilos.css` son sus variables; si cambia la paleta, cambia los dos.
- Las decisiones de diseño compartidas con el equipo están en [DecisionesDiseno.md](DecisionesDiseno.md).
- Ciudad de prueba: Toledo.

## Vault de Obsidian

Está en `C:\Users\farri\Desktop\Programacion\Obsidian\Pachangueo` y es la memoria del proyecto. Se lee y se escribe editando los `.md` directamente (no uses el core de claude-obsidian ni WSL).

**Al arrancar** lee solo estos dos archivos:
- `wiki/Backlog.md`: qué hay que hacer. Sigue la entrada EN CURSO o, si no hay, la primera LISTA. No empieces nada que no esté LISTA; si faltan decisiones, pregúntalas y apúntalas en la entrada.
- `wiki/hot.md`: qué pasó hace poco.

Lo demás (`wiki/concepts/`, `wiki/entities/`, `wiki/index.md`) léelo solo cuando la tarea lo toque.

**Tras cada cambio que llegue a commit**, en la misma sesión:
1. `wiki/Backlog.md`: estado de la entrada, fecha y commit.
2. `wiki/hot.md`: reescribe "Último cambio", "Siguiente" y "Estado". Máximo unas 30 líneas; el detalle va a una página de `wiki/sessions/`.
3. Las páginas de concepto o entidad afectadas (requisitos, reglas de negocio, interfaz, modelo de datos, stack, fases, backend, frontend).
4. `wiki/log.md`: una entrada nueva arriba.
5. Si hubo decisiones del usuario, una página `wiki/sessions/AAAA-MM-DD Título.md` enlazada desde `wiki/index.md`. Si son de diseño, apúntalas también en `DecisionesDiseno.md`.

Cada página lleva frontmatter con `updated:` al día. El vault tiene su propio git local: haz commit allí también. El flujo completo está en `wiki/concepts/Flujo de trabajo.md`.

## Normas de trabajo

- Fase actual: **Fase 2, diseño de la aplicación** (ver `wiki/concepts/Fases del proyecto.md`).
- Antes de empezar cualquier idea, plantea en el chat el plan y su viabilidad, corto, y espera a que el usuario lo apruebe.
- Pide permiso antes de hacer cambios grandes en el código o en la estructura del repo.
- Todos los textos de la app y los mensajes de error del backend van en español.
- No hagas commit de secretos (contraseña de MySQL, claves VAPID, `application-local.properties`).
- Cualquier cambio en las entidades JPA necesita una migración Flyway nueva (`Vn__...sql`). Nunca edites una migración ya aplicada.
- Login con sesión de Spring Security: cookie `HttpOnly`, `Secure`, `SameSite=Lax`, CSRF activo y BCrypt. Nada de tokens en `localStorage`.
- Haz commit y `git push` a `main` al terminar cada parte del proceso.
- Ejecuta `git` siempre desde esta carpeta: `C:\Users\farri` es otro repo (con remoto de CoTasking) y no se toca.
- Nunca guardes ni escribas contraseñas (sudo, BD). Si hace falta sudo, dale al usuario el comando para que lo ejecute él.
- Todo texto que venga de datos o del usuario se mete en el HTML con `esc()` de `js/util.js`.
- Si cambias archivos de la PWA que estén en la lista `APP` de `sw.js`, sube `VERSION` para que los móviles instalados se actualicen.
- Los comandos del backend y sus tests se añadirán aquí cuando exista el esqueleto (#5).
