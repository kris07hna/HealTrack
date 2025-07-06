import { useState } from 'react';
import { supabase } from '../lib/database';

export default function TestAuth() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'test123456',
        options: {
          data: {
            full_name: 'Test User',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });
      
      setResult({ 
        success: !error, 
        data, 
        error: error?.message,
        needsConfirmation: data.user && !data.session
      });
    } catch (err) {
      setResult({ success: false, error: err });
    }
    setLoading(false);
  };

  const testSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      setResult({ 
        session: data.session,
        error: error?.message,
        user: data.session?.user
      });
    } catch (err) {
      setResult({ error: err });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      <div className="space-y-4 max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Test email"
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
        />
        
        <button
          onClick={testSignUp}
          disabled={loading || !email}
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
        >
          {loading ? 'Testing...' : 'Test Sign Up'}
        </button>
        
        <button
          onClick={testSession}
          disabled={loading}
          className="w-full p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded"
        >
          {loading ? 'Testing...' : 'Test Session'}
        </button>
      </div>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
