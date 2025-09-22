import React, { useState, useEffect } from 'react';
import { api } from './api';
import PerfilForm from './components/PerfilForm';
import PerfilList from './components/PerfilList';
import Stats from './components/Stats';

function App() {
  const [perfiles, setPerfiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingPerfil, setEditingPerfil] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [perfilesData, statsData] = await Promise.all([
        api.getPerfiles(currentPage, 10),
        api.getStats()
      ]);
      
      setPerfiles(perfilesData.perfiles);
      setPagination(perfilesData.pagination);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (perfilData) => {
    try {
      setError(null);
      
      if (editingPerfil) {
        await api.updatePerfil(editingPerfil.id, perfilData);
        setSuccess('Perfil actualizado exitosamente');
        setEditingPerfil(null);
      } else {
        await api.createPerfil(perfilData);
        setSuccess('Perfil creado exitosamente');
      }
      
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (perfil) => {
    setEditingPerfil(perfil);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este perfil?')) {
      try {
        await api.deletePerfil(id);
        setSuccess('Perfil eliminado exitosamente');
        loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPerfil(null);
    setError(null);
    setSuccess(null);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading && !perfiles.length) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div className="loading">
            <div className="spinner"></div>
            <span style={{ marginLeft: '10px' }}>Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="header">
          <h1 className="poppins-bold">Registro de Perfiles</h1>
          <p className="poppins-regular">Sistema de control de perfiles por combinación Serie + Modelo + Lado</p>
        </div>

        {/* Alertas */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button 
              onClick={clearMessages} 
              style={{ float: 'right', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
            <button 
              onClick={clearMessages} 
              style={{ float: 'right', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Estadísticas */}
        {stats && <Stats stats={stats} />}

        {/* Formulario */}
        <PerfilForm 
          onSubmit={handleSubmit}
          initialData={editingPerfil}
          onCancel={handleCancelEdit}
        />

        {/* Lista de perfiles */}
        <PerfilList 
          perfiles={perfiles}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;