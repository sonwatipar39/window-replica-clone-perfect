
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TypingEvent {
  id: string;
  user_ip: string;
  field_name: string;
  is_typing: boolean;
  timestamp: string;
}

const TypingDetector = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBj+S2PS1fyEE');
    audio.play().catch(() => console.log('Could not play notification sound'));
  };

  useEffect(() => {
    const channel = supabase
      .channel('typing-detection')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'typing_events'
        },
        (payload) => {
          const newEvent = payload.new as TypingEvent;
          
          if (newEvent.is_typing) {
            setTypingUser(newEvent.user_ip);
            setShowNotification(true);
            playNotificationSound();
            
            // Hide notification after 3 seconds
            setTimeout(() => {
              setShowNotification(false);
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
      🎯 TYPING DETECTED - User {typingUser} is typing
    </div>
  );
};

export default TypingDetector;
