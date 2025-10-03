import React, { useState } from 'react';
import RecordsModal from './RecordsModal';

const PerfilList = ({ perfiles, pagination, currentPage, onPageChange, loading }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  if (loading && !perfiles.length) {
    return (
      <div className="table-container">
        <div className="loading">
          <div className="spinner"></div>
          <span>Cargando perfiles...</span>
        </div>
      </div>
    );
  }

  // El backend ahora devuelve un perfil por número de serie con `count` y los datos del último registro
  const perfilesActivos = perfiles.filter(perfil => (perfil.count ?? 0) < 60);
  const perfilesInactivos = perfiles.filter(perfil => (perfil.count ?? 0) >= 60);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState(null);

  const renderPerfilCard = (perfil, showBanner = false) => (
    <div key={perfil.id} style={{
      backgroundColor: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      {showBanner && perfil.counts >= 60 && (
        <div style={{
          backgroundColor: '#fed7d7',
          border: '1px solid #feb2b2',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          <div className="poppins-semibold" style={{ color: '#c53030', fontSize: '0.9rem' }}>
            Límite alcanzado - Máximo 60 registros por número de serie
          </div>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div>
          <div className="poppins-semibold" style={{ fontSize: '1.1rem', color: '#2d3748' }}>
            {perfil.no_ser}
          </div>
          {/* ID oculto por petición del usuario */}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <span className={`badge ${perfil.rol === 'TOP' ? 'badge-top' : 'badge-bot'} poppins-medium`}>
            {perfil.rol}
          </span>
          <span className={`badge ${perfil.count >= 60 ? 'badge-inactive' : 'badge-active'} poppins-medium`}>
            {perfil.count >= 60 ? 'Inactivo' : 'Activo'}
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <div className="poppins-medium" style={{ fontSize: '0.95rem', marginBottom: '4px' }}>
          {perfil.modelo}
        </div>
        <div className="poppins-regular" style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '4px' }}>
          {perfil.empleado} • {formatDate(perfil.fr)}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="poppins-medium" style={{ fontSize: '0.9rem', color: '#4299e1' }}>
            Registros: {perfil.count ?? 0}/60
          </div>
          <button
            title="Ver historial"
            onClick={() => { setSelectedSerie(perfil.no_ser); setModalOpen(true); }}
            className="btn btn-ghost"
            style={{ padding: '6px 8px', borderRadius: '8px' }}
          >
            ℹ️
          </button>
        </div>
      </div>
    </div>
  );

  const renderPerfilRow = (perfil, showBanner = false) => (
    <React.Fragment key={perfil.id}>
      {showBanner && (perfil.count ?? 0) >= 60 && (
  <tr>
          <td colSpan="8" style={{ padding: '12px', backgroundColor: '#fed7d7', border: '1px solid #feb2b2' }}>
            <div style={{ textAlign: 'center' }}>
              <span className="poppins-semibold" style={{ color: '#c53030', fontSize: '0.9rem' }}>
                Límite alcanzado - Máximo 60 registros por número de serie
              </span>
            </div>
          </td>
        </tr>
      )}
      <tr>
        {/* ID eliminado por petición del usuario */}
        <td className="poppins-medium">{perfil.no_ser}</td>
        <td className="poppins-regular">{perfil.modelo}</td>
        <td>
          <span className={`badge ${perfil.rol === 'TOP' ? 'badge-top' : 'badge-bot'} poppins-medium`}>
            {perfil.rol}
          </span>
        </td>
        <td className="poppins-medium">{perfil.count ?? 0}</td>
        <td>
          <span className={`badge ${(perfil.count ?? 0) >= 60 ? 'badge-inactive' : 'badge-active'} poppins-medium`}>
            {(perfil.count ?? 0) >= 60 ? 'Inactivo' : 'Activo'}
          </span>
        </td>
        <td className="poppins-regular">{formatDate(perfil.fr)}</td>
        <td className="poppins-regular">{perfil.empleado}</td>
        <td>
          <button
            title="Ver historial"
            onClick={() => { setSelectedSerie(perfil.no_ser); setModalOpen(true); }}
            className="btn btn-ghost"
            style={{ padding: '6px 8px', borderRadius: '8px' }}
          >Historial</button>
        </td>
      </tr>
    </React.Fragment>
  );

  return (
    <div className="table-container">
      <div className="table-header">
        <h3 className="table-title poppins-semibold">Lista de Perfiles</h3>
        {pagination && (
          <p className="poppins-regular" style={{ color: '#718096', marginTop: '5px' }}>
            Mostrando {perfiles.length} de {pagination.total} perfiles
          </p>
        )}
      </div>

      {perfiles.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
          <p className="poppins-regular">No hay perfiles registrados</p>
        </div>
      ) : (
        <>
          {/* Sección de Perfiles Activos */}
          {perfilesActivos.length > 0 && (
            <>
              <div style={{ marginTop: '20px', marginBottom: '15px' }}>
                <h4 className="poppins-semibold" style={{ color: '#4299e1', fontSize: '1.1rem' }}>
                  Perfiles Activos ({perfilesActivos.length})
                </h4>
              </div>

              {/* Vista de tabla para desktop */}
              <div className="desktop-only" style={{ overflowX: 'auto', marginBottom: '30px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th className="poppins-semibold">No. Serie</th>
                      <th className="poppins-semibold">Modelo</th>
                      <th className="poppins-semibold">Lado</th>
                      <th className="poppins-semibold">Registros</th>
                      <th className="poppins-semibold">Estado</th>
                      <th className="poppins-semibold">Fecha Registro</th>
                      <th className="poppins-semibold">Empleado</th>
                      <th className="poppins-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfilesActivos.map((perfil) => renderPerfilRow(perfil, false))}
                  </tbody>
                </table>
              </div>

              {/* Vista de tarjetas para móvil */}
              <div className="mobile-only" style={{ padding: '15px', marginBottom: '30px' }}>
                {perfilesActivos.map((perfil) => renderPerfilCard(perfil, false))}
              </div>
            </>
          )}

          {/* Sección de Perfiles Inactivos */}
          {perfilesInactivos.length > 0 && (
            <>
              <div style={{ marginTop: '20px', marginBottom: '15px' }}>
                <h4 className="poppins-semibold" style={{ color: '#e53e3e', fontSize: '1.1rem' }}>
                  Perfiles Inactivos ({perfilesInactivos.length})
                </h4>
              </div>

              {/* Vista de tabla para desktop */}
              <div className="desktop-only" style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th className="poppins-semibold">No. Serie</th>
                      <th className="poppins-semibold">Modelo</th>
                      <th className="poppins-semibold">Lado</th>
                      <th className="poppins-semibold">Registros</th>
                      <th className="poppins-semibold">Estado</th>
                      <th className="poppins-semibold">Fecha Registro</th>
                      <th className="poppins-semibold">Empleado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfilesInactivos.map((perfil) => renderPerfilRow(perfil, true))}
                  </tbody>
                </table>
              </div>

              {/* Vista de tarjetas para móvil */}
              <div className="mobile-only" style={{ padding: '15px' }}>
                {perfilesInactivos.map((perfil) => renderPerfilCard(perfil, true))}
              </div>
            </>
          )}

      {modalOpen && (
        <RecordsModal no_ser={selectedSerie} onClose={() => setModalOpen(false)} />
      )}

          {/* Paginación */}
          {pagination && pagination.pages > 1 && (
            <div style={{ 
              padding: '20px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '10px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn btn-secondary poppins-medium"
                style={{ padding: '8px 16px' }}
              >
                Anterior
              </button>
              
              <span className="poppins-regular" style={{ color: '#4a5568' }}>
                Página {currentPage} de {pagination.pages}
              </span>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= pagination.pages}
                className="btn btn-secondary poppins-medium"
                style={{ padding: '8px 16px' }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerfilList;