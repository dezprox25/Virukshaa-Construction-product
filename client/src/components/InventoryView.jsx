import React, { useState } from "react";
import {
  Package,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Edit,
  ShoppingCart,
  PlusCircle,
} from "lucide-react";

import RequestMaterialModal from "./RequestMaterialModal";
import AddMaterialModal from "./AddMaterialModal";

const InventoryView = ({ materials, onUpdate }) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const categories = [...new Set(materials.map((m) => m.category))];
  const statuses = ["In Stock", "Low Stock", "Out of Stock", "On Order"];

  const filtered = materials.filter((mat) => {
    return (
      mat.name.toLowerCase().includes(search.toLowerCase()) &&
      (!categoryFilter || mat.category === categoryFilter) &&
      (!statusFilter || mat.status === statusFilter)
    );
  });

  const totalValue = materials.reduce(
    (acc, mat) => acc + mat.currentStock * mat.pricePerUnit,
    0
  );
  const lowStockCount = materials.filter((m) => m.status === "Low Stock").length;
  const outOfStockCount = materials.filter((m) => m.status === "Out of Stock").length;

  const handleUpdate = (mat) => {
    setSelectedMaterial(mat);
    setShowAddModal(true);
  };

  const handleRequest = (mat) => {
    setSelectedMaterial(mat);
    setShowRequestModal(true);
  };

  const handleAdd = () => {
    setSelectedMaterial(null);
    setShowAddModal(true);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border p-4 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Total Materials</span>
            <Package className="text-blue-600" size={20} />
          </div>
          <h2 className="text-2xl font-semibold mt-2">{materials.length}</h2>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Low Stock Items</span>
            <AlertTriangle className="text-yellow-500" size={20} />
          </div>
          <h2 className="text-2xl font-semibold mt-2">{lowStockCount}</h2>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Out of Stock</span>
            <ArrowDownRight className="text-red-500" size={20} />
          </div>
          <h2 className="text-2xl font-semibold mt-2">{outOfStockCount}</h2>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Total Value</span>
            <ArrowUpRight className="text-green-600" size={20} />
          </div>
          <h2 className="text-2xl font-semibold mt-2">${totalValue}</h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 rounded-lg border bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border px-3 py-2 rounded-lg"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <button
            className="px-3 py-2 rounded-lg border bg-black text-white hover:opacity-90"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
              setStatusFilter("");
            }}
          >
            Clear Filters
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 gap-2 bg-black text-white text-sm rounded hover:opacity-90 w-fit"
        >
          <PlusCircle size={16} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((mat) => (
          <div key={mat._id} className="bg-white border rounded-xl p-5 shadow relative">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg">{mat.name}</h2>
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  mat.status === "Out of Stock"
                    ? "bg-red-100 text-red-700"
                    : mat.status === "Low Stock"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {mat.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">{mat.category}</p>
            <p className="mb-2">Current Stock: {mat.currentStock} {mat.unit}</p>
            <p className="mb-2">Reorder Level: {mat.reorderLevel} {mat.unit}</p>
            <p className="mb-2">Price per {mat.unit}: ${mat.pricePerUnit}</p>
            <p className="mb-2">Supplier: {mat.supplier || "N/A"}</p>
            <p className="text-sm text-gray-400">
              Last Updated:{" "}
              {mat.lastUpdated && !isNaN(new Date(mat.lastUpdated))
                ? new Date(mat.lastUpdated).toLocaleDateString()
                : "Not available"}
            </p>

            <div className="flex gap-6 mt-4">
              <button
                className="flex items-center gap-2 border px-8 py-2 text-sm rounded-lg hover:bg-gray-50"
                onClick={() => handleUpdate(mat)}
              >
                <Edit size={20} /> Update Stock
              </button>
              <button
                className="flex items-center gap-2 border px-8 py-2 text-sm rounded-lg hover:bg-gray-50"
                onClick={() => handleRequest(mat)}
              >
                <ShoppingCart size={20} /> Request
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddMaterialModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMaterial(null);
          }}
          material={selectedMaterial}
          onSuccess={onUpdate}
        />
      )}

      {showRequestModal && (
        <RequestMaterialModal
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedMaterial(null);
          }}
          prefillMaterial={selectedMaterial}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
};

export default InventoryView;
