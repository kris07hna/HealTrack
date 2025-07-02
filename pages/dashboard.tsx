import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  FaHeartbeat, 
  FaPlus, 
  FaPills, 
  FaChartLine, 
  FaCalendarAlt,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaDownload,
  FaEdit,
  FaHome,
  FaHistory,
  FaCog,
  FaBell,
  FaSearch,
  FaArrowUp
} from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { getDashboardData, createSampleData, exportData } from '@/lib/storage';
import { symptomsHelpers, medicationsHelpers, meditationHelpers } from '@/lib/supabase-helpers';
import SymptomForm from '@/components/forms/SymptomForm';
import MedicationForm from '@/components/forms/MedicationForm';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ChartsSection from '@/components/dashboard/ChartsSection';
import LottieAnimation from '@/components/animations/LottieAnimation';
import { useTheme } from '../lib/theme';
import ThemeToggle from '../components/ui/ThemeToggle';
import ProfileForm from '../components/forms/ProfileForm';
import GoalTracker from '../components/dashboard/GoalTracker';
import MoodTracker from '../components/dashboard/MoodTracker';
import MeditationCenter from '../components/dashboard/MeditationCenter';
import HealthInsights from '../components/dashboard/HealthInsights';
import type { DashboardData } from '@/types';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotifications();
  const { theme, resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      loadDashboardData();
      createSampleData();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      console.log('🔄 Loading dashboard data from Supabase...');
      
      // Get data from Supabase in parallel
      const [symptomsAnalytics, recentSymptoms, medications, meditationStats] = await Promise.all([
        symptomsHelpers.getSymptomsAnalytics(user.id, 7),
        symptomsHelpers.getSymptomHistory(user.id, 10),
        medicationsHelpers.getMedications(user.id, true), // Only active medications
        meditationHelpers.getMeditationSessions(user.id, 30) // Last 30 days of meditation
      ]);
      
      console.log('✅ Dashboard data loaded:', {
        totalSymptoms: symptomsAnalytics.totalSymptoms,
        recentCount: recentSymptoms.length,
        activeMedications: medications.length,
        meditationSessions: meditationStats.totalSessions
      });

      // Create dashboard data structure compatible with existing components
      const supabaseDashboardData = {
        recentSymptoms: recentSymptoms.map(symptom => ({
          id: symptom.id,
          userId: user.id,
          symptom: symptom.title,
          severity: symptom.severity,
          timestamp: symptom.created_at,
          description: symptom.description,
          bodyPart: symptom.body_part,
          duration: symptom.duration,
          triggers: symptom.triggers ? [symptom.triggers] : []
        })),
        upcomingMedications: medications.map(med => ({
          id: med.id,
          userId: user.id,
          name: med.name,
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          startDate: new Date(med.start_date || med.created_at),
          endDate: med.end_date ? new Date(med.end_date) : undefined,
          notes: med.notes || undefined,
          reminders: false, // We'll implement reminders later
          reminderTimes: [], // We'll implement reminder times later
        })),
        meditationSessions: meditationStats.sessions.map(session => ({
          id: session.id,
          userId: session.user_id,
          type: session.session_type,
          duration: session.duration,
          completed: session.completed,
          timestamp: session.created_at
        })),
        symptomFrequency: symptomsAnalytics.bodyPartFrequency,
        painLevels: recentSymptoms.map(symptom => ({
          date: new Date(symptom.created_at).toISOString().split('T')[0],
          level: symptom.severity
        })),
        healthTrends: [], // Add missing required property
        stats: {
          totalSymptoms: symptomsAnalytics.totalSymptoms,
          avgSeverity: parseFloat(symptomsAnalytics.avgSeverity.toString()),
          activeMedications: medications.length,
          meditationMinutes: meditationStats.totalMinutes,
          meditationSessions: meditationStats.totalSessions,
          daysTracked: 30
        }
      };

      setDashboardData(supabaseDashboardData);
      
    } catch (error) {
      console.error('❌ Failed to load dashboard data from Supabase:', error);
      
      // Fallback to localStorage data
      console.log('🔄 Falling back to localStorage data...');
      const data = getDashboardData();
      setDashboardData(data);
      
      addNotification({
        type: 'warning',
        title: 'Using offline data',
        message: 'Could not connect to database. Showing cached data.',
      });
    }
  };

  const handleLogout = () => {
    logout();
    addNotification({
      type: 'info',
      title: 'Signed out',
      message: 'You have been successfully signed out.',
    });
  };

  const handleExport = (format: 'json' | 'csv') => {
    try {
      if (format === 'json') {
        exportData.json();
      } else {
        exportData.csv();
      }
      addNotification({
        type: 'success',
        title: 'Data exported',
        message: `Your data has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export failed',
        message: 'Failed to export data. Please try again.',
      });
    }
  };

  const onSymptomAdded = async () => {
    setShowSymptomForm(false);
    await loadDashboardData();
    addNotification({
      type: 'success',
      title: 'Symptom logged',
      message: 'Your symptom has been successfully recorded in the database.',
    });
  };

  const onMedicationAdded = async () => {
    setShowMedicationForm(false);
    await loadDashboardData();
    addNotification({
      type: 'success',
      title: 'Medication added',
      message: 'Your medication has been successfully added to the database.',
    });
  };
  
  const onMeditationCompleted = async () => {
    await loadDashboardData();
    addNotification({
      type: 'success',
      title: 'Meditation session recorded',
      message: 'Your meditation session has been successfully saved to the database.',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 glass-card"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <FaHeartbeat className="text-6xl text-indigo-600 mx-auto" />
          </motion.div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Loading Your Health Dashboard</p>
          <p className="text-gray-500 dark:text-gray-400">Preparing your personalized health insights...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.15, 0.05, 0.15]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 rounded-full blur-3xl"
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar - Fixed width, responsive */}
        <div className={`
          fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
          w-80 h-full transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full glass-sidebar border-r border-white/20 dark:border-gray-700/20 shadow-2xl backdrop-blur-xl bg-white/75 dark:bg-gray-800/75 flex flex-col">
            {/* Sidebar Header */}
            <div className="flex-shrink-0 px-6 py-6 border-b border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
                    >
                      <FaHeartbeat className="text-white text-xl" />
                    </motion.div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">HealTrack</h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Your Health Companion</p>
                  </div>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all"
                >
                  <FaTimes className="h-5 w-5" />
                </motion.button>
              </div>
              
              {/* User Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
              {/* Dashboard */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <h3 className="px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Dashboard
                </h3>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => setActiveView('overview')}
                  className={`w-full flex items-center px-4 py-4 text-sm font-semibold rounded-2xl shadow-lg transition-all ${
                    activeView === 'overview'
                      ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600'
                      : 'text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-white/30 dark:border-gray-600/30'
                  } group`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${
                    activeView === 'overview' ? 'bg-white/20' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}>
                    <FaHome className="text-white text-lg" />
                  </div>
                  <span>Overview</span>
                </motion.button>
              </motion.div>

              {/* Wellness Features */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mb-6"
              >
                <h3 className="px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Wellness
                </h3>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveView('goals')}
                    className={`w-full flex items-center px-4 py-4 text-sm font-semibold rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                      activeView === 'goals' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent'
                        : 'text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border-white/30 dark:border-gray-600/30 hover:border-indigo-200 dark:hover:border-indigo-700'
                    } group`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg ${
                      activeView === 'goals'
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}>
                      <FaChartLine className="text-sm text-white" />
                    </div>
                    <span>Goals & Progress</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveView('mood')}
                    className={`w-full flex items-center px-4 py-4 text-sm font-semibold rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                      activeView === 'mood' 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-transparent'
                        : 'text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border-white/30 dark:border-gray-600/30 hover:border-pink-200 dark:hover:border-pink-700'
                    } group`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg ${
                      activeView === 'mood'
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500'
                    }`}>
                      <FaHeartbeat className="text-sm text-white" />
                    </div>
                    <span>Mood Tracking</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveView('meditation')}
                    className={`w-full flex items-center px-4 py-4 text-sm font-semibold rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                      activeView === 'meditation' 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-transparent'
                        : 'text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border-white/30 dark:border-gray-600/30 hover:border-purple-200 dark:hover:border-purple-700'
                    } group`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg ${
                      activeView === 'meditation'
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    }`}>
                      <FaUser className="text-sm text-white" />
                    </div>
                    <span>Meditation</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveView('insights')}
                    className={`w-full flex items-center px-4 py-4 text-sm font-semibold rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                      activeView === 'insights' 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-transparent'
                        : 'text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border-white/30 dark:border-gray-600/30 hover:border-blue-200 dark:hover:border-blue-700'
                    } group`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg ${
                      activeView === 'insights'
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      <FaBell className="text-sm text-white" />
                    </div>
                    <span>AI Insights</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h3 className="px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSymptomForm(true)}
                    className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-2xl bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-white/30 dark:border-gray-600/30 hover:border-red-200 dark:hover:border-red-700 group transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                      <FaPlus className="text-white text-sm" />
                    </div>
                    <span>Log Symptom</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMedicationForm(true)}
                    className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-2xl bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-white/30 dark:border-gray-600/30 hover:border-blue-200 dark:hover:border-blue-700 group transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                      <FaPills className="text-white text-sm" />
                    </div>
                    <span>Add Medication</span>
                  </motion.button>
                </div>
              </motion.div>
            </nav>

            {/* User Actions */}
            <div className="p-4 mt-auto space-y-3">
              {/* Profile Button */}
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileForm(true)}
                className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-2xl bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-white/30 dark:border-gray-600/30 group transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                  <FaUser className="text-white text-sm" />
                </div>
                <span>Profile Settings</span>
              </motion.button>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-4 bg-white/60 dark:bg-gray-700/60 rounded-2xl border border-white/30 dark:border-gray-600/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mr-4">
                    <FaCog className="text-white text-sm" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Theme</span>
                </div>
                <ThemeToggle />
              </div>
              
              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-4 text-sm font-semibold text-red-600 dark:text-red-400 rounded-2xl bg-red-50/60 dark:bg-red-900/20 hover:bg-red-50/80 dark:hover:bg-red-900/40 border border-red-100/50 dark:border-red-800/50 group transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                  <FaSignOutAlt className="text-white text-sm" />
                </div>
                <span>Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Responsive */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Modern Glass Top Bar */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-navbar border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-30 backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 shadow-xl"
          >
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all shadow-sm"
                  >
                    <FaBars className="h-5 w-5" />
                  </motion.button>
                  <div className="ml-4 lg:ml-0">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Health Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 hidden sm:block">Track your wellness journey with precision</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Search Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="hidden md:flex p-3 glass-card bg-white/40 dark:bg-gray-700/40 hover:bg-white/60 dark:hover:bg-gray-700/60 border border-white/30 dark:border-gray-600/30 rounded-2xl shadow-sm transition-all"
                  >
                    <FaSearch className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </motion.button>
                  
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="relative p-3 glass-card bg-white/40 dark:bg-gray-700/40 hover:bg-white/60 dark:hover:bg-gray-700/60 border border-white/30 dark:border-gray-600/30 rounded-2xl shadow-sm transition-all"
                  >
                    <FaBell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                  </motion.button>

                  {/* Date Display */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="hidden sm:block glass-card bg-white/40 dark:bg-gray-700/40 border border-white/30 dark:border-gray-600/30 px-4 sm:px-6 py-3 rounded-2xl shadow-sm"
                  >
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard content with enhanced spacing and layout */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Conditional Content Rendering */}
              {activeView === 'overview' && dashboardData && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="space-y-6 lg:space-y-8"
                >
                  {/* Welcome Message with Lottie Animation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card bg-gradient-to-r from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-700/40 border border-white/30 dark:border-gray-600/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden"
                  >
                    {/* Animated Health Icon */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-16 h-16 sm:w-24 sm:h-24 opacity-10">
                      <LottieAnimation
                        src="https://lottie.host/embed/4e9ae918-b1d2-45a1-8562-610c54a04c36/taK6Aj7ddl.lottie"
                        className="w-full h-full"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10 space-y-4 sm:space-y-0">
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-3">
                          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                        </h2>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                          Here's your health overview for today. Stay consistent with your tracking!
                        </p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs sm:text-sm font-semibold text-green-600">System Active</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-xs sm:text-sm font-semibold text-blue-600">Data Synced</span>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl floating-3d flex-shrink-0"
                      >
                        <FaHeartbeat className="text-2xl sm:text-3xl text-white" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Enhanced Stats Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <DashboardStats />
                  </motion.div>

                  {/* Recent Activity and Charts with improved responsive layout */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 xl:grid-cols-7 gap-6 lg:gap-8"
                  >
                    <div className="xl:col-span-3">
                      <RecentActivity data={dashboardData} />
                    </div>
                    <div className="xl:col-span-4">
                      <ChartsSection data={dashboardData} />
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Goals View */}
              {activeView === 'goals' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <FaChartLine className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Goals & Progress</h2>
                      <p className="text-gray-600 dark:text-gray-400">Track your daily health objectives</p>
                    </div>
                  </div>
                  <GoalTracker />
                </motion.div>
              )}

              {/* Mood View */}
              {activeView === 'mood' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                      <FaHeartbeat className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mood Tracking</h2>
                      <p className="text-gray-600 dark:text-gray-400">Monitor your emotional wellness</p>
                    </div>
                  </div>
                  <MoodTracker />
                </motion.div>
              )}

              {/* Meditation View */}
              {activeView === 'meditation' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meditation Center</h2>
                      <p className="text-gray-600 dark:text-gray-400">Find peace and relaxation</p>
                    </div>
                  </div>
                  <MeditationCenter onSessionCompleted={onMeditationCompleted} />
                </motion.div>
              )}

              {/* Insights View */}
              {activeView === 'insights' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <FaBell className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Health Insights</h2>
                      <p className="text-gray-600 dark:text-gray-400">AI-powered recommendations for your wellness</p>
                    </div>
                  </div>
                  <HealthInsights />
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      {showSymptomForm && (
        <SymptomForm
          onClose={() => setShowSymptomForm(false)}
          onSubmit={onSymptomAdded}
        />
      )}

      {showMedicationForm && (
        <MedicationForm
          onClose={() => setShowMedicationForm(false)}
          onSubmit={onMedicationAdded}
        />
      )}

      {showProfileForm && (
        <ProfileForm
          onClose={() => setShowProfileForm(false)}
        />
      )}
    </div>
  );
}
