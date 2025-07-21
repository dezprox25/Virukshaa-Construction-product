import React from 'react';
import {Plus,PackagePlus,ClipboardEdit,Wallet} from 'lucide-react';
import './QuickActions.css';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ onAddEmployee, onAddMaterial, onRecordUsage}) => {
   const navigate = useNavigate();
  const actions = [
    { label: 'Add Employee', icon: <Plus />, primary: true, onClick: onAddEmployee },
    { label: 'Add Material', icon: <PackagePlus />, primary: false, onClick: onAddMaterial },
    { label: 'Record Usage', icon: <ClipboardEdit />, primary: false, onClick: onRecordUsage },
    { label: 'View Payroll', icon: <Wallet />, primary: false, onClick: () => navigate('/payroll') },
  ];

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <p>Common tasks and shortcuts</p>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`action-btn ${action.primary ? 'primary' : 'secondary'}`}
            onClick={action.onClick}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
