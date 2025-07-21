import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import QuickStats from './QuickStats';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import AddEmployeeForm from './EmployeeForm';
import AddMaterialForm from './MaterialForm';
import UsageForm from './UsageForm';
import EmployeeTable from './EmployeeTable';
import ClientTable from './ClientTable';
import SupervisorCards from './SupervisorTable';
import SuppliesTable from './SuppliesTable';
import { LuLogOut } from 'react-icons/lu';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const employees = [
    { name: 'John Smith', role: 'Foreman', rate: 150, status: 'Present' },
    { name: 'Mike Johnson', role: 'Carpenter', rate: 120, status: 'Present' },
    { name: 'David Brown', role: 'Laborer', rate: 100, status: 'Absent' },
    { name: 'Chris Wilson', role: 'Electrician', rate: 140, status: 'Present' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="main-area">
        <div className="content-area">
          {/* Top Bar */}
          <div className="top-bar">
            <div className="top-bar-inner">
              <div className="top-bar-title">
                <h1>Dashboard</h1>
                <p>Overview of your construction site operations</p>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                <LuLogOut className="logout-icon" />
                Logout
              </button>
            </div>
          </div>

          <StatsCards
            selectedCard={selectedCard}
            onCardClick={(title) => setSelectedCard(title)}
          />

          <div className="info-box">
            {selectedCard === 'Employees' ? (
              <EmployeeTable employees={employees} />
            ) : selectedCard === 'Clients' ? (
              <ClientTable />
            ) : selectedCard === 'Supervisors' ? (
              <SupervisorCards />
            ) : selectedCard === 'Supplies' ? (
              <SuppliesTable onAddMaterial={() => setShowMaterialForm(true)} />
            ) : (
              <>
                <div className="welcome-box">
                  <h2>Welcome back!</h2>
                  <p>Select an option above to view detailed information.</p>
                </div>
                <div className="info-grid">
                  <QuickStats />
                  <RecentActivity />
                </div>
              </>
            )}
          </div>

          <QuickActions
            onAddEmployee={() => setShowEmployeeForm(true)}
            onAddMaterial={() => setShowMaterialForm(true)}
            onRecordUsage={() => setShowUsageForm(true)}
          />
        </div>
      </div>

      {showEmployeeForm && (
        <div className="popup-overlay">
          <div className="popup-box">
            <AddEmployeeForm onClose={() => setShowEmployeeForm(false)} />
          </div>
        </div>
      )}

      {showMaterialForm && (
        <div className="popup-overlay">
          <div className="popup-box">
            <AddMaterialForm onClose={() => setShowMaterialForm(false)} />
          </div>
        </div>
      )}

      {showUsageForm && (
        <div className="popup-overlay">
          <div className="popup-box">
            <UsageForm onClose={() => setShowUsageForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
