
import React from 'react';

interface Visitor {
  id: string;
  ip: string;
  created_at: string;
}

interface LiveVisitorNotificationProps {
  visitors: Visitor[];
}

const LiveVisitorNotification: React.FC<LiveVisitorNotificationProps> = ({ visitors }) => {
  // Only show notifications if there are actual live visitors
  if (visitors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visitors.map((visitor) => (
        <div
          key={visitor.id}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-red-400 animate-pulse"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="font-bold text-sm">Live Visitor: {visitor.ip}</span>
          </div>
          <div className="text-xs opacity-90">
            Connected: {new Date(visitor.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveVisitorNotification;
