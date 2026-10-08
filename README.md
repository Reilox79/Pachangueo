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
| Mapa | Mapa 2D estilo Pokémon GO (librería por decidir) |
| Back | Java 21 · Spring Boot · Spring Data JPA · Spring Security · Maven (API REST) |
| Base de datos | Oracle XE 21c · migraciones con Flyway (cliente: DBeaver) |
| Notificaciones | Dentro de la app y Web Push |

Las decisiones de diseño y las que quedan pendientes están en [DecisionesDiseno.md](DecisionesDiseno.md).

## Estado

Fase 2 del proyecto: diseño de la aplicación. Todavía no hay código. Los pasos para instalar, arrancar y probar el backend y la PWA se añadirán aquí al crear el esqueleto.

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
