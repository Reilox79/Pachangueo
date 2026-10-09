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
- **Decisiones del usuario:** ninguna nueva en esta sesión.

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
