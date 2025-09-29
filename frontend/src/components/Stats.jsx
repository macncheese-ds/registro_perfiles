import React from 'react';

const Stats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-number poppins-bold">{stats.totalPerfiles}</div>
        <div className="stat-label poppins-regular">Total Perfiles</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-number poppins-bold">{stats.perfilesActivos}</div>
        <div className="stat-label poppins-regular">Perfiles Activos</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-number poppins-bold">{stats.perfilesInactivos}</div>
        <div className="stat-label poppins-regular">Perfiles Inactivos</div>
      </div>
    </div>
  );
};

export default Stats;