
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    // Load existing visitors
    const loadVisitors = async () => {
      const { data } = await supabase
        .from('enhanced_visitors' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setVisitors(data as EnhancedVisitor[]);
      }
    };

    loadVisitors();

    // Subscribe to new visitors
    const channel = supabase
      .channel('enhanced-visitors')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enhanced_visitors'
        },
        (payload) => {
          const newVisitor = payload.new as EnhancedVisitor;
          setVisitors(prev => {
            const exists = prev.some(v => v.ip === newVisitor.ip);
            if (!exists) {
              return [newVisitor, ...prev];
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
