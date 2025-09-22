const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'perfil'
};

let db;

async function connectDB() {
  try {
    console.log('Intentando conectar con:', dbConfig);
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL exitosamente');
    
    // Probar la conexión
    await db.execute('SELECT 1');
    console.log('✅ Conexión a la base de datos verificada');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.error('Configuración usada:', { ...dbConfig, password: '***' });
    process.exit(1);
  }
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Registro de Perfiles funcionando',
    timestamp: new Date().toISOString(),
    database: dbConfig.database
  });
});

// Rutas
const perfilesRoutes = require('./routes/perfiles');
app.use('/api/perfiles', perfilesRoutes);

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Base de datos: ${dbConfig.database}`);
      console.log(`⚡ Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, db };