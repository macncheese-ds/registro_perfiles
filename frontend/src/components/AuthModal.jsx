import React, { useState, useEffect } from 'react';
import { api } from '../api';

const AuthModal = ({ visible, onClose, onConfirm, error }) => {
  const [mode, setMode] = useState('scan'); // 'scan' | 'manual'
  const [employeeInput, setEmployeeInput] = useState('');
  const [password, setPassword] = useState('');
  const [lookup, setLookup] = useState({ loading: false, found: null, normalized: null, nombre: null });
  const [internalError, setInternalError] = useState(null);
  const inputRef = React.createRef();

  useEffect(() => {
    if (!employeeInput) {
      setLookup({ loading: false, found: null, normalized: null, nombre: null });
      return;
    }

    let mounted = true;
    const doLookup = async () => {
      try {
        setLookup(prev => ({ ...prev, loading: true }));
        const res = await api.lookupEmployee(employeeInput);
        if (!mounted) return;
        setLookup({ loading: false, found: !!res.found, normalized: res.normalized, nombre: res.nombre || null });
      } catch (err) {
        if (!mounted) return;
        setLookup({ loading: false, found: null, normalized: null, nombre: null });
      }
    };

    // small debounce
    const t = setTimeout(doLookup, 300);
    return () => { mounted = false; clearTimeout(t); };
  }, [employeeInput]);

  useEffect(() => {
    // when parent passes an error (auth failed), show it and clear password
    if (error) {
      setInternalError(error);
      setPassword('');
    } else {
      setInternalError(null);
    }
  }, [error]);

  useEffect(() => {
    if (visible && inputRef.current) inputRef.current.focus();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 className="poppins-medium">Autenticación</h3>

        {/* If lookup found the user, show normalized and only ask password */}
        {lookup.found ? (
          <>
            <div style={{ marginBottom: '8px' }}>
              <div className="poppins-medium">Usuario detectado: <strong>{lookup.nombre || lookup.normalized}</strong></div>
              <div className="poppins-regular" style={{ color: '#718096' }}>Empleado: {lookup.normalized}</div>
            </div>

            <div className="form-group">
              <label className="form-label poppins-medium">Contraseña</label>
              <input
                type="password"
                className="form-input poppins-regular"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '8px' }}>
              <button
                className={`btn ${mode === 'scan' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('scan')}
                style={{ marginRight: '8px' }}
              >Escanear</button>
              <button
                className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('manual')}
              >Manual</button>
            </div>

            <div className="form-group">
              <label className="form-label poppins-medium">Gaffet / Número empleado</label>
              <input
                ref={inputRef}
                className="form-input poppins-regular"
                placeholder={mode === 'scan' ? 'Escanear o pegar valor' : 'Ingresar número (ej: 179)'}
                value={employeeInput}
                onChange={(e) => setEmployeeInput(e.target.value)}
              />
              {lookup.loading && <div style={{ fontSize: '0.85rem', color: '#718096' }}>Buscando usuario...</div>}
            </div>

            <div className="form-group">
              <label className="form-label poppins-medium">Contraseña</label>
              <input
                type="password"
                className="form-input poppins-regular"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm({ employee_input: lookup.normalized || employeeInput, password })}
          >Confirmar</button>
        </div>
        {internalError && (
          <div style={{ marginTop: '12px', color: '#c53030' }} className="poppins-regular">
            {internalError}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
