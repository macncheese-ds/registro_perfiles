-- Migración para remover la restricción UNIQUE del campo modelo
-- Ejecutar este script si ya tienes la tabla creada con la restricción UNIQUE

USE perfil;

-- Primero, identificar el nombre de la restricción UNIQUE
-- MySQL crea automáticamente un índice con el nombre del campo cuando se marca como UNIQUE

-- Eliminar la restricción UNIQUE del campo modelo
ALTER TABLE perfil DROP INDEX modelo;

-- Verificar que la tabla se actualizó correctamente
DESCRIBE perfil;