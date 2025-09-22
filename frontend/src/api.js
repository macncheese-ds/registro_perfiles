// Forzar uso de proxy nginx mientras debuggeamos
const API_BASE_URL = '/api';

console.log('Location:', window.location.hostname, window.location.port, typeof window.location.port);
console.log('API_BASE_URL FORZADO:', API_BASE_URL);

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
    const response = await fetch(`${API_BASE_URL}/perfiles/models`);
    if (!response.ok) throw new Error('Error obteniendo modelos');
    return response.json();
  },
};