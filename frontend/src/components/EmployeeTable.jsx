import './EmployeeTable.css';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const EmployeeTable = () => {
  const employees = [
    { name: 'John Smith', role: 'Foreman', status: 'present', rate: '$150/day' },
    { name: 'Mike Johnson', role: 'Carpenter', status: 'present', rate: '$120/day' },
    { name: 'David Brown', role: 'Laborer', status: 'absent', rate: '$100/day' },
    { name: 'Chris Wilson', role: 'Electrician', status: 'present', rate: '$140/day' }
  ];

  return (
    <div className="employee-box">
      <div className="employee-header">
        <div>
          <h2>Employees</h2>
          <p>Manage your team members and their details</p>
        </div>
        <button className="add-btn"><FiEdit2 /> Add Employee</button>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Daily Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={index}>
              <td>{emp.name}</td>
              <td>{emp.role}</td>
              <td>
                <button className={`status-btn ${emp.status === 'present' ? 'present' : 'absent'}`}>
                  {emp.status}
                </button>
              </td>
              <td>{emp.rate}</td>
              <td>
                <button className="icon-btn"><FiEdit2 /></button>
                <button className="icon-btn delete"><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
