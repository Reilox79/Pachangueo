# Migraciones de Flyway

Cada cambio del esquema es un script nuevo `Vn__descripcion.sql` (V1, V2, V3...).

- Nunca edites una migración que ya se haya aplicado: crea otra.
- Cualquier cambio en las entidades JPA necesita su migración.
- Los datos de prueba de Toledo irán en su propia migración.
