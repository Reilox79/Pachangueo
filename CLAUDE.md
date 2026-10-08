# Pachangueo

PWA para organizar partidos de fútbol (F7 y F11) y encontrar jugadores de la zona. Proyecto Intermodular de 2º DAW.

- Stack decidido: PWA en HTML, CSS y JS sin framework · Spring Boot · Oracle · Leaflet + OpenStreetMap. Lo pendiente está en el Backlog.
- Aún no hay código: solo documentos del curso en la raíz. Las decisiones de diseño compartidas con el equipo están en [DecisionesDiseno.md](DecisionesDiseno.md).
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
- No hagas commit de secretos (contraseñas de Oracle, claves JWT o VAPID, `application-local.properties`).
- Haz commit y `git push` a `main` al terminar cada parte del proceso.
- Ejecuta `git` siempre desde esta carpeta: `C:\Users\farri` es otro repo (con remoto de CoTasking) y no se toca.
- Nunca guardes ni escribas contraseñas (sudo, BD). Si hace falta sudo, dale al usuario el comando para que lo ejecute él.
- Los comandos de arranque y tests se añadirán aquí cuando exista el esqueleto del proyecto.
