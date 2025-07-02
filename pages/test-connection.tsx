import { useState } from 'react';
import { supabase } from '../lib/database';

export default function TestConnection() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any) => {
    setResults(prev => [...prev, { test, success, data, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Check environment variables
    addResult('Environment Variables', 
      !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    );

    // Test 2: Basic Supabase client creation
    try {
      const client = supabase;
      addResult('Supabase Client', true, { client: 'Created successfully' });
    } catch (error: any) {
      addResult('Supabase Client', false, { error: error.message || 'Unknown error' });
    }

    // Test 3: Simple query
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      addResult('Basic Query', !error, { data, error: error?.message });
    } catch (error: any) {
      addResult('Basic Query', false, { error: error.message || 'Unknown error' });
    }

    // Test 4: Auth check
    try {
      const { data, error } = await supabase.auth.getSession();
      addResult('Auth Check', !error, { hasSession: !!data.session, error: error?.message });
    } catch (error: any) {
      addResult('Auth Check', false, { error: error.message || 'Unknown error' });
    }

    // Test 5: Test profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      addResult('Profiles Table', !error, { count: data?.length || 0, error: error?.message });
    } catch (error: any) {
      addResult('Profiles Table', false, { error: error.message || 'Unknown error' });
    }

    // Test 6: Test health_goals table
    try {
      const { data, error } = await supabase
        .from('health_goals')
        .select('id')
        .limit(1);
      addResult('Health Goals Table', !error, { count: data?.length || 0, error: error?.message });
    } catch (error: any) {
      addResult('Health Goals Table', false, { error: error.message || 'Unknown error' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Connection Tests'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                  result.success ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.test}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.success ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
