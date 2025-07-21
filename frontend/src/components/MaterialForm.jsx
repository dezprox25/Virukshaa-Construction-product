import React, { useState, useEffect } from 'react';
import './CommonForm.css';
import { FiChevronDown, FiX } from 'react-icons/fi';

const AddMaterialForm = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    stock: '',
    min: '',
    cost: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      stock: parseFloat(formData.stock),
      min: parseFloat(formData.min),
      cost: parseFloat(formData.cost)
    });
  };

  return (
    <form className="common-form" onSubmit={handleSubmit}>
      <FiX className="close-btn" onClick={onClose} />

      <h2>{initialData ? 'Edit Material' : 'Add New Material'}</h2>
      <p>{initialData ? 'Update material information.' : 'Add a new material to track inventory.'}</p>

      <label>Material Name</label>
      <div className="input-box">
        <input type="text" name="name" placeholder="Enter material name" value={formData.name} onChange={handleChange} required />
      </div>

      <label>Unit</label>
      <div className="input-box select-box">
        <select name="unit" value={formData.unit} onChange={handleChange} required>
          <option value="">Select unit</option>
          <option value="Bags">Bags</option>
          <option value="Cubic Yards">Cubic Yards</option>
          <option value="Tons">Tons</option>
          <option value="Pieces">Pieces</option>
          <option value="Gallons">Gallons</option>
          <option value="Feet">Feet</option>
        </select>
        <span className="arrow-icon"><FiChevronDown /></span>
      </div>

      <label>Current Stock</label>
      <div className="input-box">
        <input type="number" name="stock" placeholder="Enter current quantity" value={formData.stock} onChange={handleChange} required />
      </div>

      <label>Minimum Stock Level</label>
      <div className="input-box">
        <input type="number" name="min" placeholder="Enter minimum quantity" value={formData.min} onChange={handleChange} required />
      </div>

      <label>Cost per Unit ($)</label>
      <div className="input-box">
        <input type="number" name="cost" placeholder="Enter cost per unit" value={formData.cost} onChange={handleChange} required />
      </div>

      <button type="submit" className="submit-button">{initialData ? 'Update Material' : 'Add Material'}</button>
    </form>
  );
};

export default AddMaterialForm;
