import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DailyAttendance from './components/DailyAttendance';
import MonthlyAttendance from './components/MonthlyAttendance';
import SupervisorDashboard from './components/SupervisorDashboard';
import MaterialPage from './components/MaterialPage';
import PayrollPage from './components/PayrollPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/daily-attendance" element={<DailyAttendance />} />
        <Route path="/monthly-attendance" element={<MonthlyAttendance />} />
        <Route path="/supervisor" element={<SupervisorDashboard />} />
        <Route path="/materials" element={<MaterialPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
      </Routes>
    </Router>
  );
}

export default App;
