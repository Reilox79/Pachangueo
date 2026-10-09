# Pachangueo

PWA para organizar partidos de fútbol y encontrar jugadores de tu zona sin depender de grupos de mensajería. Quien organiza crea el partido en una pista, y los usuarios que están dentro de su radio de avisos reciben una notificación y se apuntan hasta completar las plazas.

Proyecto Intermodular de 2º DAW.

## Funcionalidades (v1)

- Registro, inicio de sesión y perfil con ciudad y radio de notificaciones.
- Mapa con las pistas de la zona; el color de cada marcador indica si hay partidos con plazas libres.
- Crear partidos de fútbol 7 y fútbol 11 en una pista, con fecha, hora y número de jugadores.
- Apuntarse y darse de baja con control de plazas.
- Notificaciones solo a los usuarios de la zona.
- Límite de partidos creados por periodo, ampliable con un plan premium simulado (más adelante).
- "Mis partidos": creados y apuntados.
- Panel de administración de usuarios, partidos y pistas.

## Stack

| Parte | Tecnología |
|---|---|
| Front | PWA en HTML, CSS y JavaScript sin framework, mobile-first, servida por Spring Boot |
| Mapa | MapLibre GL + OpenFreeMap, estilo Pokémon GO |
| Back | Java 21 · Spring Boot · Spring Data JPA · Spring Security · Maven (API REST) |
| Base de datos | MySQL · migraciones con Flyway (cliente: DBeaver) |
| Notificaciones | Dentro de la app y Web Push |

Las decisiones de diseño y las que quedan pendientes están en [DecisionesDiseno.md](DecisionesDiseno.md).

## Estado

Fase 2 del proyecto: diseño de la aplicación. Hay una [maqueta en Figma](https://www.figma.com/design/4gB4RLpy8DBXpSIX90t0Be) y un **prototipo PWA** con datos de ejemplo de Toledo. Todavía no hay backend.

## Prototipo PWA

Está en `src/main/resources/static/`, la carpeta desde la que la servirá Spring Boot. Por ahora es una web estática: los datos salen de `datos/demo.json` y se guardan en el navegador.

### Arrancar

Con el servidor estático que trae el JDK (Java 18 o superior):

```bash
jwebserver -d src/main/resources/static -p 8000
```

Abre `http://localhost:8000` y entra con cualquier correo. Para empezar de cero: Perfil → "Reiniciar los datos de la demo".

- **Ubicación:** si das permiso y estás a menos de 40 km de Toledo, el jugador aparece donde estás. Si no, se coloca en el centro de Toledo.
- **Instalar:** en Chrome o Edge, con el icono de instalar de la barra de direcciones o desde Perfil → "Instalar Pachangueo". La instalabilidad se puede revisar en DevTools → Lighthouse.
- **En el móvil:** las PWA necesitan HTTPS (solo `localhost` está exento). Opciones: depuración por USB con `chrome://inspect` y reenvío del puerto 8000, o un túnel HTTPS hacia `localhost:8000`.

### Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Página única; las pantallas cambian con la ruta `#/...` |
| `manifest.webmanifest` | Nombre, colores, iconos y modo `standalone` |
| `sw.js` | Service worker: guarda la app en caché para arrancar sin conexión (el mapa necesita red) |
| `css/estilos.css` | Estilos; los colores son las variables de la maqueta de Figma |
| `js/app.js` | Rutas, pantallas y acciones |
| `js/mapa.js` | Mapa de MapLibre con el estilo verde, el jugador, el radio y los marcadores |
| `js/datos.js` | Estado de la demo y reglas (plazas, solapes, mínimo, edición, cancelación, registro y zona). Lo sustituirá la API |
| `js/util.js` | Escape de HTML, distancia Haversine, fechas y almacenamiento |
| `datos/demo.json` | Pistas, partidos y avisos de ejemplo (coordenadas aproximadas) |
| `iconos/` | Iconos de la PWA (192, 512 y maskable) |

## Documentos

| Archivo | Contenido |
|---|---|
| `FichaProyecto.pdf` | Ficha del proyecto: objetivos, alcance, público y recursos |
| `Fase4_FasesProyecto.pdf` | Las 10 fases del proyecto |
| `Pachangueo_Proyecto.pdf` | Ideas presentadas en clase y ficha |
| `IdeasProyecto.docx` | Propuesta de ideas |
| `IdeasWebPartidos.txt` | Cuaderno de ideas y dudas |
| `DecisionesDiseno.md` | Decisiones de diseño (documento vivo) |

La documentación de trabajo (backlog, dominio y decisiones) está en el vault de Obsidian del proyecto. `CLAUDE.md` explica cómo encontrarla.
