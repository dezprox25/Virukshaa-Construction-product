
import React, { useState, useEffect } from 'react';
import './CommonForm.css';
import { FiChevronDown, FiX } from 'react-icons/fi';

const AddEmployeeForm = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rate: '',
    status: 'Present',
    hours: 8
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form className="common-form" onSubmit={handleSubmit}>
      <FiX className="close-btn" onClick={onClose} />

      <h2>{initialData ? 'Edit Employee' : 'Add New Employee'}</h2>
      <p>{initialData ? 'Update employee information.' : 'Enter employee details to add them.'}</p>

      <label>Full Name</label>
      <div className="input-box">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <label>Role</label>
      <div className="input-box select-box">
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="">Select role</option>
          <option value="Foreman">Foreman</option>
          <option value="Carpenter">Carpenter</option>
          <option value="Electrician">Electrician</option>
          <option value="Plumber">Plumber</option>
          <option value="Laborer">Laborer</option>
          <option value="Mason">Mason</option>
          <option value="Roofer">Roofer</option>
        </select>
        <span className="arrow-icon"><FiChevronDown /></span>
      </div>

      <label>Daily Rate ($)</label>
      <div className="input-box">
        <input type="number" name="rate" value={formData.rate} onChange={handleChange} required />
      </div>

      <label>Status</label>
      <div className="input-box select-box">
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
        <span className="arrow-icon"><FiChevronDown /></span>
      </div>

      <label>Hours Worked</label>
      <div className="input-box">
        <input type="number" name="hours" value={formData.hours} onChange={handleChange} required />
      </div>

      <button type="submit" className="submit-button">
        {initialData ? 'Update Employee' : 'Add Employee'}
      </button>
    </form>
  );
};

export default AddEmployeeForm;
