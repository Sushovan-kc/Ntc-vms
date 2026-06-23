import React from 'react';

const StatCard = ({ title, value, icon: Icon, borderLeftColor, iconBgColor, iconColor }) => {
  return (
    <div className={`bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm border-l-4 ${borderLeftColor} flex justify-between items-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl`}>
      <div>
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">{title}</span>
        <h2 className="text-3xl font-black text-ntc-dark">{value}</h2>
      </div>
      <div className={`p-3.5 ${iconBgColor} rounded-full ${iconColor}`}>
        <Icon size={28} />
      </div>
    </div>
  );
};

export default StatCard;
