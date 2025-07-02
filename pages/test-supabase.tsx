// Test Supabase connection
import { supabase } from '../lib/database'

export default function TestSupabase() {
  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.error('Supabase connection error:', error)
        return false
      }
      
      console.log('✅ Supabase connected successfully!')
      console.log('Profiles table exists:', data !== null)
      return true
    } catch (error) {
      console.error('❌ Connection failed:', error)
      return false
    }
  }

  const testAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('Current user:', user)
      return user
    } catch (error) {
      console.error('Auth error:', error)
      return null
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Database Connection
        </button>
        
        <button
          onClick={testAuth}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
        >
          Test Auth Connection
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Setup Steps:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>✅ Environment variables are set</li>
          <li>❓ Run database schema in Supabase SQL Editor</li>
          <li>❓ Test connection with buttons above</li>
          <li>❓ Enable authentication providers</li>
        </ol>
      </div>
    </div>
  )
}
