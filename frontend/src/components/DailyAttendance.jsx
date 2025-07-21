import './DailyAttendance.css';
import Sidebar from './Sidebar';
import AddEmployeeForm from './EmployeeForm';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DailyAttendance = () => {
  const supervisorId = localStorage.getItem('supervisorId');
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/supervisors/${supervisorId}/employees`);
      console.log('Fetched Employees:', res.data);
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        console.warn('Unexpected data:', res.data);
        setEmployees([]);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      setEmployees([]);
    }
  };

  const handleSave = async (formData) => {
    try {
      let res;
      if (editIndex !== null) {
        const empId = employees[editIndex]._id;
        res = await axios.put(`http://localhost:5000/api/supervisors/${supervisorId}/employees/${empId}`, formData);
      } else {
        res = await axios.post(`http://localhost:5000/api/supervisors/${supervisorId}/employees`, formData);
      }
      setEmployees(res.data);
      setShowForm(false);
      setEditIndex(null);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleToggleStatus = async (empId, currentStatus) => {
    const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/supervisors/${supervisorId}/employees/${empId}/status`,
        { status: newStatus }
      );
      setEmployees(res.data);
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    try {
      const empId = employees[index]._id;
      const res = await axios.delete(
        `http://localhost:5000/api/supervisors/${supervisorId}/employees/${empId}`
      );
      setEmployees(res.data);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const today = new Date().toLocaleDateString('en-GB');

  return (
    <div className="attendance-page">
      <Sidebar />
      <div className="attendance-main">
        <div className="top-header">
          <div>
            <h1>Attendance</h1>
            <p>Track daily employee attendance</p>
          </div>
          <button className="add-btn" onClick={() => { setShowForm(true); setEditIndex(null); }}>
            <FiPlus style={{ marginRight: '6px' }} /> Add Employee
          </button>
        </div>

        <div className="attendance-box">
          <div className="box-header">
            <div>
              <h2>Employee Attendance - {today}</h2>
              <p>Mark attendance and track working hours</p>
            </div>
          </div>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Status</th>
                <th>Hours Worked</th>
                <th>Daily Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No employees found.</td>
                </tr>
              ) : (
                employees.map((emp, i) => (
                  <tr key={emp._id} className={i === employees.length - 1 ? 'last-row' : ''}>
                    <td>{emp.name}</td>
                    <td>{emp.role}</td>
                    <td>
                      <button
                        className={`status-btn ${emp.status === 'Present' ? 'present' : 'absent'}`}
                        onClick={() => handleToggleStatus(emp._id, emp.status)}
                      >
                        {emp.status?.toLowerCase() || 'unknown'}
                      </button>
                    </td>
                    <td>{emp.hours || 0}h</td>
                    <td>${emp.rate || 0}</td>
                    <td>
                      <button className="icon-btn" onClick={() => handleEdit(i)}><FiEdit2 /></button>
                      <button className="icon-btn" onClick={() => handleDelete(i)}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="popup-overlay">
            <div className="popup-box">
              <AddEmployeeForm
                onClose={() => { setShowForm(false); setEditIndex(null); }}
                onSubmit={handleSave}
                initialData={editIndex !== null ? employees[editIndex] : null}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyAttendance;
