import { useState, useEffect } from 'react';
import { supabase } from '../../lib/database';
import { useAuth } from '../../lib/auth';

export default function SupabaseTest() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [authDebug, setAuthDebug] = useState<any>({});

  useEffect(() => {
    testSupabaseConnection();
    checkAuthStatus();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
      
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        setConnectionStatus(`Connection Error: ${error.message}`);
        console.error('Supabase connection error:', error);
      } else {
        setConnectionStatus('✅ Supabase Connected Successfully');
        console.log('Supabase connection successful');
      }
    } catch (error) {
      setConnectionStatus(`Connection Failed: ${error}`);
      console.error('Supabase connection failed:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setAuthDebug({
        session: session ? 'Present' : 'None',
        user: session?.user?.email || 'None',
        error: error?.message || 'None'
      });
      console.log('Current session:', session);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleTestLogin = async () => {
    if (!testEmail || !testPassword) {
      alert('Please enter email and password');
      return;
    }

    console.log('Starting test login...');
    const success = await login({
      email: testEmail,
      password: testPassword
    });

    console.log('Login result:', success);
    if (success) {
      alert('Login successful!');
      checkAuthStatus();
    } else {
      alert('Login failed!');
    }
  };

  const handleTestLogout = async () => {
    console.log('Starting test logout...');
    await logout();
    alert('Logged out!');
    checkAuthStatus();
  };

  if (isLoading) {
    return <div className="p-4 bg-yellow-100 rounded">Loading authentication...</div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Supabase Authentication Test</h2>
      
      <div className="mb-4">
        <p className="font-semibold">Connection Status:</p>
        <p className={connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
          {connectionStatus}
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Environment Variables:</p>
        <div className="text-sm">
          <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Auth Debug Info:</p>
        <div className="text-sm">
          <p>Session: {authDebug.session}</p>
          <p>User: {authDebug.user}</p>
          <p>Error: {authDebug.error}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Authentication Status:</p>
        <p className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
          {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        </p>
        {user && (
          <div className="mt-2 text-sm">
            <p>User ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Name: {user.name}</p>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Test Email:</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Test Password:</label>
            <input
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="password"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <button
            onClick={handleTestLogin}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Test Login
          </button>
        </div>
      ) : (
        <button
          onClick={handleTestLogout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Test Logout
        </button>
      )}

      <div className="mt-4">
        <button
          onClick={checkAuthStatus}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Refresh Auth Status
        </button>
      </div>
    </div>
  );
}
