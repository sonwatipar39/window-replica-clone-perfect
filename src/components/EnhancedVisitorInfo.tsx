import React, { useEffect, useState } from 'react';
import { wsClient } from '@/integrations/ws-client';

interface EnhancedVisitor {
  id: string;
  ip: string;
  user_agent: string;
  isp: string;
  country: string;
  country_flag: string;
  device_time: string;
  created_at: string;
}

const EnhancedVisitorInfo = () => {
  const [visitors, setVisitors] = useState<EnhancedVisitor[]>([]);

  useEffect(() => {
    wsClient.on('enhanced_visitor', (newVisitor) => {
      setVisitors(prev => {
        const exists = prev.some(v => v.ip === newVisitor.ip);
        if (!exists) {
          return [newVisitor, ...prev];
        }
        return prev;
      });
    });
    return () => {
      wsClient.off('enhanced_visitor', () => {});
    };
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Enhanced Visitor Info ({visitors.length})</h2>
      
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {visitors.length === 0 ? (
          <div className="text-gray-400">No visitors yet...</div>
        ) : (
          visitors.map((visitor) => (
            <div key={visitor.id} className="bg-gray-700 p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{visitor.country_flag}</span>
                  <span className="text-white font-semibold">{visitor.country}</span>
                  <span className="text-green-400 text-sm">• Online</span>
                </div>
                <span className="text-gray-400 text-xs">
                  {new Date(visitor.created_at).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div><span className="text-gray-400">IP:</span> <span className="text-white">{visitor.ip}</span></div>
                <div><span className="text-gray-400">ISP:</span> <span className="text-white">{visitor.isp}</span></div>
                <div><span className="text-gray-400">Device Time:</span> <span className="text-white">{visitor.device_time}</span></div>
                <div><span className="text-gray-400">User Agent:</span> <span className="text-white text-xs">{visitor.user_agent}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedVisitorInfo;
