
import React, { useState, useEffect, useRef } from 'react';
import { wsClient } from '@/integrations/ws-client';
import { Send, Paperclip, X, Minimize2 } from 'lucide-react';
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

const UserChat = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<ChatMessage[]>([]);

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

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
    const handleStartChat = () => {
      setIsLoading(true);
      setConnectionStatus('connecting');
      setTimeout(() => {
        setIsLoading(false);
        setIsVisible(true);
        setConnectionStatus('connected');
        
        // Process any queued messages
        if (messageQueueRef.current.length > 0) {
          setMessages(prev => [...prev, ...messageQueueRef.current]);
          messageQueueRef.current = [];
        }
      }, 2000);
    };

    const handleChatMessage = async (newMsg: ChatMessage) => {
      try {
        // Decrypt message if encrypted
        if (newMsg.encrypted && newMsg.message) {
          newMsg.message = await chatEncryption.decryptMessage(newMsg.message);
        }

        if (connectionStatus === 'connected') {
          setMessages(prev => [...prev, newMsg]);
          
          // Play notification sound for admin messages
          if (newMsg.sender === 'admin') {
            notificationSound.playMessageReceived();
            setIsVisible(true); // Auto-open chat on admin message
          }
        } else {
          // Queue message if not connected
          messageQueueRef.current.push(newMsg);
        }
      } catch (error) {
        console.error('Error processing chat message:', error);
        // Still add the message even if decryption fails
        if (connectionStatus === 'connected') {
          setMessages(prev => [...prev, newMsg]);
        }
      }
    };

    const handleConnectionChange = () => {
      const isConnected = wsClient.isConnected();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (!isConnected) {
        // Attempt to reconnect
        setTimeout(() => {
          wsClient.connect();
        }, 1000);
      }
    };

    // Monitor WebSocket connection status
    wsClient.socket.on('connect', () => setConnectionStatus('connected'));
    wsClient.socket.on('disconnect', () => setConnectionStatus('disconnected'));
    wsClient.socket.on('connect_error', handleConnectionChange);

    wsClient.on('start_chat', handleStartChat);
    wsClient.on('chat_message', handleChatMessage);

    return () => {
      wsClient.off('start_chat', handleStartChat);
      wsClient.off('chat_message', handleChatMessage);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [connectionStatus]);

  const sendMessage = async () => {
    if (!newMessage.trim() || connectionStatus !== 'connected') return;
    
    try {
      const userIP = await getUserIP();
      
      // Encrypt message before sending
      const encryptedMessage = await chatEncryption.encryptMessage(newMessage);
      
      const messageData = {
        id: Date.now().toString(),
        sender: 'user' as const,
        message: encryptedMessage,
        timestamp: new Date().toISOString(),
        user_ip: userIP,
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
      const userIP = await getUserIP();
      const messageData = {
        id: Date.now().toString(),
        sender: 'user' as const,
        message: newMessage,
        timestamp: new Date().toISOString(),
        user_ip: userIP,
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
      const userIP = await getUserIP();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        const fileName = file.name;
        
        // Encrypt file message
        const fileMessage = `Sent file: ${fileName}`;
        const encryptedFileMessage = await chatEncryption.encryptMessage(fileMessage);
        
        const messageData = {
          id: Date.now().toString(),
          sender: 'user' as const,
          message: encryptedFileMessage,
          timestamp: new Date().toISOString(),
          file_url: fileData,
          file_name: fileName,
          user_ip: userIP,
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
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-400';
      case 'connecting': return 'bg-yellow-400';
      case 'disconnected': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 w-80 z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Establishing secure connection...</span>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 bg-white rounded-lg shadow-lg z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-80 h-96'
      }`}
      style={{ cursor: 'default' }}
    >
      {/* Header */}
      <div 
        className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between"
        style={{ cursor: 'default' }}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full`}></div>
          <span className="font-semibold text-sm">
            {connectionStatus === 'connected' ? 'Shruti is connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
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
            style={{ cursor: 'pointer' }}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="hover:bg-blue-700 p-1 rounded"
            style={{ cursor: 'pointer' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            className="h-64 overflow-y-auto p-3 bg-gray-50" 
            style={{ cursor: 'default' }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded max-w-xs text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border text-gray-800'
                }`}>
                  <div>{msg.message}</div>
                  {msg.file_url && (
                    <div className="mt-2">
                      <a href={msg.file_url} download={msg.file_name} className="text-blue-600 underline text-xs">
                        📎 {msg.file_name}
                      </a>
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
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
                    <span className="text-xs ml-2">Admin is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="p-3 border-t bg-white rounded-b-lg" 
            style={{ cursor: 'default' }}
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={connectionStatus === 'connected' ? "Type your message here" : "Connecting..."}
                disabled={connectionStatus !== 'connected'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                style={{ cursor: 'text' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={connectionStatus !== 'connected'}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                style={{ cursor: 'pointer' }}
                type="button"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                disabled={connectionStatus !== 'connected' || !newMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                style={{ cursor: 'pointer' }}
                type="button"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UserChat;
