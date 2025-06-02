
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
  const [typingEvents, setTypingEvents] = useState<TypingEvent[]>([]);
  const [activeTypers, setActiveTypers] = useState<Set<string>>(new Set());

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
          setTypingEvents(prev => [newEvent, ...prev.slice(0, 9)]);
          
          if (newEvent.is_typing) {
            setActiveTypers(prev => new Set([...prev, newEvent.user_ip]));
            playNotificationSound();
          } else {
            setActiveTypers(prev => {
              const newSet = new Set(prev);
              newSet.delete(newEvent.user_ip);
              return newSet;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Live Typing Detection</h2>
      
      {activeTypers.size > 0 && (
        <div className="bg-yellow-600 text-white p-2 rounded mb-4 animate-pulse">
          🎯 TYPING DETECTED - {activeTypers.size} user(s) currently typing
        </div>
      )}
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {typingEvents.length === 0 ? (
          <div className="text-gray-400">No typing activity detected yet...</div>
        ) : (
          typingEvents.map((event, index) => (
            <div 
              key={event.id} 
              className={`p-2 rounded text-sm ${
                event.is_typing ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <span className="font-mono">{event.user_ip}</span> 
              {event.is_typing ? ' started typing' : ' stopped typing'} 
              in <span className="font-semibold">{event.field_name}</span>
              <span className="text-xs ml-2 opacity-70">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TypingDetector;
