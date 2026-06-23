import React from 'react';

const ActionHubCard = ({ title, description, icon: Icon, iconBgColor, iconColor, onClick }) => {
  return (
    <div 
      className="bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm cursor-pointer select-none transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 hover:shadow-xl hover:border-ntc-blue hover:bg-ntc-light-blue/20 group text-center"
      onClick={onClick}
    >
      <div className="py-4">
        <div className={`rounded-full inline-flex p-5 mb-4 ${iconBgColor} transition-colors duration-200`}>
          <Icon size={48} className={iconColor} />
        </div>
        <h4 className="text-xl font-bold text-ntc-dark mb-2">{title}</h4>
        <p className="text-ntc-muted text-sm max-w-sm mx-auto">{description}</p>
      </div>
    </div>
  );
};

export default ActionHubCard;
