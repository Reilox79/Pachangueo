# Pachangueo · Decisiones de diseño (Fase 2)

Documento vivo: se va ampliando conforme se toman decisiones.
Última actualización: 2026-10-08 (MySQL en el servidor doméstico, MapLibre y reglas cerradas)

## 1. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Front | PWA en HTML, CSS y JavaScript (sin framework), mobile-first, servida por Spring Boot desde `static/` |
| Back | Java 21 con Spring Boot (API REST) y Maven |
| Base de datos | MySQL, alojada en el servidor doméstico del usuario, gestionada con DBeaver |
| Migraciones | Flyway |
| Login | Sesión de Spring Security con cookie segura |
| Mapa | MapLibre GL JS + OpenFreeMap (gratuito, sin API key, estilo propio) |
| Notificaciones | Dentro de la app y Web Push |

Notas:
- DBeaver es el cliente; el motor es MySQL en el servidor doméstico. Conexión con `mysql-connector-j` y Spring Data JPA. La ficha ya menciona MySQL, así que no hay que cambiarla.
- PWA: la web se puede instalar en el móvil gracias a un `manifest.webmanifest` y un service worker. Necesita HTTPS (en local vale `localhost`).
- **MapLibre:** mapa vectorial con estilo propio (suelo verde, calles simplificadas) e inclinación 3D, para conseguir el aspecto de Pokémon GO. Los mapas son de OpenFreeMap, sin clave.
- **Flyway:** cada cambio del esquema es un script `V1__...sql`, `V2__...sql` versionado en git. Todo el equipo tiene la misma base de datos, se recrea desde cero con un comando y Hibernate solo valida que las tablas coinciden con las entidades. Para MySQL hace falta la dependencia `flyway-mysql`. Los datos de prueba de Toledo van en su propia migración.
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
- En MySQL: latitud y longitud como `DECIMAL(9,6)` y fórmula de Haversine para el radio (sin tipos espaciales).
- MySQL no tiene restricciones de exclusión: el no solape de partidos se valida en el backend dentro de una transacción con bloqueo de la pista.
- Endpoint que devuelve las pistas de una zona con el estado de sus partidos (alimenta el mapa).

## 5. Decisiones tomadas

1. **Registro de pistas:** las registra el equipo de desarrollo. Los usuarios no añaden pistas, así que no hace falta moderación. Se cargan por script SQL; el administrador podrá gestionarlas desde su panel.
2. **Partidos por pista:** una pista puede tener varios partidos, siempre en fechas y horas distintas. No pueden solaparse dos partidos en la misma pista. El marcador es verde si hay algún partido con plazas libres.
3. **Ciudad de prueba:** Toledo. Pistas y usuarios de ejemplo se cargarán con coordenadas de Toledo y alrededores.
4. **Stack:** Java 21 con Maven, front en `static/` de Spring Boot, MySQL en el servidor doméstico con DBeaver, Flyway y sesión de Spring Security (ver §1).
5. **Prototipo:** primero las pantallas en Figma y, cuando estén aprobadas, un prototipo en HTML sacado de ellas que se pueda instalar como PWA (comprobado con Lighthouse).
6. **Paleta:** verde; los colores concretos se eligen más adelante.
7. **Premium:** se deja para más adelante.
8. **Ubicación:** por GPS, para situar al jugador en el mapa.
9. **Datos del partido:** el organizador elige el mínimo y el máximo de jugadores, la modalidad, la fecha y la hora.
10. **Notificaciones:** combinación de notificaciones dentro de la app y push (Web Push de la PWA).
11. **Mapa:** MapLibre GL + OpenFreeMap.
12. **Zona de avisos:** el radio se cuenta desde la última posición GPS guardada al abrir la app. Si el usuario no da permiso de GPS, marca su zona a mano en el mapa.
13. **Partido sin el mínimo:** se avisa al organizador y él decide si lo cancela.
14. **Editar partidos:** se puede aunque haya gente apuntada; se les avisa y las plazas no pueden bajar de los que ya están apuntados.
15. **Cancelar partidos:** se puede, y se avisa a los apuntados.

## 6. Decisiones pendientes

1. Paleta exacta (verde) y logo.
2. Datos de conexión al MySQL del servidor (se configuran al crear el esqueleto, fuera de git).

## 7. Maqueta

Figma: https://www.figma.com/design/4gB4RLpy8DBXpSIX90t0Be (equipo de Rafael Lora Calero).

- Pantallas de móvil (390×844): 01 Acceso, 02 Mapa, 03 Ficha de pista, 04 Crear partido y 05 Mis partidos.
- Componentes: mapa base, jugador, marcador de pista (libre, completa y sin partido) y barra de navegación con el botón central de crear partido.
- Colores en variables (colección "Pachangueo"): la paleta verde es provisional y se cambia desde ahí sin rehacer pantallas.
- Tipografía: Baloo 2 para títulos y Nunito para el texto.

Pendiente de aprobación. Después: prototipo PWA en HTML a partir de la maqueta.
