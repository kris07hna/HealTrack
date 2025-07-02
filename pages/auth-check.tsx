// Simple Supabase Auth Check Page
import { useEffect, useState } from 'react'
import { supabase } from '../lib/database'
import { User } from '@supabase/supabase-js'

export default function AuthCheck() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [connectionTest, setConnectionTest] = useState<any>(null)

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const testConnection = async () => {
    try {
      const response = await fetch('/api/test-connection')
      const result = await response.json()
      setConnectionTest(result)
    } catch (error) {
      setConnectionTest({ success: false, error: 'Failed to test connection' })
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage('Signed in successfully!')
      }
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMessage('Signed out successfully!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">HealTrack - Supabase Setup Check</h1>
        
        {/* Connection Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Test Supabase Connection</h2>
          <button
            onClick={testConnection}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Connection
          </button>
          
          {connectionTest && (
            <div className={`mt-4 p-4 rounded ${connectionTest.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <pre>{JSON.stringify(connectionTest, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Authentication Status</h2>
          
          {user ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-800">✅ Signed in as: {user.email}</p>
                <p className="text-sm text-green-600">User ID: {user.id}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
              <div className="mt-4">
                <a 
                  href="/dashboard" 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {message && (
                <div className={`p-3 rounded ${message.includes('successfully') || message.includes('Check your email') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Switch to {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">3. Setup Checklist</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Supabase keys configured in .env.local</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚠️</span>
              <span>Database schema - Run the SQL from database/schema.sql in Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span>
              <span>Authentication - Enable email auth in Supabase dashboard</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Quick Setup Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Copy and paste the content from <code>database/schema.sql</code></li>
              <li>Click "Run" to execute the SQL</li>
              <li>Go to Authentication → Settings and verify email auth is enabled</li>
              <li>Refresh this page and test the connection</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
