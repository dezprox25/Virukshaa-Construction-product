import { useState } from 'react';
import './CommonForm.css';
import { FiChevronDown, FiX } from 'react-icons/fi';

const UsageForm = ({ onClose, onSubmit, materials = [] }) => {
  const [formData, setFormData] = useState({
    material: '',
    quantity: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="common-form" onSubmit={handleSubmit}>
      <FiX className="close-btn" onClick={onClose} />

      <h2>Record Material Usage</h2>
      <p>Track daily material consumption</p>

      <label>Material</label>
      <div className="input-box select-box">
        <select
          name="material"
          value={formData.material}
          onChange={handleChange}
          required
        >
          <option value="">Select material</option>
          {materials.map((item, idx) => (
            <option key={idx} value={item.name}>
              {item.name} ({item.stock} {item.unit} available)
            </option>
          ))}
        </select>
        <span className="arrow-icon"><FiChevronDown /></span>
      </div>

      <label>Quantity Used</label>
      <div className="input-box">
        <input
          type="number"
          name="quantity"
          placeholder="Enter quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
      </div>

      <label>Notes (Optional)</label>
      <div className="input-box">
        <textarea
          name="notes"
          placeholder="Add any notes about the usage..."
          value={formData.notes}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <button type="submit" className="submit-button">Record Usage</button>
    </form>
  );
};

export default UsageForm;
