import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ListTodo,
  Package,
  Building2,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Sidebar overlay on small screens */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden transition-opacity duration-300 ${isOpen ? "block" : "hidden"}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white p-6 border-r border-gray-200 transition-transform duration-300 transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <Building2 size={22} strokeWidth={1.5} /> Virukshaa
          </h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-3">
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/task" icon={<ListTodo size={18} />} label="Task" />
          <NavItem to="/employees" icon={<Users size={18} />} label="Employee" />
          <NavItem to="/dailylogs" icon={<ClipboardList size={18} />} label="Daily Logs" />
          <NavItem to="/materials" icon={<Package size={18} />} label="Materials" />
        </nav>
      </div>
    </>
  );
};

const NavItem = ({ icon, label, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded text-sm transition
         ${isActive ? "bg-green-50 text-green-600 font-medium" : "text-gray-700 hover:bg-gray-100"}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;
