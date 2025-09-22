import React from 'react';

const Stats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-number poppins-bold">{stats.total}</div>
        <div className="stat-label poppins-regular">Total Perfiles</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-number poppins-bold">{stats.today}</div>
        <div className="stat-label poppins-regular">Registros Hoy</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-number poppins-bold">{stats.limitReached}</div>
        <div className="stat-label poppins-regular">Series con Límite</div>
      </div>
      
      {stats.roles.map((rol) => (
        <div key={rol.rol} className="stat-card">
          <div className="stat-number poppins-bold">{rol.count}</div>
          <div className="stat-label poppins-regular">Lado {rol.rol}</div>
        </div>
      ))}
    </div>
  );
};

export default Stats;