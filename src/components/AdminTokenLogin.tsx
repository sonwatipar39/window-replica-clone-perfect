
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import CryptoJS from 'crypto-js';

interface AdminTokenLoginProps {
  onTokenVerified: () => void;
}

const AdminTokenLogin: React.FC<AdminTokenLoginProps> = ({ onTokenVerified }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Encrypted valid token hash (you can change this)
  const VALID_TOKEN_HASH = '8a7f8c9e2b1d4f6a3e5c7b9d1a2f4e6c8b0d3f5a7c9e1b4d6f8a0c2e5b7d9f1a3';
  const SECRET_KEY = 'admin_panel_secret_2024';

  const verifyToken = () => {
    setLoading(true);
    setError('');

    try {
      // Hash the entered token with secret key
      const hashedInput = CryptoJS.SHA256(token + SECRET_KEY).toString();
      
      if (hashedInput === VALID_TOKEN_HASH) {
        // Store encrypted session
        const sessionData = CryptoJS.AES.encrypt(
          JSON.stringify({ 
            authenticated: true, 
            timestamp: Date.now(),
            token: token 
          }), 
          SECRET_KEY
        ).toString();
        
        localStorage.setItem('admin_session', sessionData);
        onTokenVerified();
      } else {
        setError('Invalid token. Access denied.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }
    verifyToken();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-gray-400">Enter your secure token to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
              Access Token
            </label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your secure token"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
          >
            {loading ? 'Verifying...' : 'Access Admin Panel'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure encrypted authentication • Unauthorized access prohibited
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTokenLogin;
