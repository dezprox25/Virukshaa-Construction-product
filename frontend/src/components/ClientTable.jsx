import React from 'react';
import './ClientTable.css';
import { FiUserCheck } from 'react-icons/fi';

const clients = [
  { name: 'Client 1', project: 'Project 1', status: 'On Hold', budget: '$15,000', timeline: '2 months' },
  { name: 'Client 2', project: 'Project 2', status: 'Active', budget: '$20,000', timeline: '4 months' },
  { name: 'Client 3', project: 'Project 3', status: 'On Hold', budget: '$25,000', timeline: '6 months' },
  { name: 'Client 4', project: 'Project 4', status: 'Active', budget: '$30,000', timeline: '8 months' },
  { name: 'Client 5', project: 'Project 5', status: 'On Hold', budget: '$35,000', timeline: '10 months' },
  { name: 'Client 6', project: 'Project 6', status: 'Active', budget: '$40,000', timeline: '12 months' },
];

function ClientTable() {
  return (
    <div className="client-box">
      <div className="client-header">
        <h2>Clients</h2>
        <p>Manage your client relationships and projects</p>
      </div>
      <div className="client-grid">
        {clients.map((client, index) => (
          <div className="client-card" key={index}>
            <div className="client-top">
              <div>
                <h3>{client.name}</h3>
                <p>{client.project}</p>
              </div>
              <div className="client-icon">
                <FiUserCheck />
              </div>
            </div>
            <div className="client-detail">
              <span className="label">Status:</span>
              <span className={`status-badge ${client.status === 'Active' ? 'active' : 'on-hold'}`}>
                {client.status}
              </span>
            </div>
            <div className="client-detail">
              <span className="label">Budget:</span>
              <span className="number">{client.budget}</span>
            </div>
            <div className="client-detail">
              <span className="label">Timeline:</span>
              <span className="number">{client.timeline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientTable;
