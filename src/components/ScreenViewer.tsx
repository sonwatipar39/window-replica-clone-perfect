
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScreenData {
  id: string;
  user_ip: string;
  screen_data: string;
  timestamp: string;
}

const ScreenViewer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [screenData, setScreenData] = useState<ScreenData[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('screen-viewer')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'screen_captures'
        },
        (payload) => {
          const newScreenData = payload.new as ScreenData;
          setScreenData(prev => [newScreenData, ...prev.slice(0, 4)]);
          
          if (canvasRef.current && newScreenData.screen_data) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              }
            };
            img.src = newScreenData.screen_data;
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Live Screen Viewer</h2>
        <div className={`px-3 py-1 rounded text-sm ${isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
          {isActive ? 'Active' : 'Waiting for connection'}
        </div>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full border border-gray-600 rounded bg-black"
        />
        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
          🔴 LIVE
        </div>
      </div>
      
      {screenData.length === 0 && (
        <div className="text-center text-gray-400 mt-4">
          No screen data received yet. Waiting for users to connect...
        </div>
      )}
    </div>
  );
};

export default ScreenViewer;
