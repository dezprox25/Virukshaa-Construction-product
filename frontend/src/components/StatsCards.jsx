import './StatsCards.css';
import { FiUsers, FiBriefcase, FiPackage, FiUserCheck } from 'react-icons/fi';

function StatsCards({ selectedCard, onCardClick }) {
  const data = [
    { title: 'Employees', value: '4', note: 'Active workforce', icon: FiUsers },
    { title: 'Clients', value: '12', note: 'Active projects', icon: FiBriefcase },
    { title: 'Supervisors', value: '5', note: 'On site', icon: FiUserCheck },
    { title: 'Supplies', value: '0', note: 'Low stock items', icon: FiPackage }
  ];

  return (
    <div className="stats-row">
      {data.map((item, i) => {
        const Icon = item.icon;
        const isSelected = selectedCard === item.title;
        return (
          <div
            key={i}
            className={`stats-box ${isSelected ? 'selected' : ''}`}
            onClick={() => onCardClick(item.title)}
          >
            <div className="stats-top">
              <h3 className="stats-title">{item.title}</h3>
              <div className="stats-icon"><Icon /></div>
            </div>
            <div className="stats-value">{item.value}</div>
            <div className="stats-note">{item.note}</div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
