
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Visitor {
  id: string;
  ip: string;
  created_at: string;
}

const LiveVisitorNotification = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [notifications, setNotifications] = useState<{id: string, ip: string, timestamp: Date}[]>([]);

  useEffect(() => {
    // Subscribe to new visitors
    const visitorsChannel = supabase
      .channel('live-visitor-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visitors'
        },
        (payload) => {
          const newVisitor = payload.new as Visitor;
          console.log('New visitor notification:', newVisitor);
          
          // Add to notifications array
          const notification = {
            id: newVisitor.id,
            ip: newVisitor.ip,
            timestamp: new Date()
          };
          
          setNotifications(prev => [...prev, notification]);
          
          // Remove notification after 30 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }, 30000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(visitorsChannel);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse border-2 border-red-400"
          style={{ minWidth: '250px' }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <div>
              <div className="font-bold text-sm">🔴 LIVE VISITOR</div>
              <div className="text-sm">IP: {notification.ip}</div>
              <div className="text-xs opacity-80">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveVisitorNotification;
