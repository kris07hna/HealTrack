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
import SymptomForm from '@/components/forms/SymptomForm';
import MedicationForm from '@/components/forms/MedicationForm';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ChartsSection from '@/components/dashboard/ChartsSection';
import LottieAnimation from '@/components/animations/LottieAnimation';
import type { DashboardData } from '@/types';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      loadDashboardData();
      createSampleData(); // Create sample data for demo
    }
  }, [isAuthenticated, isLoading, router]);

  const loadDashboardData = () => {
    try {
      const data = getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load data',
        message: 'Please refresh the page and try again.',
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

  const onSymptomAdded = () => {
    setShowSymptomForm(false);
    loadDashboardData();
    addNotification({
      type: 'success',
      title: 'Symptom logged',
      message: 'Your symptom has been successfully recorded.',
    });
  };

  const onMedicationAdded = () => {
    setShowMedicationForm(false);
    loadDashboardData();
    addNotification({
      type: 'success',
      title: 'Medication added',
      message: 'Your medication has been successfully added.',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
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
          <p className="text-xl font-semibold text-gray-700 mb-2">Loading Your Health Dashboard</p>
          <p className="text-gray-500">Preparing your personalized health insights...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.15, 0.05, 0.15]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl"
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Layout Container */}
      <div className="flex h-screen">
        {/* Modern Glassmorphism Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full glass-sidebar border-r border-white/20 shadow-2xl backdrop-blur-xl bg-white/75 flex flex-col">
          {/* Sidebar Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between h-20 px-6 border-b border-white/20 bg-gradient-to-r from-white/10 to-transparent"
          >
            <div className="flex items-center">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg"
              >
                <FaHeartbeat className="text-lg text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HealTrack
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-white/50 transition-all"
            >
              <FaTimes className="h-5 w-5" />
            </motion.button>
          </motion.div>

          {/* User Profile Card */}
          <div className="p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 bg-gradient-to-r from-white/60 to-white/40 border border-white/30"
            >
              <div className="flex items-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <FaUser className="text-white text-xl" />
                </motion.div>
                <div className="ml-4">
                  <p className="text-lg font-bold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 space-y-2">
            {/* Dashboard */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Dashboard
              </h3>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center px-4 py-4 text-sm font-semibold text-white rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <FaHome className="text-white text-lg" />
                </div>
                <span>Overview</span>
              </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSymptomForm(true)}
                  className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 rounded-2xl bg-white/60 hover:bg-white/80 border border-white/30 hover:border-red-200 group transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 rounded-2xl bg-white/60 hover:bg-white/80 border border-white/30 hover:border-blue-200 group transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                    <FaPills className="text-white text-sm" />
                  </div>
                  <span>Add Medication</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Data Management */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Data Management
              </h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ x: 5, scale: 1.02 }}
                  onClick={() => handleExport('json')}
                  className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 rounded-2xl bg-white/60 hover:bg-white/80 border border-white/30 hover:border-green-200 group transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                    <FaDownload className="text-white text-sm" />
                  </div>
                  <span>Export JSON</span>
                </motion.button>
                <motion.button
                  whileHover={{ x: 5, scale: 1.02 }}
                  onClick={() => handleExport('csv')}
                  className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 rounded-2xl bg-white/60 hover:bg-white/80 border border-white/30 hover:border-purple-200 group transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                    <FaDownload className="text-white text-sm" />
                  </div>
                  <span>Export CSV</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Additional Menu Items */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <motion.button
                whileHover={{ x: 5, scale: 1.02 }}
                className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/20 group transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <FaHistory className="text-white text-sm" />
                </div>
                <span>History</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 5, scale: 1.02 }}
                className="w-full flex items-center px-4 py-4 text-sm font-semibold text-gray-700 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/20 group transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <FaCog className="text-white text-sm" />
                </div>
                <span>Settings</span>
              </motion.button>
            </motion.div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 mt-auto">
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-4 text-sm font-semibold text-red-600 rounded-2xl bg-red-50/60 hover:bg-red-50/80 border border-red-100/50 group transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                <FaSignOutAlt className="text-white text-sm" />
              </div>
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-80 relative z-10">
        {/* Modern Glass Top Bar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card border-b border-white/20 sticky top-0 z-30 backdrop-blur-xl bg-white/60 shadow-xl"
        >
          <div className="px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3 text-gray-600 hover:text-gray-800 rounded-2xl hover:bg-white/50 transition-all shadow-sm"
                >
                  <FaBars className="h-5 w-5" />
                </motion.button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Health Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">Track your wellness journey with precision</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="hidden md:flex p-3 glass-card bg-white/40 hover:bg-white/60 border border-white/30 rounded-2xl shadow-sm transition-all"
                >
                  <FaSearch className="h-5 w-5 text-gray-600" />
                </motion.button>
                
                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="relative p-3 glass-card bg-white/40 hover:bg-white/60 border border-white/30 rounded-2xl shadow-sm transition-all"
                >
                  <FaBell className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                </motion.button>

                {/* Date Display */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden sm:block glass-card bg-white/40 border border-white/30 px-6 py-3 rounded-2xl shadow-sm"
                >
                  <div className="text-sm font-semibold text-gray-700">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </motion.div>
                <motion.div 
                  className="sm:hidden glass-card bg-white/40 border border-white/30 px-4 py-3 rounded-2xl shadow-sm"
                >
                  <div className="text-xs font-semibold text-gray-700">
                    {new Date().toLocaleDateString('en-US', { 
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
        <main className="p-6 lg:p-8 max-w-7xl mx-auto relative">
          {/* Floating content container */}
          <div className="relative">
            {dashboardData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Welcome Message with Lottie Animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card bg-gradient-to-r from-white/60 to-white/40 border border-white/30 p-8 rounded-3xl shadow-xl relative overflow-hidden"
                >
                  {/* Animated Health Icon */}
                  <div className="absolute top-6 right-6 w-24 h-24 opacity-10">
                    <LottieAnimation
                      src="https://lottie.host/embed/4e9ae918-b1d2-45a1-8562-610c54a04c36/taK6Aj7ddl.lottie"
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                      </h2>
                      <p className="text-lg text-gray-600 mb-4">
                        Here's your health overview for today. Stay consistent with your tracking!
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-green-600">System Active</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-blue-600">Data Synced</span>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl floating-3d"
                    >
                      <FaHeartbeat className="text-3xl text-white" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Stats Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <DashboardStats data={dashboardData} />
                </motion.div>

                {/* Recent Activity and Charts with improved layout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 xl:grid-cols-7 gap-8"
                >
                  <div className="xl:col-span-3">
                    <RecentActivity data={dashboardData} />
                  </div>
                  <div className="xl:col-span-4">
                    <ChartsSection data={dashboardData} />
                  </div>
                </motion.div>

                {/* Additional Stats Cards with Lottie Animations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <div className="glass-card bg-gradient-to-br from-white/60 to-white/40 border border-white/30 p-8 rounded-3xl shadow-xl relative overflow-hidden card-3d">
                    {/* Background Lottie Animation */}
                    <div className="absolute inset-0 opacity-5">
                      <LottieAnimation
                        src="https://lottie.host/embed/7fdd340c-1adc-4ff9-97e5-5bf299cd585f/3ZSmf0p1uc.lottie"
                        className="w-full h-full"
                      />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Weekly Progress</h3>
                        <motion.div 
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl"
                        >
                          <FaChartLine className="text-white text-lg" />
                        </motion.div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Symptoms logged</span>
                          <span className="font-bold text-green-600">12/14 days</span>
                        </div>
                        <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-lg"
                            style={{ boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)' }}
                          />
                        </div>
                        <div className="text-xs text-green-600 font-semibold">↗ +15% from last week</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card bg-gradient-to-br from-white/60 to-white/40 border border-white/30 p-8 rounded-3xl shadow-xl card-3d">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Health Score</h3>
                      <motion.div 
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl"
                      >
                        <FaHeartbeat className="text-white text-lg" />
                      </motion.div>
                    </div>
                    <div className="text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className="text-5xl font-bold text-blue-600 mb-2"
                      >
                        8.2
                      </motion.div>
                      <div className="text-lg text-gray-600 font-medium">Out of 10</div>
                      <div className="text-sm text-green-600 font-bold mt-3 flex items-center justify-center">
                        <FaArrowUp className="mr-1" />
                        +0.5 from last week
                      </div>
                    </div>
                  </div>

                  <div className="glass-card bg-gradient-to-br from-white/60 to-white/40 border border-white/30 p-8 rounded-3xl shadow-xl card-3d md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
                      <motion.div 
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl"
                      >
                        <FaPlus className="text-white text-lg" />
                      </motion.div>
                    </div>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowSymptomForm(true)}
                        className="w-full p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-200/50 rounded-2xl text-left hover:shadow-lg transition-all font-medium text-gray-700"
                      >
                        Log New Symptom
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowMedicationForm(true)}
                        className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 rounded-2xl text-left hover:shadow-lg transition-all font-medium text-gray-700"
                      >
                        Add Medication
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </main>
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
    </div>
  );
}
