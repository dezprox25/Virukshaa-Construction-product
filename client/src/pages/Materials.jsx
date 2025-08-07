import React, { useEffect, useState } from "react";
import InventoryView from "../components/InventoryView";
import RequestView from "../components/RequestView";
import { getMaterials, getMaterialRequests } from "../services/materialService";
import { UserCircle } from "lucide-react";

const Materials = ({ setSidebarOpen }) => {
  const [materials, setMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState("inventory");

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch (err) {
      console.error("Error fetching materials", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await getMaterialRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching material requests", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchRequests();
  }, []);

  const handleUpdate = () => {
    fetchMaterials();
    fetchRequests();
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Hamburger menu */}
          <button
            className="md:hidden text-gray-600 hover:text-green-600 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Supervisor - Materials</h1>
        </div>

        <div className="flex items-center gap-10 text-xl text-gray-600">
          <UserCircle className="cursor-pointer hover:text-virukshaa-green" size={20} />
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Materials Management</h2>
            <p className="text-gray-500 text-sm">Manage inventory and material requests</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              className={`px-4 py-2 rounded font-medium text-sm ${
                view === "inventory" ? "bg-black text-white" : "bg-white border"
              }`}
              onClick={() => setView("inventory")}
            >
              Inventory
            </button>
            <button
              className={`px-4 py-2 rounded font-medium text-sm ${
                view === "requests" ? "bg-black text-white" : "bg-white border"
              }`}
              onClick={() => setView("requests")}
            >
              Requests
            </button>
          </div>
        </div>

        {/* Views */}
        {view === "inventory" ? (
          <InventoryView materials={materials} onUpdate={handleUpdate} />
        ) : (
          <RequestView requests={requests} />
        )}
      </div>
    </div>
  );
};

export default Materials;
