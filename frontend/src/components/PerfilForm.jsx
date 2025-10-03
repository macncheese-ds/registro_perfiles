import React, { useState, useEffect } from 'react';
import { api } from '../api';
import AuthModal from './AuthModal';

const PerfilForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    no_ser: '',
    modelo: '',
    rol: 'TOP'
  });
  const [combinationCount, setCombinationCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authModalResetKey, setAuthModalResetKey] = useState(0);
  const [models, setModels] = useState([
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
  ]);

  // Cargar modelos desde el servidor cuando esté disponible
  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await api.getModels();
        setModels(data.models);
      } catch (error) {
        console.log('Usando modelos predefinidos - servidor no disponible');
        // Mantener los modelos predefinidos arriba
      }
    };
    
    loadModels();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        no_ser: initialData.no_ser || '',
        modelo: initialData.modelo || '',
        rol: initialData.rol || 'TOP',
        empleado: initialData.empleado || ''
      });
    } else {
      setFormData({
        no_ser: '',
        modelo: '',
        rol: 'TOP',
        empleado: ''
      });
    }
    setCombinationCount(null);
  }, [initialData]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Verificar el conteo cuando tenemos los 3 campos necesarios
    if (!initialData && newFormData.no_ser && newFormData.modelo && newFormData.rol) {
      try {
        const countData = await api.getCombinationCount(newFormData.no_ser, newFormData.modelo, newFormData.rol);
        // El backend ahora devuelve { count, canRegister, last }
        setCombinationCount(countData);
      } catch (error) {
        setCombinationCount(null);
      }
    } else {
      setCombinationCount(null);
    }
  };

  // Open auth modal instead of submitting inline employee/password
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate basic form fields first
    if (!formData.no_ser || !formData.modelo || !formData.rol) return;
    setAuthModalVisible(true);
  };

  const handleAuthConfirm = async ({ employee_input, password }) => {
    // Do NOT close modal until we know the result. Keep it open on error and reset inputs.
    setAuthError(null);
    setLoading(true);
    try {
      const payload = { ...formData, employee_input, password };
      await onSubmit(payload);

      // success -> close modal and reset form and modal state
      setAuthModalVisible(false);
      setAuthModalResetKey(k => k + 1);
      setAuthError(null);

      if (!initialData) {
        setFormData({ no_ser: '', modelo: '', rol: 'TOP' });
        setCombinationCount(null);
      }
    } catch (error) {
      // Show error in modal and reset modal inputs so credentials are not retained
      const message = error && error.message ? error.message : 'Error autenticando';
      setAuthError(message);
      // remount modal to clear internal fields
      setAuthModalResetKey(k => k + 1);
      setAuthModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const canRegister = !combinationCount || combinationCount.canRegister;

  return (
    <div className="form-container">
      <h2 className="form-title poppins-semibold">
        {initialData ? 'Editar Perfil' : 'Nuevo Perfil'}
      </h2>

      {combinationCount && !initialData && (
        <div className={`alert ${canRegister ? 'alert-info' : 'alert-error'}`}>
          <div className="counter-display">
            <span className="combination">
              <strong>{combinationCount.no_ser}</strong> + 
              <strong>{combinationCount.modelo}</strong> + 
              <strong>{combinationCount.rol}</strong>
            </span>
            <br />
            <span className="count-info">
              Se ha registrado <strong>{combinationCount.count}</strong> {combinationCount.count === 1 ? 'vez' : 'veces'}
              {combinationCount.count > 0 && ` - Al registrar será la ${combinationCount.count + 1}ª vez`}
            </span>
            {!canRegister && (
              <div className="limit-warning">
                <strong>Límite alcanzado</strong> - Máximo 60 registros por número de serie
              </div>
            )}
            {combinationCount.last && (
              <div style={{ marginTop: '8px', color: '#4a5568' }}>
                Último registro: <strong>{combinationCount.last.empleado}</strong> • {combinationCount.last.fr}
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label poppins-medium">
              Número de Serie *
            </label>
            <input
              type="text"
              name="no_ser"
              value={formData.no_ser}
              onChange={handleInputChange}
              className="form-input poppins-regular"
              placeholder="Ej: SER001"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label poppins-medium">
              Modelo *
            </label>
            <select
              name="modelo"
              value={formData.modelo}
              onChange={handleInputChange}
              className="form-select poppins-regular"
              required
            >
              <option value="">Seleccionar modelo...</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label poppins-medium">
              Lado *
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              className="form-select poppins-regular"
              required
            >
              <option value="TOP">TOP</option>
              <option value="BOT">BOT</option>
            </select>
          </div>

          {/* employee and password are collected in the auth modal on submit */}
        </div>

        <div className="form-actions">
          {initialData && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary poppins-medium"
            >
              Cancelar
            </button>
          )}
              <button
                type="submit"
                disabled={loading || (!initialData && !canRegister)}
                className="btn btn-primary poppins-medium"
              >
                {loading ? 'Procesando...' : (initialData ? 'Actualizar' : 'Registrar')}
              </button>
        </div>
      </form>
      <AuthModal
        key={authModalResetKey}
        visible={authModalVisible}
        onClose={() => { setAuthModalVisible(false); setAuthError(null); }}
        onConfirm={handleAuthConfirm}
        error={authError}
      />
    </div>
  );
};

export default PerfilForm;