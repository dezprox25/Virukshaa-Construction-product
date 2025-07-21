import './SupervisorTable.css';
import './CommonForm.css';
import { FiUsers } from 'react-icons/fi';

const supervisors = [
  { name: 'John Doe', title: 'Site Supervisor', projects: 2, teamSize: 5 },
  { name: 'Jane Smith', title: 'Site Supervisor', projects: 3, teamSize: 6 },
  { name: 'Robert Johnson', title: 'Site Supervisor', projects: 4, teamSize: 7 },
  { name: 'Emily Davis', title: 'Site Supervisor', projects: 5, teamSize: 8 },
];

function SupervisorCards() {
  return (
    <div className="supervisor-box">
      <div className="supervisor-header">
        <h2>Supervisors</h2>
        <p>Manage site supervisors and their assignments</p>
      </div>
      <div className="supervisor-grid">
        {supervisors.map((supervisor, i) => (
          <div className="supervisor-card" key={i}>
            <div className="supervisor-top">
              <div className="supervisor-icon"><FiUsers /></div>
              <div>
                <h3>{supervisor.name}</h3>
                <p>{supervisor.title}</p>
              </div>
            </div>
            <div className="supervisor-detail">
              <span>Active Projects:</span>
              <span>{supervisor.projects}</span>
            </div>
            <div className="supervisor-detail">
              <span>Team Size:</span>
              <span>{supervisor.teamSize} members</span>
            </div>
            <button className="supervisor-button">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SupervisorCards;
