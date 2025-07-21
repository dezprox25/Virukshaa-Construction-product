import React from 'react';
import { Package, CalendarDays } from 'lucide-react'; 
import './QuickStats.css';

const QuickStats = () => {
  return (
    <div className="quick-stats">
      <h3>Quick Stats</h3>
      
      <div className="stat-row">
        <div className="stat-info">
          <p className="stat-title">Active Projects</p>
          <p className="stat-value">8</p>
        </div>
        <div className="stat-icon gray-bg">
          <Package size={28} />
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-info">
          <p className="stat-title">Pending Tasks</p>
          <p className="stat-value">14</p>
        </div>
        <div className="stat-icon yellow-bg">
          <CalendarDays size={28} />
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
