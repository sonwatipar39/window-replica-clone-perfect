
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
    <div className="fixed top-28 left-4 z-40 max-w-sm">
      <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg border-2 border-red-400">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">Live Visitors ({visitors.length})</h3>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {visitors.map((visitor, index) => (
            <div
              key={visitor.id}
              className="bg-red-700 p-3 rounded border-l-4 border-red-300"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">Visitor #{index + 1}</span>
                <span className="text-xs bg-green-500 px-2 py-1 rounded-full">LIVE</span>
              </div>
              
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-red-200">IP:</span> 
                  <span className="font-mono ml-1">{visitor.ip}</span>
                </div>
                <div>
                  <span className="text-red-200">ISP:</span> 
                  <span className="ml-1">Unknown ISP</span>
                </div>
                <div>
                  <span className="text-red-200">Connected:</span> 
                  <span className="ml-1">{new Date(visitor.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-2 border-t border-red-400 text-center">
          <span className="text-xs text-red-200">Real-time visitor monitoring</span>
        </div>
      </div>
    </div>
  );
};

export default LiveVisitorNotification;
