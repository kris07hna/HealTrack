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
  FaEdit
} from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { getDashboardData, createSampleData, exportData } from '@/lib/storage';
import SymptomForm from '@/components/forms/SymptomForm';
import MedicationForm from '@/components/forms/MedicationForm';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ChartsSection from '@/components/dashboard/ChartsSection';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaHeartbeat className="text-6xl text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center">
            <FaHeartbeat className="text-2xl text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">HealTrack</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-6 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 px-3">
            <button
              onClick={() => setShowSymptomForm(true)}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
            >
              <FaPlus className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Log Symptom
            </button>
            
            <button
              onClick={() => setShowMedicationForm(true)}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
            >
              <FaPills className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Add Medication
            </button>

            <div className="border-t pt-4">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Export Data
              </p>
              <button
                onClick={() => handleExport('json')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
              >
                <FaDownload className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
              >
                <FaDownload className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Export CSV
              </button>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 rounded-md hover:bg-red-50 group"
              >
                <FaSignOutAlt className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <FaBars className="h-6 w-6" />
                </button>
                <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">
                  Health Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {dashboardData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Stats Overview */}
              <DashboardStats data={dashboardData} />

              {/* Recent Activity and Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentActivity data={dashboardData} />
                <ChartsSection data={dashboardData} />
              </div>
            </motion.div>
          )}
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
