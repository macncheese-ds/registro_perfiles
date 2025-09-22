-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS perfil;

-- Usar la base de datos
USE perfil;

-- Crear la tabla perfil
CREATE TABLE perfil(
    id INT AUTO_INCREMENT PRIMARY KEY,
    no_ser VARCHAR(250) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    rol ENUM('BOT','TOP') NOT NULL,
    fr DATE NOT NULL,
    empleado VARCHAR(250) NOT NULL,
    counts INT NOT NULL DEFAULT 1
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_no_ser ON perfil(no_ser);
CREATE INDEX idx_modelo ON perfil(modelo);
CREATE INDEX idx_fr ON perfil(fr);

-- Datos de ejemplo (opcional)
-- INSERT INTO perfil (no_ser, modelo, rol, fr, empleado) VALUES 
-- ('SER001', 'MODEL-001', 'TOP', CURDATE(), 'Juan Perez'),
-- ('SER002', 'MODEL-002', 'BOT', CURDATE(), 'Maria Garcia');