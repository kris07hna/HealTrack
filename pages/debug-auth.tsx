import { useState, useEffect } from 'react';
import { supabase } from '@/lib/database';
import { useAuth } from '@/lib/auth';

export default function DebugAuth() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [name, setName] = useState('Test User');
  const [logs, setLogs] = useState<string[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const { user, isAuthenticated, isLoading, register, login } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[${timestamp}] ${message}`);
  };

  const checkSupabaseConnection = async () => {
    try {
      addLog('Testing Supabase connection...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        addLog(`Supabase connection ERROR: ${error.message}`);
        setSupabaseStatus({ connected: false, error: error.message });
      } else {
        addLog('Supabase connection SUCCESS');
        setSupabaseStatus({ connected: true });
      }
    } catch (error) {
      addLog(`Supabase connection FAILED: ${error}`);
      setSupabaseStatus({ connected: false, error: error });
    }
  };

  const checkAuthSettings = async () => {
    try {
      addLog('Checking Supabase auth settings...');
      const { data: session } = await supabase.auth.getSession();
      addLog(`Current session: ${session.session ? 'EXISTS' : 'NONE'}`);
      
      if (session.session) {
        addLog(`User email: ${session.session.user.email}`);
        addLog(`Email confirmed: ${session.session.user.email_confirmed_at ? 'YES' : 'NO'}`);
      }
    } catch (error) {
      addLog(`Auth check error: ${error}`);
    }
  };

  const testRegistration = async () => {
    try {
      addLog(`Starting registration test for: ${email}`);
      
      const result = await register({
        email,
        password,
        confirmPassword: password,
        name
      });
      
      addLog(`Registration result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        if (result.needsConfirmation) {
          addLog('✅ Registration successful - Email confirmation required');
        } else {
          addLog('✅ Registration successful - No email confirmation needed');
        }
      } else {
        addLog('❌ Registration failed');
      }
    } catch (error) {
      addLog(`Registration error: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      addLog(`Starting login test for: ${email}`);
      
      const result = await login({ email, password });
      
      addLog(`Login result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        addLog('✅ Login successful');
      } else {
        if (result.needsConfirmation) {
          addLog('❌ Login failed - Email confirmation required');
        } else {
          addLog('❌ Login failed');
        }
      }
    } catch (error) {
      addLog(`Login error: ${error}`);
    }
  };

  const testDirectSupabaseSignup = async () => {
    try {
      addLog('Testing direct Supabase signup...');
      
      const { data, error } = await supabase.auth.signUp({
        email: `direct-${Date.now()}@test.com`,
        password: 'testpassword123',
        options: {
          data: { full_name: 'Direct Test User' }
        }
      });
      
      addLog(`Direct signup result: ${JSON.stringify({ 
        user: data.user ? 'EXISTS' : 'NULL',
        session: data.session ? 'EXISTS' : 'NULL',
        error: error?.message || 'NONE'
      })}`);
      
      if (data.user && !data.session) {
        addLog('Email confirmation is ENABLED in Supabase');
      } else if (data.user && data.session) {
        addLog('Email confirmation is DISABLED in Supabase');
      }
    } catch (error) {
      addLog(`Direct signup error: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    addLog('Debug page loaded');
    addLog(`Auth state - Authenticated: ${isAuthenticated}, Loading: ${isLoading}, User: ${user?.email || 'NONE'}`);
    checkSupabaseConnection();
    checkAuthSettings();
  }, [isAuthenticated, isLoading, user]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400">Authentication Debug</h1>
        
        {/* Current Auth State */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Current Auth State</h2>
          <div className="space-y-2 text-sm">
            <p>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'YES' : 'NO'}</span></p>
            <p>Loading: <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>{isLoading ? 'YES' : 'NO'}</span></p>
            <p>User: <span className="text-cyan-400">{user?.email || 'NONE'}</span></p>
            <p>User ID: <span className="text-cyan-400">{user?.id || 'NONE'}</span></p>
          </div>
        </div>

        {/* Supabase Connection Status */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Supabase Status</h2>
          {supabaseStatus && (
            <div className="space-y-2 text-sm">
              <p>Connected: <span className={supabaseStatus.connected ? 'text-green-400' : 'text-red-400'}>
                {supabaseStatus.connected ? 'YES' : 'NO'}
              </span></p>
              {supabaseStatus.error && (
                <p>Error: <span className="text-red-400">{supabaseStatus.error}</span></p>
              )}
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Test Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={testRegistration}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
            >
              Test Registration
            </button>
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
            >
              Test Login
            </button>
            <button
              onClick={testDirectSupabaseSignup}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium"
            >
              Test Direct Signup
            </button>
            <button
              onClick={checkSupabaseConnection}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-medium"
            >
              Check Connection
            </button>
            <button
              onClick={checkAuthSettings}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded font-medium"
            >
              Check Auth Settings
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Debug Logs</h2>
          <div className="bg-black rounded p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
