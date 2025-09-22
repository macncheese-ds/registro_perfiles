import React from 'react';

const PerfilList = ({ perfiles, pagination, currentPage, onPageChange, onEdit, onDelete, loading }) => {
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
          {/* Vista de tabla para desktop */}
          <div className="desktop-only" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th className="poppins-semibold">ID</th>
                  <th className="poppins-semibold">No. Serie</th>
                  <th className="poppins-semibold">Modelo</th>
                  <th className="poppins-semibold">Lado</th>
                  <th className="poppins-semibold">Fecha Registro</th>
                  <th className="poppins-semibold">Empleado</th>
                  <th className="poppins-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {perfiles.map((perfil) => (
                  <tr key={perfil.id}>
                    <td className="poppins-regular">{perfil.id}</td>
                    <td className="poppins-medium">{perfil.no_ser}</td>
                    <td className="poppins-regular">{perfil.modelo}</td>
                    <td>
                      <span className={`badge ${perfil.rol === 'TOP' ? 'badge-top' : 'badge-bot'} poppins-medium`}>
                        {perfil.rol}
                      </span>
                    </td>
                    <td className="poppins-regular">{formatDate(perfil.fr)}</td>
                    <td className="poppins-regular">{perfil.empleado}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onEdit(perfil)}
                          className="btn btn-secondary poppins-medium"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(perfil.id)}
                          className="btn btn-danger poppins-medium"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista de tarjetas para móvil */}
          <div className="mobile-only" style={{ padding: '15px' }}>
            {perfiles.map((perfil) => (
              <div key={perfil.id} style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
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
                    <div className="poppins-regular" style={{ fontSize: '0.9rem', color: '#718096' }}>
                      ID: {perfil.id}
                    </div>
                  </div>
                  <span className={`badge ${perfil.rol === 'TOP' ? 'badge-top' : 'badge-bot'} poppins-medium`}>
                    {perfil.rol}
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div className="poppins-medium" style={{ fontSize: '0.95rem', marginBottom: '4px' }}>
                    {perfil.modelo}
                  </div>
                  <div className="poppins-regular" style={{ fontSize: '0.85rem', color: '#718096' }}>
                    {perfil.empleado} • {formatDate(perfil.fr)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onEdit(perfil)}
                    className="btn btn-secondary poppins-medium"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', flex: '1' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(perfil.id)}
                    className="btn btn-danger poppins-medium"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', flex: '1' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

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