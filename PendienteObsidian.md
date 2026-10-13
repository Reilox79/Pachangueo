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

Ninguna. Las anteriores se pasaron al vault el 2026-10-13.

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
