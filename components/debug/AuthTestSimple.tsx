import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function AuthTestSimple() {
  const { login, logout, isLoading, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpass123');
  const [loginCount, setLoginCount] = useState(0);

  const handleLogin = async () => {
    console.log(`Login attempt #${loginCount + 1}`);
    const result = await login({ email, password });
    setLoginCount(prev => prev + 1);
    console.log('Login result:', result);
  };

  const handleLogout = async () => {
    console.log('Logout attempt');
    await logout();
    console.log('Logout completed');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Auth Debug Test</h1>
        
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-semibold mb-2">Status</h3>
            <p>Loading: {isLoading ? 'YES' : 'NO'}</p>
            <p>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</p>
            <p>User: {user?.email || 'None'}</p>
            <p>Login Attempts: {loginCount}</p>
          </div>

          {/* Credentials */}
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 bg-gray-700 rounded text-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 bg-gray-700 rounded text-white"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded font-medium"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full p-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded font-medium"
            >
              Sign Out
            </button>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
