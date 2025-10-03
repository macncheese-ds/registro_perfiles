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

    // Queremos devolver un registro por número de serie (el más reciente) y un campo count con el total de registros
    // 1) Contar total de grupos (números de serie distintos)
    const [groupsTotal] = await db.execute('SELECT COUNT(DISTINCT no_ser) as count FROM perfil');
    const totalGroups = groupsTotal[0].count || 0;

    // 2) Obtener los últimos id por no_ser y el count por grupo, con paginación sobre grupos
    // Hacemos esto en dos pasos porque algunos motores no aceptan LIMIT/OFFSET en subqueries con parámetros.
    // Some MySQL drivers don't accept placeholders for LIMIT/OFFSET; interpolate integers directly (they are validated above)
    const groupQuery = `SELECT no_ser, MAX(id) as last_id, COUNT(*) as cnt
       FROM perfil
       GROUP BY no_ser
       ORDER BY no_ser
       LIMIT ${limit} OFFSET ${offset}`;
    const [groupRows] = await db.execute(groupQuery);

    if (!groupRows || groupRows.length === 0) {
      await db.end();
      return res.json({ perfiles: [], pagination: { page, limit, total: totalGroups, pages: Math.ceil(totalGroups / limit) } });
    }

    const lastIds = groupRows.map(r => r.last_id);
    const countsById = Object.fromEntries(groupRows.map(r => [r.last_id, r.cnt]));

    // Obtener los perfiles por id (últimos registros de cada serie)
    const placeholders = lastIds.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT id, no_ser, modelo, rol, fr, empleado FROM perfil WHERE id IN (${placeholders})`,
      lastIds
    );

    // Ordenar por no_ser asc (para consistencia) and map counts
    const perfiles = rows.map(r => ({
      no_ser: r.no_ser,
      modelo: r.modelo,
      rol: r.rol,
      fr: r.fr,
      empleado: r.empleado,
      count: countsById[r.id] || 0
    })).sort((a, b) => a.no_ser.localeCompare(b.no_ser));

    await db.end();

    res.json({
      perfiles,
      pagination: {
        page,
        limit,
        total: totalGroups,
        pages: Math.ceil(totalGroups / limit)
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
    // Contar filas existentes para la combinación
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM perfil WHERE no_ser = ? AND modelo = ? AND rol = ?',
      [no_ser, modelo, rol]
    );

    // Obtener último registro para mostrar fecha y empleado
    const [last] = await db.execute(
      'SELECT fr, empleado FROM perfil WHERE no_ser = ? AND modelo = ? AND rol = ? ORDER BY id DESC LIMIT 1',
      [no_ser, modelo, rol]
    );

    await db.end();

    const currentCount = rows[0].count || 0;
    const lastRecord = last.length > 0 ? last[0] : null;

    res.json({
      no_ser,
      modelo,
      rol,
      count: currentCount,
      canRegister: currentCount < 60,
      last: lastRecord // { fr: 'YYYY-MM-DD', empleado: '...' } or null
    });
  } catch (error) {
    console.error('Error obteniendo conteo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear nuevo perfil
router.post('/', async (req, res) => {
  try {
    const { no_ser, modelo, rol, employee_input, password } = req.body;
    
    // Validar campos requeridos
    if (!no_ser || !modelo || !rol || !employee_input) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos: no_ser, modelo, rol y empleado (scan o manual)'
      });
    }
    
    // Validar rol
    if (!['BOT', 'TOP'].includes(rol)) {
      return res.status(400).json({ 
        error: 'El rol debe ser BOT o TOP' 
      });
    }
    
    const db = await createConnection();

    // Normalize employee input
    // If scanned value like '00179A' -> strip leading zeros before letters -> '179A'
    // If manual numeric input like '179' -> append 'A' -> '179A'
    let normalized = String(employee_input).trim();
    // If contains letters (e.g., ends with A), strip leading zeros before letters
    const match = normalized.match(/^0*(\d+)([A-Za-z])?$/);
    if (match) {
      const number = match[1];
      const letter = match[2] || 'A';
      normalized = `${number}${letter}`;
    } else {
      // fallback: remove leading zeros and append A
      normalized = normalized.replace(/^0+/, '') + 'A';
    }

    // Lookup user in users table by num_empleado or usuario
    // Query users from credentials DB (may be a separate DB name)
    const credDbName = process.env.CRED_DB_NAME || 'credenciales';
    const credConn = await createConnection(credDbName);
    const [userRows] = await credConn.execute(
      'SELECT id, nombre, usuario, num_empleado, pass_hash FROM users WHERE num_empleado = ? OR usuario = ? LIMIT 1',
      [normalized, normalized]
    );
    await credConn.end();

    if (userRows.length === 0) {
      await db.end();
      return res.status(404).json({ error: 'Usuario no encontrado para el número de empleado proporcionado' });
    }

    const user = userRows[0];

    // If password provided, verify, else request password
    if (!password) {
      await db.end();
      return res.status(401).json({ error: 'Se requiere contraseña para autenticar al usuario' });
    }

  const bcrypt = require('bcrypt');
  const storedHash = Buffer.isBuffer(user.pass_hash) ? user.pass_hash.toString() : user.pass_hash;
  const passwordOk = await bcrypt.compare(password, storedHash);
    if (!passwordOk) {
      await db.end();
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const empleado = user.nombre; // use user nombre for registro

    // Siempre insertar un nuevo registro (no actualizar) para mantener historial
    const fr = new Date().toISOString().split('T')[0];

    // Antes de insertar, contar cuántos registros existen para esta combinación
    const [countRows] = await db.execute(
      'SELECT COUNT(*) as count FROM perfil WHERE no_ser = ? AND modelo = ? AND rol = ?',
      [no_ser, modelo, rol]
    );

    const currentCount = countRows[0].count || 0;
    if (currentCount >= 60) {
      await db.end();
      return res.status(400).json({
        error: `Esta combinación (Serie: ${no_ser}, Modelo: ${modelo}, Lado: ${rol}) ya ha alcanzado el límite de 60 registros`,
        currentCount: currentCount
      });
    }

    const [insertResult] = await db.execute(
      'INSERT INTO perfil (no_ser, modelo, rol, fr, empleado) VALUES (?, ?, ?, ?, ?)',
      [no_ser, modelo, rol, fr, empleado]
    );

    // Obtener el perfil creado
    const [newPerfil] = await db.execute(
      'SELECT * FROM perfil WHERE id = ?',
      [insertResult.insertId]
    );

    // Recalcular el conteo total para la combinación y obtener el último registro
    const [rowsAfter] = await db.execute(
      'SELECT COUNT(*) as count FROM perfil WHERE no_ser = ? AND modelo = ? AND rol = ?',
      [no_ser, modelo, rol]
    );

    const [last] = await db.execute(
      'SELECT fr, empleado FROM perfil WHERE no_ser = ? AND modelo = ? AND rol = ? ORDER BY id DESC LIMIT 1',
      [no_ser, modelo, rol]
    );

    await db.end();

    res.status(201).json({
      message: 'Perfil creado (histórico preserved) exitosamente',
      perfil: newPerfil[0],
      count: rowsAfter[0].count || 0,
      last: last.length > 0 ? last[0] : null
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
      'IAMM',
      'IAMM2',
      'IAMMD',
      'FRHC'
    ];
    
    res.json({ models });
  } catch (error) {
    console.error('Error obteniendo modelos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Lookup user by scanned/manual input (normalize and search in credentials DB)
router.get('/lookup/:employee_input', async (req, res) => {
  try {
    const raw = String(req.params.employee_input || '').trim();
    if (!raw) return res.status(400).json({ error: 'employee_input requerido' });

    // Normalize similar to POST flow
    let normalized = raw;
    const match = normalized.match(/^0*(\d+)([A-Za-z])?$/);
    if (match) {
      const number = match[1];
      const letter = match[2] || 'A';
      normalized = `${number}${letter}`;
    } else {
      normalized = normalized.replace(/^0+/, '') + 'A';
    }

    const credDbName = process.env.CRED_DB_NAME || 'credenciales';
    const credConn = await createConnection(credDbName);
    const [userRows] = await credConn.execute(
      'SELECT id, nombre, usuario, num_empleado FROM users WHERE num_empleado = ? OR usuario = ? LIMIT 1',
      [normalized, normalized]
    );
    await credConn.end();

    if (userRows.length === 0) {
      return res.json({ found: false, normalized });
    }

    const user = userRows[0];
    return res.json({ found: true, normalized, nombre: user.nombre, usuario: user.usuario });
  } catch (error) {
    console.error('Error lookup user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// GET - Obtener todos los registros para un número de serie
router.get('/records/:no_ser', async (req, res) => {
  try {
    const { no_ser } = req.params;
    const db = await createConnection();

    const [rows] = await db.execute(
      'SELECT id, no_ser, modelo, rol, fr, empleado FROM perfil WHERE no_ser = ? ORDER BY id DESC',
      [no_ser]
    );

    await db.end();

    res.json({ records: rows });
  } catch (error) {
    console.error('Error obteniendo registros por no_ser:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Estadísticas
router.get('/stats/general', async (req, res) => {
  try {
    const db = await createConnection();
    // Total de perfiles únicos (combinaciones distintas de no_ser+modelo+rol)
    const [totalPerfiles] = await db.execute(`
      SELECT COUNT(DISTINCT CONCAT(no_ser, '||', modelo, '||', rol)) as count FROM perfil
    `);

    // Contar registros por combinación y determinar activos/inactivos según el número de apariciones
    const [counts] = await db.execute(`
      SELECT no_ser, modelo, rol, COUNT(*) as cnt
      FROM perfil
      GROUP BY no_ser, modelo, rol
    `);

    let activos = 0;
    let inactivos = 0;
    let totalRegistros = 0;

    for (const row of counts) {
      totalRegistros += row.cnt;
      if (row.cnt < 60) activos += 1;
      else inactivos += 1;
    }
    
    await db.end();

    res.json({
      totalPerfiles: totalPerfiles[0].count || 0,
      totalRegistros: totalRegistros || 0,
      perfilesActivos: activos,
      perfilesInactivos: inactivos
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;