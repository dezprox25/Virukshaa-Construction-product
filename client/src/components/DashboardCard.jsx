
const DashboardCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm flex items-center justify-between">
      <div>
        <div className="text-md text-gray-500 mb-2">{title}</div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </div>
      <div className="text-xl mb-8 mr-2">{icon}</div>
    </div>
  );
};

export default DashboardCard;
