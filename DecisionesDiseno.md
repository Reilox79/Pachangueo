# Pachangueo · Decisiones de diseño (Fase 2)

Documento vivo: se va ampliando conforme se toman decisiones.
Última actualización: 2026-10-08 (stack cerrado, mapa estilo Pokémon GO, reglas y notificaciones)

## 1. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Front | PWA en HTML, CSS y JavaScript (sin framework), mobile-first, servida por Spring Boot desde `static/` |
| Back | Java 21 con Spring Boot (API REST) y Maven |
| Base de datos | Oracle Database XE 21c, gestionada con DBeaver |
| Migraciones | Flyway |
| Login | Sesión de Spring Security con cookie segura |
| Mapa (propuesto) | Leaflet + OpenStreetMap (gratuito, sin API key) |

Notas:
- DBeaver es el cliente; el motor es Oracle Database. Conexión con driver `ojdbc` y Spring Data JPA.
- La ficha del proyecto menciona MySQL o PostgreSQL como ejemplo. Al elegir Oracle hay que actualizar ese punto en la documentación.
- PWA: la web se puede instalar en el móvil gracias a un `manifest.webmanifest` y un service worker. Necesita HTTPS (en local vale `localhost`).
- **Flyway:** cada cambio del esquema es un script `V1__...sql`, `V2__...sql` versionado en git. Todo el equipo tiene la misma base de datos, se recrea desde cero con un comando y Hibernate solo valida que las tablas coinciden con las entidades. Para Oracle hace falta la dependencia `flyway-database-oracle`. Los datos de prueba de Toledo van en su propia migración.
- **Login:** como la PWA y la API se sirven desde el mismo dominio, lo más seguro es la sesión de Spring Security. La cookie de sesión es `HttpOnly` (JavaScript no puede leerla, así que un XSS no puede robarla), `Secure` y `SameSite=Lax`, con protección CSRF. Las contraseñas se guardan con BCrypt. Se descarta JWT en `localStorage` porque cualquier XSS podría leer el token.

## 2. Concepto de la interfaz

La pantalla principal es un **mapa 2D a pantalla completa, estilo Pokémon GO**: el jugador aparece donde está según el GPS y las pistas ocupan el lugar de los gimnasios. Un círculo muestra su radio de avisos.

Cada pista registrada es un marcador, y su aspecto indica el estado (diferencia visual clara entre las disponibles y las cogidas):

- **Gris:** pista registrada sin partido.
- **Verde:** hay partido con plazas libres.
- **Naranja/rojo:** partido completo.

Al pulsar un marcador se abre una ficha inferior (*bottom sheet* en móvil) con:
- Los partidos de esa pista.
- Botón de apuntarse / darse de baja.
- Botón de crear partido en esa pista (la pista no se elige a mano en el formulario).

El resto de pantallas cuelgan de una barra de navegación inferior.

## 3. Pantallas

1. Registro e inicio de sesión
2. Perfil (radio de notificaciones)
3. **Mapa principal** (sustituye al listado de partidos de las fases)
4. Ficha de pista / detalle de partido (inscripción y baja)
5. Crear partido (modalidad, fecha, hora, mínimo y máximo de jugadores; la pista viene del marcador)
6. Mis partidos (creados y apuntados)
7. Notificaciones
8. Plan premium (simulado), más adelante
9. Panel de administración (usuarios, partidos y pistas)

Prioridad inicial: 1, 3, 4, 5 y 6. Premium y administración después.

## 4. Impacto técnico

- Nueva tabla `PISTA`: nombre, dirección, ciudad, latitud, longitud, tipo (F7/F11).
- `PARTIDO` referencia a una `PISTA`.
- En Oracle: latitud y longitud como `NUMBER` y fórmula de Haversine para el radio (sin tipos espaciales).
- Endpoint que devuelve las pistas de una zona con el estado de sus partidos (alimenta el mapa).

## 5. Decisiones tomadas

1. **Registro de pistas:** las registra el equipo de desarrollo. Los usuarios no añaden pistas, así que no hace falta moderación. Se cargan por script SQL; el administrador podrá gestionarlas desde su panel.
2. **Partidos por pista:** una pista puede tener varios partidos, siempre en fechas y horas distintas. Regla de negocio: no pueden solaparse dos partidos en la misma pista (restricción a validar en backend y, si es posible, en BD). El marcador es verde si hay algún partido con plazas libres.
3. **Ciudad de prueba:** Toledo. Pistas y usuarios de ejemplo se cargarán con coordenadas de Toledo y alrededores.
4. **Stack:** Java 21 con Maven, front en `static/` de Spring Boot, Oracle XE 21c con DBeaver, Flyway y sesión de Spring Security (ver §1).
5. **Prototipo:** maqueta en Figma. La maqueta debe poder instalarse como PWA.
6. **Paleta:** verde; los colores concretos se eligen más adelante.
7. **Premium:** se deja para más adelante.
8. **Ubicación:** por GPS, para situar al jugador en el mapa.
9. **Cancelar partidos:** se puede.
10. **Datos del partido:** el organizador elige el mínimo de jugadores, la modalidad, etc.
11. **Notificaciones:** combinación de notificaciones dentro de la app y push (Web Push de la PWA).

## 6. Decisiones pendientes

1. Cómo se pasa de la maqueta de Figma a una PWA instalable.
2. Librería del mapa para conseguir el estilo Pokémon GO.
3. Dónde se calcula la zona de avisos cuando la app está cerrada.
4. Qué pasa si un partido no llega al mínimo.
5. Si se puede editar un partido que ya tiene gente apuntada.

## 7. Siguiente paso propuesto

Maqueta de las pantallas principales en Figma, con el mapa estilo Pokémon GO centrado en Toledo.
