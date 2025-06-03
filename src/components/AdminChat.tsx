
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, Paperclip, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'admin' | 'user';
  message: string;
  timestamp: string;
  file_url?: string;
  file_name?: string;
  user_ip: string;
}

const AdminChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatActive, setIsChatActive] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load existing messages
    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true });
      
      if (data) {
        setMessages(data as unknown as ChatMessage[]);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('admin-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const startChat = async () => {
    setIsChatActive(true);
    
    // Send chat initiation signal
    await supabase
      .from('admin_commands')
      .insert([{
        command: 'start_chat'
      }]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await supabase
      .from('chat_messages')
      .insert([{
        sender: 'admin',
        message: newMessage,
        timestamp: new Date().toISOString(),
        user_ip: 'admin'
      }]);

    setNewMessage('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you'd upload to Supabase storage
    const reader = new FileReader();
    reader.onload = async (e) => {
      await supabase
        .from('chat_messages')
        .insert([{
          sender: 'admin',
          message: `Sent file: ${file.name}`,
          timestamp: new Date().toISOString(),
          file_url: e.target?.result as string,
          file_name: file.name,
          user_ip: 'admin'
        }]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gray-800 p-4 rounded mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Live Chat Control</h2>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded text-sm ${isChatActive ? 'bg-green-600' : 'bg-gray-600'}`}>
            {isChatActive ? 'Chat Active' : 'Chat Inactive'}
          </div>
          {!isChatActive && (
            <button
              onClick={startChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Start Chat
            </button>
          )}
        </div>
      </div>

      {isChatActive && (
        <div className="border border-gray-600 rounded">
          <div className="h-80 overflow-y-auto p-4 bg-gray-900">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-3 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded max-w-xs ${
                  msg.sender === 'admin' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-white'
                }`}>
                  <div className="text-xs opacity-70 mb-1">
                    {msg.sender === 'admin' ? 'You (Admin)' : `User ${msg.user_ip}`}
                  </div>
                  <div>{msg.message}</div>
                  {msg.file_url && (
                    <div className="mt-2">
                      <a href={msg.file_url} download={msg.file_name} className="text-blue-300 underline text-xs">
                        📎 {msg.file_name}
                      </a>
                    </div>
                  )}
                  <div className="text-xs opacity-50 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-600 bg-gray-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChat;
