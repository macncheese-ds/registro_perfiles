import React, { useEffect, useState } from 'react';
import { api } from '../api';

const RecordsModal = ({ no_ser, onClose }) => {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!no_ser) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await api.getRecords(no_ser);
        setRecords(data.records || []);
      } catch (err) {
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [no_ser]);

  return (
    <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-card" style={{ maxHeight: '80vh', overflow: 'auto', width: '900px', maxWidth: '95%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Historial: {no_ser}</h3>
          <button onClick={onClose} className="btn btn-ghost">Cerrar</button>
        </div>

        <div style={{ marginTop: '12px' }}>
          {loading && <div>Cargando...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && !error && records && records.length === 0 && (
            <div>No hay registros para este número de serie.</div>
          )}

          {!loading && !error && records && records.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Modelo</th>
                  <th>Lado</th>
                  <th>Fecha</th>
                  <th>Empleado</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.modelo}</td>
                    <td>{r.rol}</td>
                    <td>{r.fr}</td>
                    <td>{r.empleado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordsModal;
