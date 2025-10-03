const mysql = require('mysql2/promise');
require('dotenv').config();

const baseDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

async function createConnection(dbName) {
  const dbConfig = { ...baseDbConfig, database: dbName || process.env.DB_NAME || 'perfil' };
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error creando conexión:', error);
    throw error;
  }
}

module.exports = { createConnection };