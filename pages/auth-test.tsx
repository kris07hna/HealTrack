import { useState } from 'react';
import { supabase } from '../lib/database';

export default function AuthTest() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testRegistration = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing registration with:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });
      
      console.log('Registration result:', data);
      console.log('Registration error:', error);
      
      if (error) {
        setResult(`Error: ${error.message}`);
      } else if (data.user && !data.session) {
        setResult(`Success! User created: ${data.user.email}. Check email for confirmation.`);
      } else if (data.user && data.session) {
        setResult(`Success! User created and signed in: ${data.user.email}`);
      } else {
        setResult('Unexpected response');
      }
    } catch (error) {
      console.error('Test error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing profile creation...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult('No authenticated user found');
        return;
      }
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        setResult(`Profile check error: ${profileError.message}`);
        return;
      }
      
      if (profile) {
        setResult(`Profile exists: ${JSON.stringify(profile, null, 2)}`);
      } else {
        // Create profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (insertError) {
          setResult(`Profile creation error: ${insertError.message}`);
        } else {
          setResult('Profile created successfully!');
        }
      }
    } catch (error) {
      console.error('Profile test error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setResult(`Error getting user: ${error.message}`);
      } else if (user) {
        setResult(`Current user: ${JSON.stringify(user, null, 2)}`);
      } else {
        setResult('No current user');
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Auth & Profile Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Registration</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={testRegistration}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Registration
            </button>
            
            <button
              onClick={testProfile}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Profile
            </button>
            
            <button
              onClick={checkCurrentUser}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Check User
            </button>
          </div>
          
          {loading && <div className="text-blue-600">Loading...</div>}
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
