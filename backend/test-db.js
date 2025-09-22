const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'perfil'
};

async function testDatabase() {
  let connection;
  try {
    console.log('🔍 Configuración de la base de datos:');
    console.log({ ...dbConfig, password: '***' });
    
    console.log('\n📡 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida exitosamente');
    
    console.log('\n🔍 Verificando si la tabla perfil existe...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'perfil'");
    
    if (tables.length === 0) {
      console.log('❌ La tabla perfil no existe');
      console.log('💡 Ejecuta el script init.sql para crear la tabla');
      return;
    }
    
    console.log('✅ La tabla perfil existe');
    
    console.log('\n📋 Estructura de la tabla:');
    const [columns] = await connection.execute('DESCRIBE perfil');
    console.table(columns);
    
    console.log('\n📊 Contando registros...');
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM perfil');
    console.log(`Total de registros: ${count[0].total}`);
    
    if (count[0].total > 0) {
      console.log('\n📄 Primeros 5 registros:');
      const [samples] = await connection.execute('SELECT * FROM perfil LIMIT 5');
      console.table(samples);
    }
    
    console.log('\n✅ Prueba de base de datos completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba de base de datos:', error.message);
    console.error('Código de error:', error.code);
    console.error('SQL State:', error.sqlState);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

testDatabase();