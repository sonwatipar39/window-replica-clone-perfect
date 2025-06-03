
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Visitor {
  id: string;
  ip: string;
  created_at: string;
}

const LiveVisitorNotification = () => {
  const [currentVisitor, setCurrentVisitor] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Get current visitor IP and track them
    const trackVisitor = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const visitorIP = data.ip;
        
        setCurrentVisitor(visitorIP);
        setShowNotification(true);

        // Insert visitor into database
        await supabase
          .from('visitors')
          .insert([{ ip: visitorIP }]);

      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();

    // Listen for page unload to remove notification
    const handleBeforeUnload = () => {
      setShowNotification(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!showNotification || !currentVisitor) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
      🔴 Live Visitor: {currentVisitor}
    </div>
  );
};

export default LiveVisitorNotification;
