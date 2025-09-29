const express = require('express');
const { createConnection } = require('../db');
const router = express.Router();

// GET - Obtener todos los perfiles con paginación
router.get('/', async (req, res) => {
  try {
    const db = await createConnection();
    
    // Verificar que la tabla existe
    const [tables] = await db.execute("SHOW TABLES LIKE 'perfil'");
    if (tables.length === 0) {
      await db.end();
      return res.status(500).json({ error: 'La tabla perfil no existe. Ejecuta el script init.sql primero.' });
    }
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    
    console.log('Pagination params:', { page, limit, offset });
    
    // Obtener perfiles con paginación (sin parámetros preparados para LIMIT/OFFSET)
    const limitQuery = `SELECT * FROM perfil ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    const [perfiles] = await db.query(limitQuery);
    
    // Obtener total de registros
    const [total] = await db.execute('SELECT COUNT(*) as count FROM perfil');
    
    await db.end();
    
    res.json({
      perfiles,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener conteo de registros por combinación no_ser + modelo + lado
router.get('/count/:no_ser/:modelo/:rol', async (req, res) => {
  try {
    const { no_ser, modelo, rol } = req.params;
    const db = await createConnection();
    
    const [result] = await db.execute(
      'SELECT counts FROM perfil WHERE no_ser = ? AND modelo = ? AND rol = ?',
      [no_ser, modelo, rol]
    );
    
    await db.end();
    
    const currentCount = result.length > 0 ? result[0].counts : 0;
    
    res.json({
      no_ser,
      modelo,
      rol,
      count: currentCount,
      canRegister: currentCount < 60
    });
  } catch (error) {
    console.error('Error obteniendo conteo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear nuevo perfil
router.post('/', async (req, res) => {
  try {
    const { no_ser, modelo, rol, empleado } = req.body;
    
    // Validar campos requeridos
    if (!no_ser || !modelo || !rol || !empleado) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos: no_ser, modelo, rol, empleado' 
      });
    }
    
    // Validar rol
    if (!['BOT', 'TOP'].includes(rol)) {
      return res.status(400).json({ 
        error: 'El rol debe ser BOT o TOP' 
      });
    }
    
    const db = await createConnection();
    
    // Verificar si ya existe la combinación: no_ser + modelo + rol
    const [existingRecord] = await db.execute(
      'SELECT * FROM perfil WHERE no_ser = ? AND modelo = ? AND rol = ?',
      [no_ser, modelo, rol]
    );
    
    let result;
    let perfil;
    
    if (existingRecord.length > 0) {
      // Ya existe la combinación, verificar si puede incrementar
      const currentCount = existingRecord[0].counts;
      
      if (currentCount >= 60) {
        await db.end();
        return res.status(400).json({ 
          error: `Esta combinación (Serie: ${no_ser}, Modelo: ${modelo}, Lado: ${rol}) ya ha alcanzado el límite de 60 registros`,
          currentCount: currentCount
        });
      }
      
      // Incrementar el contador
      await db.execute(
        'UPDATE perfil SET counts = counts + 1, empleado = ?, fr = ? WHERE id = ?',
        [empleado, new Date().toISOString().split('T')[0], existingRecord[0].id]
      );
      
      // Obtener el perfil actualizado
      const [updatedPerfil] = await db.execute(
        'SELECT * FROM perfil WHERE id = ?',
        [existingRecord[0].id]
      );
      
      perfil = updatedPerfil[0];
      
    } else {
      // No existe, crear nuevo registro
      const fr = new Date().toISOString().split('T')[0];
      
      const [insertResult] = await db.execute(
        'INSERT INTO perfil (no_ser, modelo, rol, fr, empleado, counts) VALUES (?, ?, ?, ?, ?, 1)',
        [no_ser, modelo, rol, fr, empleado]
      );
      
      // Obtener el perfil creado
      const [newPerfil] = await db.execute(
        'SELECT * FROM perfil WHERE id = ?',
        [insertResult.insertId]
      );
      
      perfil = newPerfil[0];
    }
    
    await db.end();
    
    const message = existingRecord.length > 0 
      ? `Contador actualizado exitosamente (${perfil.counts}/60)`
      : 'Perfil creado exitosamente';
    
    res.status(201).json({
      message: message,
      perfil: perfil
    });
  } catch (error) {
    console.error('Error creando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener perfil por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await createConnection();
    
    const [perfil] = await db.execute(
      'SELECT * FROM perfil WHERE id = ?',
      [id]
    );
    
    await db.end();
    
    if (perfil.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    res.json(perfil[0]);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar perfil
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { no_ser, modelo, rol, empleado } = req.body;
    
    // Validar campos requeridos
    if (!no_ser || !modelo || !rol || !empleado) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos: no_ser, modelo, rol, empleado' 
      });
    }
    
    // Validar rol
    if (!['BOT', 'TOP'].includes(rol)) {
      return res.status(400).json({ 
        error: 'El rol debe ser BOT o TOP' 
      });
    }
    
    const db = await createConnection();
    
    // Los modelos pueden repetirse, no hay validación de unicidad
    
    // Actualizar perfil
    const [result] = await db.execute(
      'UPDATE perfil SET no_ser = ?, modelo = ?, rol = ?, empleado = ? WHERE id = ?',
      [no_ser, modelo, rol, empleado, id]
    );
    
    if (result.affectedRows === 0) {
      await db.end();
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    // Obtener el perfil actualizado
    const [updatedPerfil] = await db.execute(
      'SELECT * FROM perfil WHERE id = ?',
      [id]
    );
    
    await db.end();
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      perfil: updatedPerfil[0]
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar perfil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await createConnection();
    
    const [result] = await db.execute(
      'DELETE FROM perfil WHERE id = ?',
      [id]
    );
    
    await db.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    res.json({ message: 'Perfil eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener modelos disponibles
router.get('/models', async (req, res) => {
  try {
    const models = [
      'MGH100 RCU',
      'MGH100 BL7',
      'IDB PLOCK',
      'IDB MAIN', 
      'IDB IPTS',
      'POWER PACK',
      'MGH MOCI',
      'MGH100 ESC',
      'FCM 30W',
      'MRR35',
      'IAMM2',
      'FRHC'
    ];
    
    res.json({ models });
  } catch (error) {
    console.error('Error obteniendo modelos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Estadísticas
router.get('/stats/general', async (req, res) => {
  try {
    const db = await createConnection();
    
    // Total de perfiles únicos (count distinct de combinaciones serie + modelo + rol)
    const [totalPerfiles] = await db.execute('SELECT COUNT(*) as count FROM perfil');
    
    // Perfiles activos (counts < 60)
    const [perfilesActivos] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM perfil 
      WHERE counts < 60
    `);
    
    // Perfiles inactivos (counts >= 60)
    const [perfilesInactivos] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM perfil 
      WHERE counts >= 60
    `);
    
    // Total de registros (suma de todos los counts)
    const [totalRegistros] = await db.execute('SELECT SUM(counts) as count FROM perfil');
    
    await db.end();
    
    res.json({
      totalPerfiles: totalPerfiles[0].count || 0,
      totalRegistros: totalRegistros[0].count || 0,
      perfilesActivos: perfilesActivos[0].count || 0,
      perfilesInactivos: perfilesInactivos[0].count || 0
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;