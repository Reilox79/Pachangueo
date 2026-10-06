# Pachangueo · Decisiones de diseño (Fase 2)

Documento vivo: se va ampliando conforme se toman decisiones.
Última actualización: 2026-10-06 (pistas, partidos por pista y ciudad de prueba)

## 1. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Front | HTML, CSS y JavaScript (sin framework), mobile-first |
| Back | Java con Spring Boot (API REST) |
| Base de datos | Oracle, gestionada con SQL Developer |
| Mapa (propuesto) | Leaflet + OpenStreetMap (gratuito, sin API key) |

Notas:
- SQL Developer es el cliente; el motor es Oracle Database. Conexión con driver `ojdbc` y Spring Data JPA.
- La ficha del proyecto menciona MySQL o PostgreSQL como ejemplo. Al elegir Oracle hay que actualizar ese punto en la documentación.

## 2. Concepto de la interfaz

La pantalla principal es un **mapa a pantalla completa** centrado en la ciudad del usuario, con un círculo que muestra su radio de avisos.

Cada pista registrada es un marcador, y su color indica el estado:

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
2. Perfil (ciudad y radio de notificaciones)
3. **Mapa principal** (sustituye al listado de partidos de las fases)
4. Ficha de pista / detalle de partido (inscripción y baja)
5. Crear partido (modalidad, fecha, hora, nº de jugadores; la pista viene del marcador)
6. Mis partidos (creados y apuntados)
7. Notificaciones
8. Plan premium (simulado)
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

## 6. Decisiones pendientes

1. Versión de Java y gestor de dependencias (propuesta: Java 17 o 21 con Maven).
2. Dónde se sirve el front (dentro de Spring Boot en `static/` o carpeta separada).
3. Versión de Oracle instalada (XE 21c, 19c...).
4. Herramienta del prototipo: Figma o maqueta directa en HTML/CSS/JS.
5. Estilo visual (colores, logo). Propuesta: paleta verde cancha.

## 7. Dudas heredadas de `IdeasWebPartidos.txt`

- ¿El límite premium es de partidos creados, o también de partidos a los que te puedes apuntar?
- ¿Cómo se valida la ubicación del usuario: GPS, código postal o selección manual de ciudad?
- ¿Se puede cancelar un partido creado? ¿Se avisa a los apuntados?
- ¿Mínimo de jugadores para confirmar el partido, o se juega igual?

## 8. Siguiente paso propuesto

Maqueta del mapa en HTML, CSS y JS con Leaflet, centrada en Toledo, con pistas de ejemplo y ficha de partido. Sirve como prototipo de la Fase 2 y se reutiliza en el front de la Fase 6.
