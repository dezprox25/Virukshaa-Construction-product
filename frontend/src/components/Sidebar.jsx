import { useLocation, useNavigate } from 'react-router-dom';
import { LuGauge, LuUsers, LuCalendarDays, LuHardHat, LuPackage, LuWallet } from 'react-icons/lu';
import './Sidebar.css';
import logo from './logo.jpeg';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: 'Dashboard', icon: <LuGauge />, path: '/dashboard' },
    { label: 'Daily Attendance', icon: <LuUsers />, path: '/daily-attendance' },
    { label: 'Monthly Attendance', icon: <LuCalendarDays />, path: '/monthly-attendance' },
    { label: 'Supervisor', icon: <LuHardHat />, path: '/supervisor' },
    { label: 'Materials', icon: <LuPackage />, path: '/materials' },
    { label: 'Payroll', icon: <LuWallet />, path: '/payroll' },
  ];

  return (
    <div className="side">
      <div className="side-top">
        <img src={logo} alt="Logo" className="side-logo" />
        <h2 className="side-title">BuildTrack</h2>
      </div>
      <div className="side-menu">
        {items.map((item, index) => (
          <button
            key={index}
            className={`menu-btn ${location.pathname === item.path ? 'selected' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
