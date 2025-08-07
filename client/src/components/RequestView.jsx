import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Clock3,
  Truck,
  CheckCircle,
  Filter,
  Pencil,
  XCircle,
  PlusCircle,
  Search,
} from "lucide-react";
import {
  getMaterialRequests,
  deleteMaterialRequest,
  getMaterials,
} from "../services/materialService";
import RequestMaterialModal from "./RequestMaterialModal";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  ordered: "bg-purple-100 text-purple-800",
  "in transit": "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const RequestView = () => {
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editRequest, setEditRequest] = useState(null);

  const loadData = async () => {
    const data = await getMaterialRequests();
    setRequests(data);
    const materialList = await getMaterials();
    setMaterials(materialList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
  };

  const handleDelete = async (id) => {
    await deleteMaterialRequest(id);
    loadData();
  };

  const filteredRequests = requests.filter((req) => {
    const matchesName = req.material?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      req.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesName && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border p-4 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Total Requests</span>
            <ShoppingCart className="text-blue-600" size={18} />
          </div>
          <h2 className="text-2xl font-semibold mt-2">{requests.length}</h2>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Pending Approval</span>
            <Clock3 className="text-yellow-500" size={18} />
          </div>
          <h2 className="text-2xl font-semibold mt-2">
            {requests.filter((r) => r.status?.toLowerCase() === "pending").length}
          </h2>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">In Transit</span>
            <Truck className="text-orange-500" size={18} />
          </div>
          <h2 className="text-2xl font-semibold mt-2">
            {requests.filter((r) => r.status?.toLowerCase() === "in transit").length}
          </h2>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Delivered</span>
            <CheckCircle className="text-green-600" size={18} />
          </div>
          <h2 className="text-2xl font-semibold mt-2">
            {requests.filter((r) => r.status?.toLowerCase() === "delivered").length}
          </h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search requests..."
              className="pl-10 pr-4 py-2 rounded-lg border w-full"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <Filter className="text-gray-500" size={20} />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Ordered">Ordered</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>

          <span className="px-2 rounded-full bg-gray-200 border border-gray-300 text-xs">
            {filteredRequests.length} Items
          </span>

          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border bg-black text-white hover:opacity-90"
          >
            Clear Filters
          </button>
        </div>

        <button
          onClick={() => {
            setEditRequest(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 w-fit"
        >
          <PlusCircle size={18} />
          Request Material
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map((req) => (
          <div key={req._id} className="bg-white border rounded-xl p-5 shadow relative">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg capitalize">{req.material}</h2>
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  statusStyles[req.status?.toLowerCase()] || "bg-gray-100 text-gray-800"
                }`}
              >
                {req.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{req.project || "General"}</p>
            <p className="text-sm mb-1">Quantity: {req.quantity}</p>
            <p className="text-sm mb-1">Requested: {req.requestedDate?.slice(0, 10)}</p>
            <p className="text-sm mb-1">Required: {req.requiredDate?.slice(0, 10)}</p>
            <p className="text-sm mb-1">Supervisor: {req.supervisor || "—"}</p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditRequest(req);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 border px-4 py-2 text-sm rounded-lg hover:bg-gray-50"
              >
                <Pencil size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(req._id)}
                className="flex items-center gap-2 border border-red-500 px-4 py-2 text-sm text-white rounded-lg bg-red-500 hover:bg-red-600"
              >
                <XCircle size={18} /> Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <RequestMaterialModal
          onClose={() => {
            setShowModal(false);
            setEditRequest(null);
          }}
          onRequested={loadData}
          materials={materials}
          existingRequest={editRequest}
        />
      )}
    </div>
  );
};

export default RequestView;
