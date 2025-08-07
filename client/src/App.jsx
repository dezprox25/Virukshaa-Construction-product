import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Task from "./pages/Task";
import DailyLogs from "./pages/DailyLogs";
import Materials from "./pages/Materials";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex relative">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 bg-gray-50 min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0 md:ml-64"}`}>
        <Routes>
          <Route path="/" element={<Dashboard setSidebarOpen={setSidebarOpen} />} />
          <Route path="/employees" element={<Employees setSidebarOpen={setSidebarOpen} />} />
          <Route path="/task" element={<Task setSidebarOpen={setSidebarOpen} />} />
          <Route path="/dailylogs" element={<DailyLogs setSidebarOpen={setSidebarOpen} />} />
          <Route path="/materials" element={<Materials setSidebarOpen={setSidebarOpen} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
