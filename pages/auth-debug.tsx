import { useState, useEffect } from 'react';
import { supabase } from '../lib/database';
import { useAuth } from '../lib/auth';

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session directly from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        setSupabaseSession(session);
        
        // Get user directly from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        setDebugInfo({
          session: session,
          sessionUser: session?.user,
          directUser: user,
          sessionError: error,
          userError: userError,
          authContextUser: auth.user,
          authContextIsAuthenticated: auth.isAuthenticated,
          authContextIsLoading: auth.isLoading,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Debug check error:', error);
        setDebugInfo({
          error: error,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change in debug:', event, session?.user?.email);
      setSupabaseSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [auth]);

  const forceLogout = async () => {
    await supabase.auth.signOut();
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    console.log('Refresh result:', data, error);
  };

  if (loading) {
    return <div className="p-8 text-white">Loading debug info...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auth Context Info */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Auth Context</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Is Authenticated:</span>{' '}
                <span className={auth.isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                  {auth.isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Is Loading:</span>{' '}
                <span className={auth.isLoading ? 'text-yellow-400' : 'text-green-400'}>
                  {auth.isLoading ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">User Email:</span>{' '}
                <span className="text-white">{auth.user?.email || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-400">User ID:</span>{' '}
                <span className="text-white">{auth.user?.id || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Supabase Session Info */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Supabase Session</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Has Session:</span>{' '}
                <span className={supabaseSession ? 'text-green-400' : 'text-red-400'}>
                  {supabaseSession ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">User Email:</span>{' '}
                <span className="text-white">{supabaseSession?.user?.email || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-400">Email Confirmed:</span>{' '}
                <span className={supabaseSession?.user?.email_confirmed_at ? 'text-green-400' : 'text-red-400'}>
                  {supabaseSession?.user?.email_confirmed_at ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Access Token:</span>{' '}
                <span className="text-white text-xs">
                  {supabaseSession?.access_token ? `${supabaseSession.access_token.substring(0, 20)}...` : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-x-4">
          <button
            onClick={forceLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Force Logout
          </button>
          <button
            onClick={refreshSession}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Session
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>

        {/* Full Debug Info */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Full Debug Info</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Navigation */}
        <div className="mt-6">
          <a href="/" className="text-cyan-400 hover:text-cyan-300">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}
