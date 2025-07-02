// Simple Dashboard page with Supabase integration
import { useState, useEffect } from 'react';
import { supabase } from '../lib/database';
import { User } from '@supabase/supabase-js';
import MoodTracker from '../components/dashboard/MoodTracker';
import SymptomFormSupabase from '../components/forms/SymptomFormSupabase';
import { useTheme } from '../lib/theme';
import ThemeToggle from '../components/ui/ThemeToggle';
import { FaSignOutAlt, FaUser, FaHeartbeat, FaSmile } from 'react-icons/fa';

export default function SimpleDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mood');
  const { theme } = useTheme();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please sign in to access the dashboard.
          </p>
          <a 
            href="/auth-check" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FaHeartbeat className="text-blue-500 text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                HealTrack Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <FaUser className="text-gray-400" />
                <span>{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('mood')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mood'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FaSmile className="inline mr-2" />
              Mood Tracker
            </button>
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'symptoms'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FaHeartbeat className="inline mr-2" />
              Symptoms
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'mood' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Mood Tracking
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your daily mood and see patterns over time.
                </p>
              </div>
              <MoodTracker />
            </div>
          )}

          {activeTab === 'symptoms' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Symptom Tracking
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Record and monitor your symptoms to share with healthcare providers.
                </p>
              </div>
              <SymptomFormSupabase />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
