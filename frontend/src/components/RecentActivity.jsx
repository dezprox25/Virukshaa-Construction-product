import './RecentActivity.css';
import { UserIcon } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    { text: 'New employee onboarded', time: '2 hours ago' },
    { text: 'New employee onboarded', time: '2 hours ago' },
    { text: 'New employee onboarded', time: '2 hours ago' },
  ];

  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">
              <UserIcon size={16} strokeWidth={1.8} />
            </div>
            <div className="activity-content">
              <div className="activity-text">{activity.text}</div>
              <div className="activity-time">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
