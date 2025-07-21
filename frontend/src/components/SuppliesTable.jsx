import { FiPlus } from 'react-icons/fi';
import './SuppliesTable.css';

const materials = [
  { name: 'Cement', stock: '45 bags', minimum: '20 bags', unit: 'bags', status: 'In Stock' },
  { name: 'Sand', stock: '8 cubic yards', minimum: '5 cubic yards', unit: 'cubic yards', status: 'In Stock' },
  { name: 'Gravel', stock: '12 cubic yards', minimum: '8 cubic yards', unit: 'cubic yards', status: 'In Stock' },
  { name: 'Rock', stock: '3 tons', minimum: '2 tons', unit: 'tons', status: 'In Stock' },
];

function SuppliesTable({ onAddMaterial }) {
  return (
    <div className="supplies-box">
      <div className="supplies-header">
        <div>
          <h2>Supplies</h2>
          <p>Track and manage construction materials</p>
        </div>
        <button className="add-button" onClick={onAddMaterial}>
          <FiPlus className="add-icon" />
          Add Material
        </button>
      </div>

      <table className="supplies-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Current Stock</th>
            <th>Minimum Required</th>
            <th>Unit</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.stock}</td>
              <td>{item.minimum}</td>
              <td>{item.unit}</td>
              <td>
                <span className="stock-badge">{item.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SuppliesTable;
