# Pendiente de pasar al vault de Obsidian

Las sesiones de Claude Code en la nube no llegan al vault (`C:\Users\farri\Desktop\Programacion\Obsidian\Pachangueo`). Lo que habría que haber escrito en él se apunta aquí, y la siguiente sesión local lo pasa al vault.

## Para el agente de la sesión local

1. Lee este archivo entero y después `wiki/Backlog.md` y `wiki/hot.md` del vault, como siempre.
2. Por cada entrada de "Sesiones pendientes", de la más antigua a la más reciente, haz los pasos de "Tras cada cambio que llegue a commit" del `CLAUDE.md`:
   - `wiki/Backlog.md`: estado, fecha y commit de la entrada.
   - `wiki/hot.md`: "Último cambio", "Siguiente" y "Estado" (máximo unas 30 líneas).
   - Páginas de concepto o entidad afectadas.
   - `wiki/log.md`: una entrada nueva arriba.
   - Si hubo decisiones del usuario, `wiki/sessions/AAAA-MM-DD Título.md` enlazada desde `wiki/index.md` (y en `DecisionesDiseno.md` si son de diseño).
   - `updated:` al día en el frontmatter de cada página tocada.
3. Comprueba con `git log` que los commits citados están en `main`. Si una rama de la nube no se ha fusionado todavía, díselo al usuario antes de marcar nada como HECHO.
4. Haz commit en el git local del vault.
5. Borra de este archivo las entradas ya pasadas (deja la plantilla) y haz commit en el repo.

## Sesiones pendientes

### 2026-10-09 · Sesión en la nube: conexión y traspaso

- **Rama:** `claude/obsidian-vault-docs-dt1k4q` (sale de `main` en `0d24105`).
- **Qué se hizo:**
  - Se leyó el repo desde GitHub. No hay issues ni pull requests abiertos; el backlog solo está en el vault.
  - Se creó este archivo, `PendienteObsidian.md`, para traspasar al vault lo que se haga en sesiones en la nube.
- **Estado del repo que encontró la sesión:**
  - Último commit en `main`: `0d24105` "Prototipo PWA del mapa estilo Pokémon GO con datos de ejemplo de Toledo".
  - Prototipo PWA en `src/main/resources/static/` (`sw.js` en `VERSION = 'pachangueo-v1'`). Sin backend todavía.
  - `DecisionesDiseno.md` §8 tiene cuatro reglas del prototipo por confirmar antes del backend (F11 no en pista F7; jugadores entre 2 y 30 con valores por defecto F7 10-14 y F11 18-22; el organizador no puede darse de baja; partidos que se tocan no se solapan).
- **Para el vault:**
  - `wiki/log.md`: entrada "2026-10-09 · Sesión en la nube; se crea `PendienteObsidian.md` para traspasar cambios al vault".
  - `wiki/concepts/Flujo de trabajo.md`: añadir que, en sesiones en la nube sin acceso al vault, los cambios se apuntan en `PendienteObsidian.md` del repo y se pasan al vault en la siguiente sesión local.
  - Comprobar que el commit `0d24105` (prototipo PWA) ya está reflejado en `Backlog.md`, `hot.md` y `log.md`; si no, añadirlo.
- **Decisiones del usuario:** el usuario autorizó subir los commits de las sesiones en la nube directamente a `main` (como dice `CLAUDE.md`).

### 2026-10-09 · Reglas del prototipo confirmadas

- **Rama:** `main` (y `claude/obsidian-vault-docs-dt1k4q`).
- **Commits:** "Confirmar las reglas del prototipo: cualquier modalidad en cualquier pista" (búscalo con `git log`).
- **Qué se hizo:**
  - El usuario confirmó las 4 reglas de `DecisionesDiseno.md` §8; ahora son las decisiones 16 a 19 de §5 y §8 solo remite a ellas.
  - Regla 1 cambia respecto al prototipo: **no hay restricción de modalidad por tipo de pista** (se puede crear F11 en una pista de F7). Se quitó la validación de `js/datos.js` y el bloqueo del botón "Fútbol 11" en el formulario de `js/app.js`. `sw.js` pasa a `VERSION = 'pachangueo-v2'`.
  - Reglas 2, 3 y 4 se confirman tal cual: 2-30 jugadores (por defecto F7 10-14, F11 18-22); el organizador ocupa plaza y no puede darse de baja, solo cancelar; partidos que se tocan (18:00-19:00 y 19:00-20:00) no se solapan.
- **Entrada del Backlog:** la de confirmar las reglas del prototipo, si existe, pasa a HECHO. Si no existe, añádela como HECHA.
- **Para el vault:**
  - Página de reglas de negocio: añadir las 4 reglas (con la 1 tal como ha quedado: el tipo de pista es solo informativo).
  - Modelo de datos: `PISTA.tipo` no restringe la modalidad de `PARTIDO`; el backend no debe validarlo.
  - Frontend: el formulario de crear partido ya no bloquea F11 en pistas F7.
  - `wiki/sessions/2026-10-09 Reglas del prototipo.md` con las 4 decisiones, enlazada desde `wiki/index.md`.
  - `wiki/hot.md` y `wiki/log.md` como siempre.
- **Decisiones del usuario:** las 4 de arriba (ya están en `DecisionesDiseno.md`).
- **Siguiente:** esqueleto de Spring Boot (#5). Está decidido en el vault, que esta sesión no puede leer, así que se deja para una sesión local.

### 2026-10-09 · Maqueta: pantallas 06 Avisos y 07 Perfil

- **Rama:** `main` (y `claude/obsidian-vault-docs-dt1k4q`).
- **Commits:** "Añadir a la maqueta las pantallas 06 Avisos y 07 Perfil" (búscalo con `git log`). El cambio grande está en Figma; en el repo solo se actualiza `DecisionesDiseno.md` §7.
- **Qué se hizo:**
  - En Figma (https://www.figma.com/design/4gB4RLpy8DBXpSIX90t0Be), sección "Pantallas (móvil 390×844)", dos pantallas nuevas con las variables de la colección "Pachangueo", Baloo 2/Nunito y la Barra de navegación:
    - **06 Avisos** (nodo `12:202`): lista de avisos (sin leer con borde verde a la izquierda y punto de color: verde = partido nuevo o alguien se apunta, naranja = cancelación) y nota de que con las notificaciones activadas también llegan al móvil.
    - **07 Perfil** (nodo `12:247`): avatar y saludo; tarjeta de radio de avisos (deslizador 1-10 km); tarjeta "Tu zona: Toledo" con origen GPS y enlace "Cambiar" (decisión 12: marcar la zona a mano); interruptor "Notificaciones en el móvil" (Web Push, decisión 10); botones "Instalar Pachangueo" y "Cerrar sesión".
  - Se probó el prototipo PWA con Playwright tras el cambio de la regla 1: se puede crear un F11 en una pista de F7, sin errores en consola.
- **Entrada del Backlog:** la de la maqueta en Figma, si sigue abierta: añadir 06 y 07 como aprobadas.
- **Para el vault:**
  - Página de interfaz: pantallas 06 Avisos y 07 Perfil y lo que contiene cada una.
  - La tarjeta "Tu zona" y el interruptor de notificaciones son nuevos en el diseño y quedan aprobados; el prototipo PWA aún no los tiene.
  - Los avisos de cancelación van como alerta: fondo naranja suave, borde izquierdo naranja (`estado/completo`) y etiqueta "PARTIDO CANCELADO". El prototipo PWA aún no lo tiene.
  - `wiki/hot.md` y `wiki/log.md` como siempre.
- **Decisiones del usuario:** aprueba 06 Avisos y 07 Perfil, y pide que el aviso de partido cancelado tenga un color más de alerta (hecho). Va a `wiki/sessions/2026-10-09 Pantallas Avisos y Perfil.md`.
- **Siguiente:** en Figma, editar partido, registro y marcar zona sin GPS. Llevar al prototipo PWA lo nuevo de 06 y 07.
- **Además:** hay una copia de demostración del prototipo publicada como página privada de claude.ai (https://claude.ai/artifact/Gqxm6pn5hLQWknARvJsM83) para verlo sin PC; sin calles en el mapa ni GPS ni instalación. No está en el repo.

### 2026-10-09 · Maqueta: pantallas 08 Editar partido, 09 Registro y 10 Marcar zona

- **Rama:** `main` (y `claude/obsidian-vault-docs-dt1k4q`).
- **Commits:** "Añadir a la maqueta editar partido, registro y marcar zona" (búscalo con `git log`). El cambio está en Figma; en el repo solo `DecisionesDiseno.md` §7.
- **Qué se hizo** (en Figma, a la derecha de 07 Perfil):
  - **08 Editar partido** (nodo `18:242`, sacada de 04): pista fija ("no se puede cambiar"), modalidad, fecha, horas y contadores editables; nota verde "Hay 3 jugadores apuntados: el máximo no puede bajar de 3. Les avisaremos de los cambios." (decisión 14); botones "Guardar cambios" y "Cancelar partido" (decisión 15).
  - **09 Registro** (nodo `18:298`, sacada de 01): campos nombre, correo y contraseña (mínimo 8 caracteres), botón "Crear cuenta", enlace "¿Ya tienes cuenta? Entra" y la nota del GPS.
  - **10 Marcar zona (sin GPS)** (nodo `18:368`, sacada de 02): cabecera "Marca tu zona" con volver, instrucción "No tenemos tu ubicación. Toca el mapa o arrastra el pin…", pin en el centro del radio de avisos, ficha inferior "Tu zona: Santa Bárbara, Toledo" con "Guardar zona" y "Usar mi ubicación GPS" (decisión 12). Se llega desde "Cambiar" en 07 Perfil o al entrar sin permiso de GPS.
- **Entrada del Backlog:** la de la maqueta en Figma: añadir 08, 09 y 10 (aprobadas).
- **Para el vault:** página de interfaz con las tres pantallas; anotar como pendiente la regla nueva de contraseña "mínimo 8 caracteres" (sale en 09, no estaba decidida); `wiki/hot.md` y `wiki/log.md`.
- **Decisiones del usuario:** pide seguir con Figma y después llevar todo al prototipo PWA y publicarlo junto.
- **Siguiente:** que el usuario apruebe 08-10; después, llevar al prototipo PWA lo nuevo de 06-10 y volver a publicar la copia de demostración.

### 2026-10-09 · Prototipo PWA: pantallas 06 a 10

- **Rama:** `main` (y `claude/obsidian-vault-docs-dt1k4q`).
- **Commits:** "Llevar al prototipo avisos de alerta, perfil con zona, editar partido, registro y marcar zona" (búscalo con `git log`).
- **Qué se hizo** (en `src/main/resources/static/`):
  - `js/datos.js`: validación de partido compartida entre crear y `editarPartido` (máximo ≥ apuntados, no choca consigo mismo); `entrar`, `registrar` (nombre ≤ 40, correo válido, contraseña ≥ 8); `guardarZona` (origen `gps`/`manual`), `cambiarNotificaciones`, `pistaMasCercana`. Clave de almacenamiento a `pachangueo-demo-v2`.
  - `datos/demo.json`: usuario con `correo`, `zona` y `notificaciones`; avisos con `tipo` (`nuevo`, `cancelado`, `apuntado`).
  - `js/mapa.js`: modo "marcar zona" con pin arrastrable (`marcarZona`, `moverPin`, `terminarZona`); el clic en el fondo devuelve el punto tocado.
  - `js/app.js`: rutas `#/registro`, `#/editar/:id` y `#/zona`; botones Editar/Cancelar en los partidos propios; avisos de cancelación como alerta; perfil nuevo; sin GPS y sin zona guardada, lleva a marcar la zona.
  - `css/estilos.css`: estilos de alerta, perfil, interruptor (`role="switch"`), pin y pantalla de zona. `sw.js` a `pachangueo-v3`.
  - Probado con Playwright: registro (error con contraseña corta), sin GPS → marcar zona → guardar, perfil e interruptor, avisos, editar (el máximo no baja de 3) y cancelar desde editar. Sin errores en consola.
  - Copia de demostración republicada en https://claude.ai/artifact/Gqxm6pn5hLQWknARvJsM83.
- **Entrada del Backlog:** la del prototipo PWA, si existe: añadir esto.
- **Para el vault:** reglas de negocio (las tres nuevas de `DecisionesDiseno.md` §8), frontend (rutas y pantallas nuevas), modelo de datos (usuario: correo, zona con origen y fecha, notificaciones; aviso: tipo); `wiki/hot.md` y `wiki/log.md`.
- **Decisiones del usuario:** aprueba las pantallas 08-10 (con la contraseña de mínimo 8 caracteres) y el plan para llevarlas al prototipo.
- **Siguiente:** esqueleto de Spring Boot (#5) en una sesión local con acceso al vault.

<!--
Plantilla para nuevas entradas:

### AAAA-MM-DD · Título

- **Rama:** ...
- **Commits:** `abc1234` mensaje
- **Qué se hizo:** ...
- **Entrada del Backlog:** nombre y nuevo estado (EN CURSO / HECHO)
- **Para el vault:** páginas que hay que tocar y qué poner
- **Decisiones del usuario:** ...
- **Siguiente:** ...
-->
