import { useState } from 'react';
import { supabase } from '@/lib/database';

export default function TestSupabaseAuth() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testing signup with:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });
      
      const resultData = {
        success: !error,
        error: error?.message || null,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        } : null,
        session: data.session ? 'EXISTS' : null,
        needsConfirmation: data.user && !data.session
      };
      
      console.log('Signup result:', resultData);
      setResult(resultData);
      
    } catch (error) {
      console.error('Signup error:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testing login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      const resultData = {
        success: !error,
        error: error?.message || null,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at
        } : null,
        session: data.session ? 'EXISTS' : null
      };
      
      console.log('Login result:', resultData);
      setResult(resultData);
      
    } catch (error) {
      console.error('Login error:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      const resultData = {
        success: !error,
        error: error?.message || null,
        session: session ? {
          user_email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at,
          access_token: session.access_token ? 'EXISTS' : null
        } : null
      };
      
      console.log('Session check:', resultData);
      setResult(resultData);
      
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setResult({ 
        success: !error, 
        error: error?.message || null,
        action: 'logout'
      });
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400">Supabase Auth Test</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="space-y-4">
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
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testSignup}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Signup'}
            </button>
            <button
              onClick={testLogin}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            <button
              onClick={checkSession}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-medium"
            >
              Check Session
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="bg-black rounded p-4 overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
