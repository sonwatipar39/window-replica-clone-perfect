
import React, { useState, useEffect, useRef } from 'react';
import { wsClient } from '@/integrations/ws-client';
import { Send, Paperclip, MessageCircle, X, Minimize2 } from 'lucide-react';
import { chatEncryption } from '../utils/chatEncryption';
import { notificationSound } from '../utils/notificationSound';

interface ChatMessage {
  id: string;
  sender: 'admin' | 'user';
  message: string;
  timestamp: string;
  file_url?: string;
  file_name?: string;
  user_ip: string;
  encrypted?: boolean;
}

const AdminChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatActive, setIsChatActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<ChatMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize audio context on user interaction
    const enableAudio = () => {
      notificationSound.playMessageSent().catch(() => {});
      document.removeEventListener('click', enableAudio);
    };
    document.addEventListener('click', enableAudio);

    return () => {
      document.removeEventListener('click', enableAudio);
    };
  }, []);

  useEffect(() => {
    const handleChatMessage = async (msg: ChatMessage) => {
      try {
        // Decrypt message if encrypted
        if (msg.encrypted && msg.message) {
          msg.message = await chatEncryption.decryptMessage(msg.message);
        }

        setMessages(prev => [...prev, msg]);
        
        // Play notification sound for user messages
        if (msg.sender === 'user') {
          notificationSound.playMessageReceived();
        }
      } catch (error) {
        console.error('Error processing chat message:', error);
        // Still add the message even if decryption fails
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleStartChat = () => {
      setIsChatActive(true);
      setIsVisible(true);
      setConnectionStatus('connected');
      
      // Announce admin identity for key exchange
      wsClient.send('admin_hello', {});
    };

    const handleConnectionChange = () => {
      const isConnected = wsClient.isConnected();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (!isConnected) {
        setTimeout(() => {
          wsClient.connect();
        }, 1000);
      }
    };

    // Monitor WebSocket connection status
    wsClient.socket.on('connect', () => {
      setConnectionStatus('connected');
      if (isChatActive) {
        wsClient.send('admin_hello', {});
      }
    });
    wsClient.socket.on('disconnect', () => setConnectionStatus('disconnected'));
    wsClient.socket.on('connect_error', handleConnectionChange);

    wsClient.on('chat_message', handleChatMessage);
    wsClient.on('start_chat', handleStartChat);

    return () => {
      wsClient.off('chat_message', handleChatMessage);
      wsClient.off('start_chat', handleStartChat);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isChatActive]);

  const startChat = () => {
    setIsChatActive(true);
    setIsVisible(true);
    setConnectionStatus('connected');
    wsClient.send('start_chat', { role: 'admin' });
    wsClient.send('admin_hello', {});
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || connectionStatus !== 'connected') return;
    
    try {
      // Encrypt message before sending
      const encryptedMessage = await chatEncryption.encryptMessage(newMessage);
      
      const messageData = {
        id: Date.now().toString(),
        sender: 'admin' as const,
        message: encryptedMessage,
        timestamp: new Date().toISOString(),
        user_ip: 'admin',
        encrypted: true
      };

      // Add to local messages immediately (with decrypted content for display)
      const localMessage = { ...messageData, message: newMessage, encrypted: false };
      setMessages(prev => [...prev, localMessage]);
      
      // Send encrypted message
      wsClient.send('chat_message', messageData);
      
      // Play send confirmation sound
      notificationSound.playMessageSent();
      
      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback: send unencrypted if encryption fails
      const messageData = {
        id: Date.now().toString(),
        sender: 'admin' as const,
        message: newMessage,
        timestamp: new Date().toISOString(),
        user_ip: 'admin',
        encrypted: false
      };
      
      setMessages(prev => [...prev, messageData]);
      wsClient.send('chat_message', messageData);
      setNewMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || connectionStatus !== 'connected') return;
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        const fileName = file.name;
        
        // Encrypt file message
        const fileMessage = `Sent file: ${fileName}`;
        const encryptedFileMessage = await chatEncryption.encryptMessage(fileMessage);
        
        const messageData = {
          id: Date.now().toString(),
          sender: 'admin' as const,
          message: encryptedFileMessage,
          timestamp: new Date().toISOString(),
          file_url: fileData,
          file_name: fileName,
          user_ip: 'admin',
          encrypted: true
        };
        
        // Add to local messages with decrypted content
        const localMessage = { ...messageData, message: fileMessage, encrypted: false };
        setMessages(prev => [...prev, localMessage]);
        
        wsClient.send('chat_message', messageData);
        notificationSound.playMessageSent();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-400';
      case 'connecting': return 'bg-yellow-400';
      case 'disconnected': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-20 right-4 z-50">
        {!isChatActive && (
          <button
            onClick={startChat}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Chat Popup */}
      {isVisible && (
        <div className={`fixed bottom-20 right-4 bg-white rounded-lg shadow-lg z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-12' : 'w-80 h-96'
        }`}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full`}></div>
              <span className="font-semibold text-sm">
                {connectionStatus === 'connected' ? 'Admin Chat' : 'Disconnected'}
              </span>
              {connectionStatus === 'connected' && (
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  🔒 E2E Encrypted
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-64 overflow-y-auto p-3 bg-gray-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-3 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded max-w-xs text-sm ${
                      msg.sender === 'admin' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border text-gray-800'
                    }`}>
                      <div className="text-xs opacity-70 mb-1">
                        {msg.sender === 'admin' ? 'You (Admin)' : `User ${msg.user_ip}`}
                      </div>
                      <div>{msg.message}</div>
                      {msg.file_url && (
                        <div className="mt-2">
                          <a href={msg.file_url} download={msg.file_name} className="text-blue-600 underline text-xs">
                            📎 {msg.file_name}
                          </a>
                        </div>
                      )}
                      <div className="text-xs opacity-50 mt-1 flex items-center justify-between">
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        {msg.encrypted && <span className="text-xs">🔒</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-left mb-3">
                    <div className="inline-block p-2 rounded bg-gray-200 text-gray-600 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs ml-2">User is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white rounded-b-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={connectionStatus === 'connected' ? "Type your message here" : "Connecting..."}
                    disabled={connectionStatus !== 'connected'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={connectionStatus !== 'connected'}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={connectionStatus !== 'connected' || !newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AdminChat;
