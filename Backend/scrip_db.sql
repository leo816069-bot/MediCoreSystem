CREATE DATABASE IF NOT EXISTS medicore_db;
USE medicore_db;

-- TABLA DE USUARIOS CLÍNICOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Soportará el hash de la contraseña
    rol ENUM('medico', 'finanzas', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE PRODUCTOS (Asegurando el nombre exacto corregido)
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL
);

-- Insertar un usuario administrador de prueba (Contraseña ejemplo: MediCore2026)
-- Nota: En producción irá encriptada con Werkzeug/Bcrypt
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador General', 'leo816069@gmail.com', 'MediCore2026', 'admin')
ON DUPLICATE KEY UPDATE id=id;