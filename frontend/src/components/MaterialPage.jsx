import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AddMaterialForm from './MaterialForm';
import UsageForm from './UsageForm';
import { FiEdit2, FiTrash2, FiPlus, FiBox } from 'react-icons/fi';
import './MaterialPage.css';

const MaterialPage = () => {
  const [materials, setMaterials] = useState([
    { name: 'Cement', unit: 'Bags', stock: 45, min: 20, cost: 12.5 },
    { name: 'Sand', unit: 'Cubic Yards', stock: 8, min: 5, cost: 35 },
    { name: 'Gravel', unit: 'Cubic Yards', stock: 12, min: 8, cost: 28 },
    { name: 'Rock', unit: 'Tons', stock: 3, min: 2, cost: 45 },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleAddOrUpdate = (data) => {
    if (editIndex !== null) {
      const updated = [...materials];
      updated[editIndex] = data;
      setMaterials(updated);
    } else {
      setMaterials([...materials, data]);
    }
    setShowAddForm(false);
    setEditIndex(null);
  };

  const handleUsage = (usedData) => {
    const updated = materials.map((item) => {
      if (item.name === usedData.material) {
        return { ...item, stock: item.stock - parseFloat(usedData.quantity) };
      }
      return item;
    });
    setMaterials(updated);
    setShowUsageForm(false);
  };

  const handleDelete = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setShowAddForm(true);
  };

  return (
    <div className="attendance-page">
      <Sidebar />
      <div className="attendance-main">
        <div className="top-header">
          <div>
            <h1>Materials</h1>
            <p>Monitor and manage construction materials</p>
          </div>
          <div className="top-buttons">
            <button className="record-btn" onClick={() => setShowUsageForm(true)}>
              <FiBox style={{ marginRight: '6px' }} /> Record Usage
            </button>
            <button className="add-btn" onClick={() => { setShowAddForm(true); setEditIndex(null); }}>
              <FiPlus style={{ marginRight: '6px' }} /> Add Material
            </button>
          </div>
        </div>

        <div className="attendance-box">
          <div className="box-header">
            <div>
              <h2>Material Inventory</h2>
              <p>Current stock levels and usage tracking</p>
            </div>
          </div>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Current Stock</th>
                <th>Minimum Level</th>
                <th>Cost per Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.stock} {item.unit}</td>
                  <td>{item.min} {item.unit}</td>
                  <td>${item.cost}</td>
                  <td>
                    <button className="status-btn present">In Stock</button>
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => handleEdit(index)}><FiEdit2 /></button>
                    <button className="icon-btn" onClick={() => handleDelete(index)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddForm && (
          <div className="popup-overlay">
            <div className="popup-box">
              <AddMaterialForm
                onClose={() => { setShowAddForm(false); setEditIndex(null); }}
                onSubmit={handleAddOrUpdate}
                initialData={editIndex !== null ? materials[editIndex] : null}
              />
            </div>
          </div>
        )}

        {showUsageForm && (
          <div className="popup-overlay">
            <div className="popup-box">
              <UsageForm
                onClose={() => setShowUsageForm(false)}
                onSubmit={handleUsage}
                materials={materials}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialPage;
