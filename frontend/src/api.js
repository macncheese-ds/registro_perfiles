// Use relative API base (Vite dev proxy or production host)
const API_BASE_URL = (window.__API_BASE__ && window.__API_BASE__) || '/api';

export const api = {
  // Obtener todos los perfiles
  getPerfiles: async (page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/perfiles?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Error obteniendo perfiles');
    return response.json();
  },

  // Crear nuevo perfil
  createPerfil: async (perfil) => {
    const response = await fetch(`${API_BASE_URL}/perfiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(perfil),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error creando perfil');
    return data;
  },

  // Obtener conteo de registros por combinación
  getCombinationCount: async (no_ser, modelo, rol) => {
    if (!no_ser || !modelo || !rol) return null;
    const response = await fetch(`${API_BASE_URL}/perfiles/count/${no_ser}/${modelo}/${rol}`);
    if (!response.ok) throw new Error('Error obteniendo conteo');
    return response.json();
  },

  // Obtener perfil por ID
  getPerfil: async (id) => {
    const response = await fetch(`${API_BASE_URL}/perfiles/${id}`);
    if (!response.ok) throw new Error('Error obteniendo perfil');
    return response.json();
  },

  // Actualizar perfil
  updatePerfil: async (id, perfil) => {
    const response = await fetch(`${API_BASE_URL}/perfiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(perfil),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error actualizando perfil');
    return data;
  },

  // Eliminar perfil
  deletePerfil: async (id) => {
    const response = await fetch(`${API_BASE_URL}/perfiles/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error eliminando perfil');
    }
    return response.json();
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/perfiles/stats/general`);
    if (!response.ok) throw new Error('Error obteniendo estadísticas');
    return response.json();
  },

  // Obtener modelos disponibles
  getModels: async () => {
    const endpoints = [
      `${API_BASE_URL}/perfiles/models`,
      `http://${window.location.hostname}:6001/api/perfiles/models`,
      `http://${window.location.hostname}:6000/api/perfiles/models`
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url);
        if (response.ok) return response.json();
      } catch (err) {
        // try next
      }
    }

    // Final fallback: built-in list
    return { models: [
      'MGH100 RCU','MGH100 BL7','IDB PLOCK','IDB MAIN','IDB IPTS','POWER PACK','MGH MOCI','MGH100 ESC','FCM 30W','MRR35','IAMM','IAMM2','IAMMD','FRHC'
    ] };
  },

  // Lookup employee (scan/manual) to know if user exists and normalized value
  lookupEmployee: async (employee_input) => {
    const response = await fetch(`${API_BASE_URL}/perfiles/lookup/${encodeURIComponent(employee_input)}`);
    if (!response.ok) throw new Error('Error en lookup');
    return response.json();
  },

  // Obtener todos los registros por numero de serie
  getRecords: async (no_ser) => {
    const response = await fetch(`${API_BASE_URL}/perfiles/records/${encodeURIComponent(no_ser)}`);
    if (!response.ok) throw new Error('Error obteniendo registros');
    return response.json();
  },
};