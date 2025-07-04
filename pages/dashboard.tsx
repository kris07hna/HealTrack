import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
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
  FaArrowUp,
  FaRocket,
  FaStar,
  FaFire,
  FaEye,
  FaSmile,
  FaRunning,
  FaWater,
  FaMoon,
  FaSun,
  FaHeart,
  FaBrain,
  FaShieldAlt,
  FaCheck,
  FaDatabase,
  FaWifi,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaChartLine as FaTrendingUp,
  FaHeartbeat as FaActivity,
  FaRunning as FaDumbbell,
  FaPills as FaPill
} from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { getDashboardData, createSampleData, exportData } from '@/lib/storage';
import { symptomsHelpers, medicationsHelpers, profileHelpers, moodHelpers, authHelpers, exerciseHelpers } from '@/lib/supabase-helpers';
import { supabase } from '@/lib/database';
import SymptomForm from '@/components/forms/SymptomForm';
import MedicationForm from '@/components/forms/MedicationForm';
import ProfileForm from '@/components/forms/ProfileForm';
import MoodTracker from '@/components/forms/MoodTracker';
import ExerciseTracker from '@/components/forms/ExerciseTracker'
import OngoingExercises from '@/components/OngoingExercises';
import ExportModal from '@/components/ExportModal';
import LottieAnimation from '@/components/animations/LottieAnimation';
import { useTheme } from '../lib/theme';
import type { DashboardData } from '@/types';

export default function Dashboard() {
  // Utility function for time formatting
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [showLogSymptom, setShowLogSymptom] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showExerciseLog, setShowExerciseLog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [realTimeData, setRealTimeData] = useState<{
    symptoms: any[];
    medications: any[];
    moods: any[];
    exercises: any[];
    ongoingExercises: any[];
    profile: any;
    healthStats: {
      totalSymptoms: number;
      activeMedications: number;
      healthScore: number;
      recentMood: number;
      totalExercises: number;
      weeklyCalories: number;
    };
  }>({
    symptoms: [],
    medications: [],
    moods: [],
    exercises: [],
    ongoingExercises: [],
    profile: null,
    healthStats: {
      totalSymptoms: 0,
      activeMedications: 0,
      healthScore: 0,
      recentMood: 0,
      totalExercises: 0,
      weeklyCalories: 0
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('connected');
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [editingSymptom, setEditingSymptom] = useState<any>(null);
  const [showSymptomDetails, setShowSymptomDetails] = useState<any>(null);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotifications();
  const { theme, resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated && user) {
      loadRealTimeData();
      loadRecentUpdates();
      // Set up real-time subscriptions
      setupRealTimeSubscriptions();
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Set up real-time subscriptions
  const setupRealTimeSubscriptions = () => {
    if (!user?.id) return;

    console.log('🔄 Setting up real-time subscriptions for user:', user.id);

    // Subscribe to symptoms changes
    const symptomsChannel = supabase
      .channel(`symptoms_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'symptoms',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Symptoms changed:', payload);
          loadRealTimeData();
          loadRecentUpdates();
        }
      )
      .subscribe();

    // Subscribe to medications changes
    const medicationsChannel = supabase
      .channel(`medications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Medications changed:', payload);
          loadRealTimeData();
          loadRecentUpdates();
        }
      )
      .subscribe();

    // Subscribe to mood entries changes
    const moodChannel = supabase
      .channel(`mood_entries_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_entries',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Mood entries changed:', payload);
          loadRealTimeData();
          loadRecentUpdates();
        }
      )
      .subscribe();

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel(`profiles_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Profile changed:', payload);
          loadRealTimeData();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(symptomsChannel);
      supabase.removeChannel(medicationsChannel);
      supabase.removeChannel(moodChannel);
      supabase.removeChannel(profileChannel);
    };
  };

  // Test database connection (only on manual request)
  const testDatabaseConnection = async (showNotifications = true) => {
    try {
      setDbConnectionStatus('testing');
      console.log('🔄 Testing database connection...');
      
      // Test basic connection with a simple query
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (healthError) {
        console.error('❌ Health check failed:', healthError);
        throw healthError;
      }
      
      console.log('✅ Database connection successful');
      setDbConnectionStatus('connected');
      
      if (showNotifications) {
        addNotification({
          type: 'success',
          title: 'Database Connected',
          message: 'Connection to database verified successfully'
        });
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      setDbConnectionStatus('disconnected');
      
      if (showNotifications) {
        addNotification({
          type: 'error',
          title: 'Connection Test Failed',
          message: `Database connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  };

  // Load real-time data from Supabase
  const loadRealTimeData = async () => {
    if (!user?.id) {
      console.warn('❌ No user ID available for loading data');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Loading real-time data for user:', user.id);
      
      // Load user profile
      console.log('🔄 Loading profile...');
      const profile = await profileHelpers.getProfile(user.id);
      console.log('✅ Profile loaded:', profile);
      
      // Load recent symptoms (last 10)
      console.log('🔄 Loading symptoms...');
      const symptomsResult = await symptomsHelpers.getSymptoms(user.id, 1, 10);
      console.log('✅ Symptoms loaded:', symptomsResult);
      
      // Load active medications
      console.log('🔄 Loading medications...');
      const medications = await medicationsHelpers.getMedications(user.id, true);
      console.log('✅ Medications loaded:', medications);
      
      // Load recent mood entries
      console.log('🔄 Loading mood entries...');
      const moodResult = await moodHelpers.getMoodEntries(user.id, 7);
      console.log('✅ Mood entries loaded:', moodResult);
      
      // Load recent exercises
      console.log('🔄 Loading exercises...');
      const exercisesResult = await exerciseHelpers.getExercises(user.id, 1, 10);
      console.log('✅ Exercises loaded:', exercisesResult);
      
      // Load ongoing exercises
      console.log('🔄 Loading ongoing exercises...');
      const ongoingExercises = await exerciseHelpers.getOngoingExercises(user.id);
      console.log('✅ Ongoing exercises loaded:', ongoingExercises);
      
      // Load exercise analytics for weekly calories
      console.log('🔄 Loading exercise analytics...');
      const exerciseAnalytics = await exerciseHelpers.getExerciseAnalytics(user.id, 7);
      console.log('✅ Exercise analytics loaded:', exerciseAnalytics);
      
      // Calculate health statistics
      const healthStats = {
        totalSymptoms: symptomsResult.symptoms?.length || 0,
        activeMedications: medications?.length || 0,
        healthScore: calculateHealthScore(symptomsResult.symptoms, medications, exercisesResult.exercises),
        recentMood: moodResult.entries?.length > 0 ? 
          Math.round(moodResult.entries.reduce((sum: number, entry: any) => sum + entry.mood_value, 0) / moodResult.entries.length) :
          calculateRecentMood(symptomsResult.symptoms),
        totalExercises: exerciseAnalytics.totalExercises || 0,
        weeklyCalories: exerciseAnalytics.totalCalories || 0
      };

      console.log('📊 Calculated health stats:', healthStats);

      setRealTimeData({
        symptoms: symptomsResult.symptoms || [],
        medications: medications || [],
        moods: moodResult.entries || [],
        exercises: exercisesResult.exercises || [],
        ongoingExercises: ongoingExercises || [],
        profile,
        healthStats
      });

      // Also load legacy dashboard data
      const legacyData = await getDashboardData();
      setDashboardData(legacyData);
      
      // Load recent updates for notifications
      await loadRecentUpdates();
      
      console.log('✅ All real-time data loaded successfully');
      
    } catch (error) {
      console.log('❌ Error loading real-time data:', error);
      addNotification({
        type: 'error',
        title: 'Data Loading Error',
        message: `Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Load recent updates for notifications
  const loadRecentUpdates = async () => {
    if (!user?.id) return;

    try {
      const updates: any[] = [];
      
      // Get recent symptoms (last 5)
      const recentSymptoms = await symptomsHelpers.getSymptoms(user.id, 1, 5);
      if (recentSymptoms.symptoms) {
        updates.push(...recentSymptoms.symptoms.map((symptom: any) => ({
          type: 'symptom',
          title: symptom.name || symptom.title || 'Symptom logged',
          description: symptom.description || `Severity: ${symptom.severity_level || 'N/A'}`,
          created_at: symptom.created_at || symptom.date
        })));
      }

      // Get recent medications (last 5)
      const recentMedications = await medicationsHelpers.getMedications(user.id, true);
      if (recentMedications && recentMedications.length > 0) {
        updates.push(...recentMedications.slice(0, 5).map((medication: any) => ({
          type: 'medication',
          title: `${medication.name} ${medication.dosage || ''}`,
          description: `Next dose: ${medication.next_dose || 'Not scheduled'}`,
          created_at: medication.created_at || medication.updated_at
        })));
      }

      // Get recent exercises (last 3)
      const recentExercises = await exerciseHelpers.getExercises(user.id, 1, 3);
      if (recentExercises.exercises) {
        updates.push(...recentExercises.exercises.map((exercise: any) => ({
          type: 'exercise',
          title: `${exercise.exercise_type || 'Exercise'} completed`,
          description: `Duration: ${exercise.duration_minutes || 0} min, Calories: ${exercise.calories_burned || 0}`,
          created_at: exercise.created_at || exercise.date
        })));
      }

      // Get recent mood entries (last 3)
      const recentMoods = await moodHelpers.getMoodEntries(user.id, 3);
      if (recentMoods.entries) {
        updates.push(...recentMoods.entries.map((mood: any) => ({
          type: 'mood',
          title: `Mood: ${mood.mood_description || mood.mood_value}/10`,
          description: mood.notes || 'Mood logged',
          created_at: mood.created_at || mood.date
        })));
      }

      // Sort by created date (newest first) and take top 10
      const sortedUpdates = updates
        .filter(update => update.created_at)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setRecentUpdates(sortedUpdates);
    } catch (error) {
      console.error('Error loading recent updates:', error);
    }
  };

  // Calculate health score based on symptoms, medications, and exercises
  const calculateHealthScore = (symptoms: any[], medications: any[], exercises?: any[]) => {
    if (!symptoms || symptoms.length === 0) return 95;
    
    const recentSymptoms = symptoms.slice(0, 7); // Last 7 symptoms
    const avgSeverity = recentSymptoms.reduce((sum, s) => sum + (s.severity || 1), 0) / recentSymptoms.length;
    const medicationCompliance = medications.length > 0 ? 20 : 0;
    
    // Exercise bonus: up to 15 points for regular exercise
    let exerciseBonus = 0;
    if (exercises && exercises.length > 0) {
      const weeklyExercises = exercises.filter(e => {
        const exerciseDate = new Date(e.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return exerciseDate >= weekAgo;
      });
      exerciseBonus = Math.min(15, weeklyExercises.length * 3);
    }
    
    return Math.max(10, Math.min(100, 100 - (avgSeverity * 15) + medicationCompliance + exerciseBonus));
  };

  // Calculate recent mood from symptoms
  const calculateRecentMood = (symptoms: any[]) => {
    if (!symptoms || symptoms.length === 0) return 7;
    
    const recentSymptoms = symptoms.slice(0, 3);
    const avgSeverity = recentSymptoms.reduce((sum, s) => sum + (s.severity || 1), 0) / recentSymptoms.length;
    
    return Math.max(1, Math.min(10, 10 - avgSeverity * 2));
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData([]);
      return;
    }

    const searchResults = [
      ...realTimeData.symptoms.filter((s: any) => 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((s: any) => ({ ...s, type: 'symptom' })),
      ...realTimeData.medications.filter((m: any) => 
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.dosage?.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((m: any) => ({ ...m, type: 'medication' })),
      ...realTimeData.moods.filter((mood: any) => 
        mood.mood_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mood.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((mood: any) => ({ ...mood, type: 'mood' })),
      ...realTimeData.exercises.filter((e: any) => 
        e.exercise_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((e: any) => ({ ...e, type: 'exercise' }))
    ];

    setFilteredData(searchResults);
  }, [searchQuery, realTimeData]);

  const loadDashboardData = async () => {
    await loadRealTimeData();
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      console.log('Logout successful, redirecting...');
      
      // Try router first, then fallback to window.location
      try {
        router.push('/');
      } catch (routerError) {
        console.log('Router push failed, using window.location');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout failed
      window.location.href = '/';
    }
  };

  const handleSymptomSubmit = async (symptomData: any) => {
    try {
      console.log('🔄 Dashboard: Submitting symptom data:', symptomData);
      
      if (editingSymptom) {
        // Update existing symptom
        const result = await symptomsHelpers.updateSymptom(editingSymptom.id, symptomData);
        console.log('✅ Dashboard: Symptom updated successfully:', result);
        
        addNotification({
          type: 'success',
          title: 'Symptom Updated',
          message: 'Your symptom has been updated successfully'
        });
      } else {
        // Create new symptom
        const result = await symptomsHelpers.addSymptom(symptomData);
        console.log('✅ Dashboard: Symptom saved successfully:', result);
        
        addNotification({
          type: 'success',
          title: 'Symptom Logged',
          message: 'Your symptom has been recorded successfully'
        });
      }
      
      setShowSymptomForm(false);
      setEditingSymptom(null);
      
      // Force refresh the data
      await loadRealTimeData();
      
    } catch (error) {
      console.error('❌ Dashboard: Error logging symptom:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to save symptom: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleMoodSubmit = async () => {
    try {
      console.log('🔄 Dashboard: Mood submitted, refreshing data...');
      setShowMoodTracker(false);
      
      // Force refresh the data
      await loadRealTimeData();
      
      addNotification({
        type: 'success',
        title: 'Mood Tracked',
        message: 'Your mood has been recorded successfully'
      });
    } catch (error) {
      console.error('❌ Dashboard: Error handling mood submit:', error);
    }
  };

  // Handle symptom editing
  const handleEditSymptom = (symptom: any) => {
    setEditingSymptom(symptom);
    setShowSymptomForm(true);
  };

  // Handle symptom viewing
  const handleViewSymptom = (symptom: any) => {
    setShowSymptomDetails(symptom);
  };

  // Handle symptom deletion
  const handleDeleteSymptom = async (symptomId: string) => {
    if (!user?.id) return;
    
    try {
      await symptomsHelpers.deleteSymptom(symptomId);
      addNotification({
        type: 'success',
        title: 'Symptom Deleted',
        message: 'Symptom has been successfully deleted.'
      });
      await loadRealTimeData();
    } catch (error) {
      console.error('Error deleting symptom:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete symptom. Please try again.'
      });
    }
  };

  // Close dropdowns when clicking outside
  const handleBackdropClick = () => {
    setShowNotifications(false);
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div
          className="flex items-center space-x-4"
        >
          <div
            className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"
          />
          <span className="text-white text-xl font-semibold">Loading HealTrack...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Lottie Background */}
      <div className="fixed inset-0 z-0">
        <LottieAnimation 
          src="https://lottie.host/embed/5fd227ec-cb57-4965-84cd-498b02f9a2ba/EHJZ3mJ90R.lottie"
          className="w-full h-full"
          style={{ opacity: 0.15 }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
        
        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-50">
        {/* Header */}
        <motion.header
          className="bg-black/40 backdrop-blur-xl border-b border-white/10 relative z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <FaHeartbeat className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-white">HealTrack</h1>
                  <p className="text-xs text-gray-400">Your Health Journey</p>
                </div>
              </motion.div>

              {/* Search and Actions */}
              <div className="flex items-center space-x-4">
                {/* Database Status Indicator */}
                <motion.div
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    onClick={() => testDatabaseConnection(true)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      dbConnectionStatus === 'connected' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : dbConnectionStatus === 'disconnected'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Click to test database connection"
                  >
                    {dbConnectionStatus === 'connected' && <FaCheckCircle className="w-3 h-3" />}
                    {dbConnectionStatus === 'disconnected' && <FaExclamationTriangle className="w-3 h-3" />}
                    {dbConnectionStatus === 'testing' && (
                      <motion.div
                        className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    <span>
                      {dbConnectionStatus === 'connected' && 'DB Connected'}
                      {dbConnectionStatus === 'disconnected' && 'DB Error'}
                      {dbConnectionStatus === 'testing' && 'Testing...'}
                    </span>
                  </motion.button>
                </motion.div>

                {/* Refresh Data Button */}
                <motion.button
                  onClick={loadRealTimeData}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-cyan-500/30 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <motion.div
                      className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <FaWifi className="w-3 h-3" />
                  )}
                  <span>{loading ? 'Loading...' : 'Refresh'}</span>
                </motion.button>

                {/* Search */}
                <motion.div
                  className="relative hidden md:block"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search symptoms, medications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                  />
                  
                  {/* Search Results Dropdown */}
                  {searchQuery && filteredData.length > 0 && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-[99999] max-h-64 overflow-y-auto"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ position: 'fixed', top: '60px', left: 'auto', right: '20px', width: '400px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {filteredData.slice(0, 5).map((item: any, index) => (
                        <motion.div
                          key={index}
                          className="p-3 hover:bg-white/10 border-b border-white/10 last:border-b-0 cursor-pointer"
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center space-x-3">
                            {item.type === 'symptom' ? (
                              <FaEye className="w-4 h-4 text-red-400" />
                            ) : item.type === 'medication' ? (
                              <FaPills className="w-4 h-4 text-green-400" />
                            ) : (
                              <FaSmile className="w-4 h-4 text-yellow-400" />
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">
                                {item.type === 'mood' ? item.mood_description : item.name}
                              </p>
                              <p className="text-gray-400 text-xs capitalize">{item.type}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                {/* Notifications */}
                {/* Bell Icon with Notifications */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    aria-label="View notifications"
                  >
                    <FaBell className="w-5 h-5" />
                    {recentUpdates.length > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {Math.min(recentUpdates.length, 9)}
                      </motion.span>
                    )}
                  </button>
                          {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                className="absolute top-full right-0 mt-2 w-80 bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-[99999]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ position: 'fixed', top: '60px', right: '20px' }}
                onClick={(e) => e.stopPropagation()}
              >
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-3">Recent Health Updates</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {recentUpdates.length > 0 ? (
                            recentUpdates.slice(0, 10).map((update, index) => (
                              <motion.div
                                key={index}
                                className="p-3 bg-white/5 rounded-lg border border-white/10"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {update.type === 'symptom' && <FaActivity className="w-4 h-4 text-red-400" />}
                                  {update.type === 'medication' && <FaPill className="w-4 h-4 text-blue-400" />}
                                  {update.type === 'exercise' && <FaDumbbell className="w-4 h-4 text-green-400" />}
                                  {update.type === 'mood' && <FaHeart className="w-4 h-4 text-purple-400" />}
                                  <span className="text-white/80 text-sm font-medium capitalize">{update.type}</span>
                                  <span className="text-white/50 text-xs ml-auto">
                                    {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-white/70 text-sm">{update.title}</p>
                                {update.description && (
                                  <p className="text-white/50 text-xs mt-1">{update.description}</p>
                                )}
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-white/50 text-sm text-center py-4">
                              No recent updates
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* User Menu */}
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-white">{user?.name || realTimeData.profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  
                  {/* Profile Button */}
                  <motion.button
                    onClick={() => setShowProfileForm(true)}
                    className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaUser className="w-5 h-5" />
                  </motion.button>
                  
                  {/* Export Button */}
                  <motion.button
                    onClick={() => setShowExportModal(true)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Export Health Data"
                  >
                    <FaDownload className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <main 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
          onClick={handleBackdropClick}
        >
          {/* Welcome Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <motion.h2
                    className="text-3xl font-bold text-white mb-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                  </motion.h2>
                  <motion.p
                    className="text-gray-300"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Here's your health summary for today. You're doing great!
                  </motion.p>
                </div>
                <motion.button
                  onClick={() => setShowExportModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaDownload className="w-4 h-4" />
                  <span>Export Health Data</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {[
              { 
                icon: FaHeart, 
                title: 'Health Score', 
                value: realTimeData.healthStats.healthScore.toString(), 
                unit: '%', 
                color: 'from-red-400 to-pink-500', 
                change: realTimeData.healthStats.healthScore >= 80 ? 'Excellent' : realTimeData.healthStats.healthScore >= 60 ? 'Good' : 'Needs Attention'
              },
              { 
                icon: FaEye, 
                title: 'Recent Symptoms', 
                value: realTimeData.healthStats.totalSymptoms.toString(), 
                unit: '', 
                color: 'from-blue-400 to-cyan-500', 
                change: realTimeData.symptoms.length > 0 ? 'Active tracking' : 'No recent symptoms'
              },
              { 
                icon: FaPills, 
                title: 'Medications', 
                value: realTimeData.healthStats.activeMedications.toString(), 
                unit: '', 
                color: 'from-green-400 to-emerald-500', 
                change: realTimeData.medications.length > 0 ? 'On schedule' : 'None active'
              },
              { 
                icon: FaChartLine, 
                title: 'Recent Mood', 
                value: realTimeData.healthStats.recentMood.toString(), 
                unit: '/10', 
                color: 'from-purple-400 to-indigo-500', 
                change: realTimeData.healthStats.recentMood >= 7 ? 'Great mood' : realTimeData.healthStats.recentMood >= 5 ? 'Moderate' : 'Low mood'
              },
              { 
                icon: FaRunning, 
                title: 'Weekly Exercises', 
                value: realTimeData.healthStats.totalExercises.toString(), 
                unit: '', 
                color: 'from-orange-400 to-red-500', 
                change: realTimeData.healthStats.totalExercises > 3 ? 'Great activity' : realTimeData.healthStats.totalExercises > 0 ? 'Some activity' : 'No activity'
              },
              { 
                icon: FaFire, 
                title: 'Calories Burned', 
                value: realTimeData.healthStats.weeklyCalories.toString(), 
                unit: 'cal', 
                color: 'from-yellow-400 to-orange-500', 
                change: realTimeData.healthStats.weeklyCalories > 500 ? 'Excellent burn' : realTimeData.healthStats.weeklyCalories > 0 ? 'Good effort' : 'No calories tracked'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/60 transition-all duration-300"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {stat.value}<span className="text-lg text-gray-400">{stat.unit}</span>
                    </p>
                    <motion.p
                      className="text-green-400 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      {stat.change}
                    </motion.p>
                  </div>
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Ongoing Exercises Section */}
          {realTimeData.ongoingExercises && realTimeData.ongoingExercises.length > 0 && (
            <OngoingExercises onExerciseCompleted={loadRealTimeData} />
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Charts */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {/* Health Trends Chart */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <FaChartLine className="mr-3 text-cyan-400" />
                    Symptom Severity Trends
                  </h3>
                  <div className="flex items-center space-x-2">
                    <motion.select
                      className="px-3 py-1 bg-black/30 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                      whileHover={{ scale: 1.02 }}
                    >
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                      <option value="90d">90 Days</option>
                    </motion.select>
                    <motion.button
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Export
                    </motion.button>
                  </div>
                </div>
                
                {/* Modern Line Chart */}
                <div className="h-64 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-xl p-4 relative overflow-hidden border border-white/10">
                  {/* Chart Background Grid */}
                  <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.1 }}>
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-400" />
                  </svg>
                  
                  {/* Y-Axis Labels */}
                  <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-400">
                    <span>5</span>
                    <span>4</span>
                    <span>3</span>
                    <span>2</span>
                    <span>1</span>
                    <span>0</span>
                  </div>
                  
                  {/* Chart Area */}
                  <div className="ml-8 mr-4 h-full relative">
                    {realTimeData.symptoms.length > 0 ? (
                      <svg className="w-full h-full">
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="1"/>
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1"/>
                          </linearGradient>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        
                        {(() => {
                          const symptoms = realTimeData.symptoms.slice(0, 7).reverse();
                          const width = 100; // percentage
                          const height = 100; // percentage
                          const points = symptoms.map((symptom, index) => {
                            const x = (index / Math.max(symptoms.length - 1, 1)) * width;
                            const y = height - ((symptom.severity / 5) * height);
                            return { x, y, symptom };
                          });
                          
                          const pathData = points.map((point, index) => 
                            `${index === 0 ? 'M' : 'L'} ${point.x}% ${point.y}%`
                          ).join(' ');
                          
                          const areaData = `${pathData} L ${points[points.length - 1]?.x || 0}% 100% L 0% 100% Z`;
                          
                          return (
                            <g>
                              {/* Area under the line */}
                              <motion.path
                                d={areaData}
                                fill="url(#areaGradient)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 1 }}
                              />
                              
                              {/* Main line */}
                              <motion.path
                                d={pathData}
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                              />
                              
                              {/* Data points */}
                              {points.map((point, index) => (
                                <motion.g key={index}>
                                  <motion.circle
                                    cx={`${point.x}%`}
                                    cy={`${point.y}%`}
                                    r="6"
                                    fill="#fff"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="3"
                                    className="cursor-pointer hover:r-8 transition-all duration-200"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                                    whileHover={{ scale: 1.5 }}
                                  />
                                  
                                  {/* Tooltip on hover */}
                                  <motion.g
                                    className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                    style={{ transform: `translate(${point.x}%, ${point.y}%)` }}
                                  >
                                    <rect
                                      x="-50"
                                      y="-60"
                                      width="100"
                                      height="45"
                                      rx="8"
                                      fill="rgba(0,0,0,0.9)"
                                      stroke="rgba(255,255,255,0.2)"
                                    />
                                    <text
                                      x="0"
                                      y="-35"
                                      textAnchor="middle"
                                      className="text-xs fill-white font-medium"
                                    >
                                      {point.symptom.name}
                                    </text>
                                    <text
                                      x="0"
                                      y="-20"
                                      textAnchor="middle"
                                      className="text-xs fill-cyan-400"
                                    >
                                      Severity: {point.symptom.severity}
                                    </text>
                                  </motion.g>
                                </motion.g>
                              ))}
                            </g>
                          );
                        })()}
                      </svg>
                    ) : (
                      // Empty state
                      <div className="flex items-center justify-center h-full">
                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <FaChartLine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-white text-lg font-semibold mb-2">No symptom data yet</p>
                          <p className="text-gray-400">Start logging symptoms to see your trends</p>
                        </motion.div>
                      </div>
                    )}
                  </div>
                  
                  {/* X-Axis Labels */}
                  {realTimeData.symptoms.length > 0 && (
                    <div className="absolute bottom-2 left-8 right-4 flex justify-between text-xs text-gray-400">
                      {realTimeData.symptoms.slice(0, 7).reverse().map((symptom, index) => (
                        <span key={index} className="transform -rotate-45 origin-left">
                          {new Date(symptom.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Legend */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                          <span className="text-gray-300">Severity Level</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        <div>Scale: 1 (Mild) - 5 (Severe)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms Overview */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <FaEye className="mr-3 text-orange-400" />
                    Recent Symptoms
                    {realTimeData.symptoms.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                        {realTimeData.symptoms.length} total
                      </span>
                    )}
                  </h3>
                  <motion.button
                    onClick={() => setShowLogSymptom(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Log Symptom</span>
                  </motion.button>
                </div>
                
                <div className="space-y-4">
                  {realTimeData.symptoms.length > 0 ? (
                    realTimeData.symptoms.slice(0, 5).map((symptom: any, index) => {
                      const getSeverityColor = (severity: number) => {
                        if (severity <= 2) return { bg: 'bg-green-400', text: 'text-green-400', border: 'border-green-400/30' };
                        if (severity <= 4) return { bg: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-400/30' };
                        return { bg: 'bg-red-400', text: 'text-red-400', border: 'border-red-400/30' };
                      };
                      
                      const getSeverityLabel = (severity: number) => {
                        if (severity <= 2) return 'Mild';
                        if (severity <= 4) return 'Moderate';
                        return 'Severe';
                      };

                      const colors = getSeverityColor(symptom.severity);

                      return (
                        <motion.div
                          key={symptom.id || index}
                          className={`group p-4 bg-gradient-to-r from-black/30 to-black/10 backdrop-blur-sm rounded-xl border ${colors.border} hover:border-opacity-60 transition-all duration-300`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              {/* Severity Indicator */}
                              <div className="flex flex-col items-center space-y-2">
                                <motion.div 
                                  className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center shadow-lg`}
                                  animate={{ 
                                    scale: [1, 1.1, 1],
                                    boxShadow: [`0 0 0 0 ${colors.bg}40`, `0 0 0 8px ${colors.bg}00`, `0 0 0 0 ${colors.bg}00`]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <FaEye className="w-5 h-5 text-white" />
                                </motion.div>
                                <div className="text-center">
                                  <p className={`text-xs font-bold ${colors.text}`}>{getSeverityLabel(symptom.severity)}</p>
                                  <p className="text-xs text-gray-500">{symptom.severity}/5</p>
                                </div>
                              </div>
                              
                              {/* Symptom Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-white font-semibold text-lg truncate">{symptom.title || symptom.name}</h4>
                                  <div className="flex items-center space-x-2 text-gray-400">
                                    <FaCalendarAlt className="w-3 h-3" />
                                    <span className="text-sm whitespace-nowrap">{getTimeAgo(symptom.created_at)}</span>
                                  </div>
                                </div>
                                
                                {/* Exact timestamp */}
                                <p className="text-xs text-gray-500 mb-2">
                                  Logged: {new Date(symptom.created_at).toLocaleString()}
                                </p>
                                
                                {symptom.description && (
                                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                    {symptom.description}
                                  </p>
                                )}
                                
                                {/* Severity Progress Bar */}
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs text-gray-400">Severity:</span>
                                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                      className={`h-full ${colors.bg}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(symptom.severity / 5) * 100}%` }}
                                      transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                                    />
                                  </div>
                                  <span className={`text-xs font-bold ${colors.text}`}>{symptom.severity}</span>
                                </div>
                                
                                {/* Additional Info */}
                                <div className="flex items-center justify-between text-xs">
                                  {symptom.body_part && (
                                    <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                                      📍 {symptom.body_part}
                                    </span>
                                  )}
                                  {symptom.triggers && (
                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                                      ⚡ {symptom.triggers}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <motion.button
                                className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditSymptom(symptom)}
                                title="Edit symptom"
                              >
                                <FaEdit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleViewSymptom(symptom)}
                                title="View details"
                              >
                                <FaEye className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FaEye className="w-8 h-8 text-orange-400" />
                      </motion.div>
                      <h4 className="text-white text-lg font-semibold mb-2">No symptoms logged yet</h4>
                      <p className="text-gray-400 mb-4">Start tracking your health by logging your first symptom</p>
                      <motion.button
                        onClick={() => setShowLogSymptom(true)}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaPlus className="w-4 h-4" />
                        <span>Log Your First Symptom</span>
                      </motion.button>
                    </motion.div>
                  )}
                  
                  {realTimeData.symptoms.length > 5 && (
                    <motion.button
                      className="w-full p-3 text-gray-400 hover:text-white text-sm hover:bg-white/5 rounded-lg transition-all duration-200 border border-gray-700/50 hover:border-orange-400/30"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        addNotification({
                          type: 'info',
                          title: 'View All Symptoms',
                          message: `Showing all ${realTimeData.symptoms.length} symptoms`
                        });
                      }}
                    >
                      View all {realTimeData.symptoms.length} symptoms →
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Recent Exercises */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <FaRunning className="mr-3 text-green-400" />
                    Recent Exercises
                    {realTimeData.exercises.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                        {realTimeData.exercises.length} total
                      </span>
                    )}
                  </h3>
                  <motion.button
                    onClick={() => setShowExerciseLog(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Log Exercise</span>
                  </motion.button>
                </div>
                
                <div className="space-y-4">
                  {realTimeData.exercises.length > 0 ? (
                    realTimeData.exercises.slice(0, 5).map((exercise: any, index) => (
                      <motion.div
                        key={exercise.id}
                        className="group p-4 bg-gradient-to-r from-black/30 to-black/10 backdrop-blur-sm rounded-xl border border-green-400/30 hover:border-opacity-60 transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Exercise Icon */}
                            <div className="flex flex-col items-center space-y-2">
                              <motion.div 
                                className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center shadow-lg"
                                animate={{ 
                                  scale: [1, 1.1, 1],
                                  boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 8px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <FaRunning className="w-5 h-5 text-white" />
                              </motion.div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-green-400">Level {exercise.intensity_level}</p>
                                <p className="text-xs text-gray-500">{exercise.intensity_level}/5</p>
                              </div>
                            </div>
                            
                            {/* Exercise Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-semibold text-lg capitalize truncate">
                                  {exercise.exercise_type.replace('_', ' ')}
                                </h4>
                                <div className="flex items-center space-x-2 text-gray-400">
                                  <FaCalendarAlt className="w-3 h-3" />
                                  <span className="text-sm whitespace-nowrap">{getTimeAgo(exercise.created_at)}</span>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-500 mb-2">
                                Logged: {new Date(exercise.created_at).toLocaleString()}
                              </p>
                              
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-1">
                                  <FaClock className="w-3 h-3 text-blue-400" />
                                  <span className="text-sm text-gray-300">{exercise.duration_minutes} min</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <FaFire className="w-3 h-3 text-orange-400" />
                                  <span className="text-sm text-gray-300">{exercise.calories_burned} cal</span>
                                </div>
                              </div>
                              
                              {exercise.notes && (
                                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                  {exercise.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <motion.button
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                addNotification({
                                  type: 'info',
                                  title: 'Exercise Details',
                                  message: `${exercise.exercise_type}: ${exercise.duration_minutes}min, ${exercise.calories_burned}cal burned`
                                });
                              }}
                            >
                              <FaEye className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FaRunning className="w-8 h-8 text-green-400" />
                      </motion.div>
                      <h4 className="text-white text-lg font-semibold mb-2">No exercises logged yet</h4>
                      <p className="text-gray-400 mb-4">Start your fitness journey by logging your first workout</p>
                      <motion.button
                        onClick={() => setShowExerciseLog(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaPlus className="w-4 h-4" />
                        <span>Log Your First Exercise</span>
                      </motion.button>
                    </motion.div>
                  )}
                  
                  {realTimeData.exercises.length > 5 && (
                    <motion.button
                      className="w-full p-3 text-gray-400 hover:text-white text-sm hover:bg-white/5 rounded-lg transition-all duration-200 border border-gray-700/50 hover:border-green-400/30"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        addNotification({
                          type: 'info',
                          title: 'View All Exercises',
                          message: `Showing all ${realTimeData.exercises.length} exercises`
                        });
                      }}
                    >
                      View all {realTimeData.exercises.length} exercises →
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Quick Actions & Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {/* Quick Actions */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <FaRocket className="mr-3 text-purple-400" />
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  {[
                    { 
                      icon: FaPlus, 
                      label: 'Log Symptom', 
                      action: () => setShowLogSymptom(true), 
                      color: 'from-red-500 to-pink-500',
                      description: 'Track new symptoms'
                    },
                    { 
                      icon: FaPills, 
                      label: 'Add Medication', 
                      action: () => setShowMedicationForm(true), 
                      color: 'from-blue-500 to-cyan-500',
                      description: 'Manage medications'
                    },
                    { 
                      icon: FaSmile, 
                      label: 'Mood Check', 
                      action: () => setShowMoodTracker(true), 
                      color: 'from-yellow-500 to-orange-500',
                      description: 'Track your mood'
                    },
                    { 
                      icon: FaRunning, 
                      label: 'Log Exercise', 
                      action: () => setShowExerciseLog(true), 
                      color: 'from-green-500 to-emerald-500',
                      description: 'Record activities'
                    }
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      onClick={action.action}
                      className={`w-full p-4 bg-gradient-to-r ${action.color} rounded-xl text-white font-medium flex items-center justify-between hover:scale-105 transition-all duration-200 group`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className="p-2 bg-white/20 rounded-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <action.icon className="w-5 h-5" />
                        </motion.div>
                        <div className="text-left">
                          <p className="font-semibold">{action.label}</p>
                          <p className="text-xs opacity-80">{action.description}</p>
                        </div>
                      </div>
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <FaArrowUp className="w-4 h-4 transform rotate-45" />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Today's Medications */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <FaPills className="mr-3 text-green-400" />
                    Today's Medications
                  </h3>
                  <motion.button
                    onClick={() => setShowMedicationForm(true)}
                    className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="w-3 h-3" />
                  </motion.button>
                </div>
                
                <div className="space-y-3">
                  {realTimeData.medications.length > 0 ? (
                    realTimeData.medications.slice(0, 4).map((med: any, index) => {
                      const getTimeFormat = (timeString: string) => {
                        if (!timeString) return 'Not set';
                        try {
                          const time = new Date(`2000-01-01T${timeString}`);
                          return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch {
                          return timeString;
                        }
                      };

                      return (
                        <motion.div
                          key={med.id || index}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-green-400/30"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div
                              className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <FaPills className="w-4 h-4 text-white" />
                            </motion.div>
                            <div>
                              <p className="text-white font-medium">{med.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span>{med.dosage}</span>
                                {med.schedule && (
                                  <>
                                    <span>•</span>
                                    <span>{getTimeFormat(med.schedule)}</span>
                                  </>
                                )}
                              </div>
                              {med.frequency && (
                                <p className="text-xs text-gray-500">{med.frequency}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <motion.button
                              className="w-8 h-8 rounded-full border-2 border-gray-400 hover:border-green-400 hover:bg-green-500 transition-all duration-200 flex items-center justify-center group"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                // Toggle taken status
                                addNotification({
                                  type: 'success',
                                  title: 'Medication Taken',
                                  message: `Marked ${med.name} as taken`
                                });
                              }}
                            >
                              <FaCheck className="w-3 h-3 text-transparent group-hover:text-white transition-colors duration-200" />
                            </motion.button>
                            <motion.button
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaEdit className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      className="text-center py-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <FaPills className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-3">No medications added yet</p>
                      <motion.button
                        onClick={() => setShowMedicationForm(true)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add Your First Medication
                      </motion.button>
                    </motion.div>
                  )}
                  
                  {realTimeData.medications.length > 4 && (
                    <motion.button
                      className="w-full p-2 text-gray-400 hover:text-white text-sm hover:bg-white/5 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      View all {realTimeData.medications.length} medications
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Health Insights */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <FaBrain className="mr-3 text-indigo-400" />
                  AI Insights
                </h3>
                
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                    <p className="text-white text-sm leading-relaxed">
                      💡 Your symptoms show improvement this week. Consider maintaining your current sleep schedule.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <p className="text-white text-sm leading-relaxed">
                      🎯 You're 87% consistent with medication intake. Great job!
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Floating Log Symptom Button */}
      <motion.button
        onClick={() => setShowLogSymptom(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-20"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, duration: 0.8, type: "spring", stiffness: 150 }}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaPlus className="w-6 h-6" />
      </motion.button>

      {/* Forms */}
      <AnimatePresence>
        {showLogSymptom && (
          <SymptomForm
            onClose={() => setShowLogSymptom(false)}
            onSubmit={() => {
              setShowLogSymptom(false);
              loadRealTimeData();
            }}
          />
        )}
        {showMedicationForm && (
          <MedicationForm
            onClose={() => setShowMedicationForm(false)}
            onSubmit={() => {
              setShowMedicationForm(false);
              loadRealTimeData();
            }}
          />
        )}
        {showMoodTracker && (
          <MoodTracker
            onClose={() => setShowMoodTracker(false)}
            onSubmit={handleMoodSubmit}
          />
        )}
        {showExerciseLog && (
          <ExerciseTracker
            onClose={() => setShowExerciseLog(false)}
            onSubmit={() => {
              setShowExerciseLog(false);
              loadRealTimeData();
            }}
          />
        )}
        {showSymptomForm && (
          <SymptomForm
            onClose={() => {
              setShowSymptomForm(false);
              setEditingSymptom(null);
            }}
            onSubmit={() => {
              setShowSymptomForm(false);
              setEditingSymptom(null);
              loadRealTimeData();
            }}
          />
        )}
        {showProfileForm && (
          <ProfileForm
            profile={realTimeData.profile}
            onClose={() => setShowProfileForm(false)}
            onSubmit={() => {
              setShowProfileForm(false);
              loadRealTimeData();
            }}
          />
        )}
        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            userId={user?.id || ''}
            userName={user?.name || realTimeData.profile?.full_name || 'User'}
          />
        )}
        {showSymptomDetails && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSymptomDetails(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Symptom Details</h3>
                <button
                  onClick={() => setShowSymptomDetails(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-sm">Symptom</label>
                  <p className="text-white font-medium">{showSymptomDetails.name || showSymptomDetails.title}</p>
                </div>
                
                {showSymptomDetails.description && (
                  <div>
                    <label className="text-white/60 text-sm">Description</label>
                    <p className="text-white">{showSymptomDetails.description}</p>
                  </div>
                )}
                
                {showSymptomDetails.severity_level && (
                  <div>
                    <label className="text-white/60 text-sm">Severity</label>
                    <p className="text-white">{showSymptomDetails.severity_level}/10</p>
                  </div>
                )}
                
                <div>
                  <label className="text-white/60 text-sm">Date</label>
                  <p className="text-white">{new Date(showSymptomDetails.created_at || showSymptomDetails.date).toLocaleDateString()}</p>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <motion.button
                    onClick={() => {
                      setShowSymptomDetails(null);
                      handleEditSymptom(showSymptomDetails);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowSymptomDetails(null);
                      handleDeleteSymptom(showSymptomDetails.id);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
