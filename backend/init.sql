-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS perfil;

-- Usar la base de datos
USE perfil;

-- Crear la tabla perfil
CREATE TABLE perfil(
id INT AUTO_INCREMENT PRIMARY KEY,
no_ser Varchar(250) not null,
modelo varchar(100) not null ,
rol ENUM('BOT','TOP') NOT NULL,
fr date not null,
empleado varchar(250) not null,
counts int not null
);


-- Crear índices para optimizar consultas
CREATE INDEX idx_no_ser ON perfil(no_ser);
CREATE INDEX idx_modelo ON perfil(modelo);
CREATE INDEX idx_fr ON perfil(fr);

-- Datos de ejemplo (opcional)
-- INSERT INTO perfil (no_ser, modelo, rol, fr, empleado) VALUES 
-- ('SER001', 'MODEL-001', 'TOP', CURDATE(), 'Juan Perez'),
-- ('SER002', 'MODEL-002', 'BOT', CURDATE(), 'Maria Garcia');