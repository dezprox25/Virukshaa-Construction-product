import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuUsers, LuPackageOpen } from 'react-icons/lu';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-6 rounded-xl border border-sidebar-gray-400">
        <div className="flex items-center gap-2 mb-2 text-gray-800">
          <LuUsers className="text-2xl" />
          <h3 className="text-2xl font-bold">Mark Attendance</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Record worker attendance for today</p>
        <button
          className="bg-black text-white px-4 py-2 rounded w-full font-semibold text-sm hover:bg-hoverblack transition"
          onClick={() => navigate('/employees')}
        >
          Take Attendance
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-sidebar-gray-400">
        <div className="flex items-center gap-2 mb-2 text-gray-800">
          <LuPackageOpen className="text-2xl" />
          <h3 className="text-2xl font-bold">Material Request</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Request additional materials</p>
        <button
          className="bg-black text-white px-4 py-2 rounded w-full font-semibold text-sm hover:bg-hoverblack transition"
          onClick={() => navigate('/materials')}
        >
          Request Materials
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
