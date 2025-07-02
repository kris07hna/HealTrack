import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaLeaf, FaHeart, FaBrain, FaStar } from 'react-icons/fa';
import { useTheme } from '../../lib/theme';
import { meditationHelpers } from '../../lib/supabase-helpers';
import { useNotifications } from '../../lib/notifications';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/database';

interface MeditationSession {
  id: string;
  title: string;
  duration: number; // in minutes
  type: 'breathing' | 'mindfulness' | 'sleep' | 'focus';
  icon: React.ElementType;
  color: string;
}

interface MeditationCenterProps {
  onSessionCompleted?: () => Promise<void>;
}

const sessions: MeditationSession[] = [
  {
    id: '1',
    title: 'Deep Breathing',
    duration: 5,
    type: 'breathing',
    icon: FaLeaf,
    color: 'from-green-400 to-green-600'
  },
  {
    id: '2',
    title: 'Mindful Moment',
    duration: 10,
    type: 'mindfulness',
    icon: FaBrain,
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: '3',
    title: 'Sleep Meditation',
    duration: 15,
    type: 'sleep',
    icon: FaHeart,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: '4',
    title: 'Focus Boost',
    duration: 8,
    type: 'focus',
    icon: FaStar,
    color: 'from-orange-400 to-orange-600'
  }
];

export default function MeditationCenter({ onSessionCompleted }: MeditationCenterProps) {
  const { theme } = useTheme();
  const { addNotification } = useNotifications();
  const { user, isAuthenticated } = useAuth();
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [totalSessions, setTotalSessions] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const subscriptionRef = useRef<{ subscription: any, channel: any } | null>(null);

  // Set up real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      if (isAuthenticated && user) {
        try {
          // First, load initial data
          await fetchMeditationStats(user.id);
          
          // Set up real-time subscription for meditation sessions
          const channel = supabase.channel(`meditation_sessions_${user.id}`);
          
          // Subscribe to all changes for this user's meditation sessions
          const subscription = channel
            .on(
              'postgres_changes', 
              { 
                event: '*', 
                schema: 'public', 
                table: 'meditation_sessions',
                filter: `user_id=eq.${user.id}`
              },
              async (payload) => {
                console.log('Meditation session changed:', payload);
                // Refresh data when any change happens
                await fetchMeditationStats(user.id);
              }
            )
            .subscribe((status) => {
              console.log('Meditation real-time subscription status:', status);
              setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'reconnecting');
            });
          
          subscriptionRef.current = { subscription, channel };
          setConnectionStatus('connected');
        } catch (error) {
          console.error('Failed to subscribe to real-time meditation updates:', error);
          setConnectionStatus('disconnected');
        }
      }
      setLoading(false);
    };
    
    setupRealtimeSubscription();
    
    // Cleanup subscription
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.channel.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [isAuthenticated, user]);

  // Test database connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('meditation_sessions').select('count()', { count: 'exact', head: true });
      if (error) throw error;
      console.log('Connection test successful for meditation sessions', data);
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      console.error('Connection test failed for meditation sessions:', error);
      setConnectionStatus('disconnected');
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to the database. Some features may be limited.'
      });
      return false;
    }
  };
  
  const fetchMeditationStats = async (userId: string) => {
    try {
      // First test connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      
      const stats = await meditationHelpers.getMeditationSessions(userId, 30);
      setTotalSessions(stats.totalSessions);
      setWeeklyMinutes(stats.totalMinutes);
      
      console.log('Meditation stats loaded:', {
        totalSessions: stats.totalSessions,
        totalMinutes: stats.totalMinutes,
        completionRate: stats.completionRate
      });
    } catch (error) {
      console.error('Error fetching meditation stats:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Load Meditation Data',
        message: 'Could not retrieve your meditation history.'
      });
    }
  };

  const saveMeditationSession = async (session: MeditationSession, completedSeconds: number) => {
    if (!user) return;
    
    try {
      // First test connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      
      console.log('Saving meditation session:', {
        user_id: user.id,
        session_type: session.type,
        duration: Math.floor(completedSeconds / 60),
        completed: completedSeconds >= session.duration * 60,
        completedSeconds
      });

      // Set up a timeout to detect if the operation takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), 10000); // 10 second timeout
      });

      // Race the actual operation against the timeout
      const result = await Promise.race([
        meditationHelpers.startMeditationSession({
          user_id: user.id,
          session_type: session.type,
          duration: Math.floor(completedSeconds / 60), // Convert to minutes
        }),
        timeoutPromise
      ]) as any;
      
      // If session completed, mark it as complete
      if (completedSeconds >= session.duration * 60 && result.id) {
        await meditationHelpers.completeMeditationSession(result.id);
      }

      console.log('Meditation session saved:', result);

      const isCompleted = completedSeconds >= session.duration * 60;
      
      addNotification({
        type: 'success',
        title: isCompleted ? 'Meditation Session Completed! 🧘‍♀️' : 'Meditation Session Saved',
        message: isCompleted 
          ? `Congratulations! You completed ${session.duration} minutes of ${session.title.toLowerCase()}.`
          : `Your ${Math.floor(completedSeconds / 60)} minute meditation session has been saved.`
      });
      
      // Refresh stats after saving
      await fetchMeditationStats(user.id);
      
      // Call the parent component's callback if provided
      if (onSessionCompleted) {
        await onSessionCompleted();
      }
    } catch (error) {
      console.error('Error saving meditation session:', error);
      
      // Check if it's a timeout error
      const errorMessage = error instanceof Error && error.message === 'Operation timed out'
        ? 'The operation is taking longer than expected. Please try again.'
        : 'Could not save your meditation session. Please try again.';
      
      addNotification({
        type: 'error',
        title: 'Failed to Save Session',
        message: errorMessage
      });
      addNotification({
        type: 'error',
        title: 'Failed to Save Session',
        message: 'Could not save your meditation session. Please try again.'
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            // Save completed session
            if (activeSession) {
              const completedSeconds = activeSession.duration * 60;
              saveMeditationSession(activeSession, completedSeconds);
            }
            setActiveSession(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, activeSession]);

  // Breathing animation cycle
  useEffect(() => {
    let breathingInterval: NodeJS.Timeout;
    
    if (isPlaying && activeSession?.type === 'breathing') {
      breathingInterval = setInterval(() => {
        setBreathingPhase(prev => {
          switch (prev) {
            case 'inhale': return 'hold';
            case 'hold': return 'exhale';
            case 'exhale': return 'inhale';
          }
        });
      }, 4000); // 4 seconds per phase
    }

    return () => clearInterval(breathingInterval);
  }, [isPlaying, activeSession]);

  const startSession = (session: MeditationSession) => {
    setActiveSession(session);
    setTimeLeft(session.duration * 60); // Convert to seconds
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const stopSession = () => {
    // Save partial session if more than 1 minute completed
    if (activeSession && timeLeft < activeSession.duration * 60 - 60) {
      const completedSeconds = activeSession.duration * 60 - timeLeft;
      saveMeditationSession(activeSession, completedSeconds);
    }
    
    setIsPlaying(false);
    setActiveSession(null);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingText = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
    }
  };

  if (!user || loading) {
    return (
      <div className="glass-card bg-white/60 dark:bg-gray-800/60 p-6 rounded-3xl shadow-xl">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card bg-white/60 dark:bg-gray-800/60 p-6 rounded-3xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <FaLeaf className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Meditation</h3>
            <p className="text-gray-600 dark:text-gray-400">Find your inner peace</p>
          </div>
        </div>
        
        <div className="flex space-x-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalSessions}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyMinutes}m</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">This Month</div>
          </div>
          {/* Connection Status Indicator */}
          <div className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full mr-1 ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500 animate-pulse' 
                  : connectionStatus === 'reconnecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {connectionStatus === 'connected' ? 'Online' : 
               connectionStatus === 'reconnecting' ? 'Syncing...' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeSession ? (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-4"
          >
            {sessions.map((session) => (
              <motion.button
                key={session.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startSession(session)}
                className={`p-4 rounded-2xl bg-gradient-to-r ${session.color} text-white shadow-lg hover:shadow-xl transition-all`}
              >
                <session.icon className="text-2xl mb-2 mx-auto" />
                <h4 className="font-semibold text-sm mb-1">{session.title}</h4>
                <p className="text-xs opacity-90">{session.duration} min</p>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="active-session"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            {/* Active Session Display */}
            <div className="mb-6">
              <motion.div
                animate={activeSession.type === 'breathing' ? {
                  scale: breathingPhase === 'inhale' ? 1.2 : breathingPhase === 'hold' ? 1.2 : 1,
                } : { scale: [1, 1.05, 1] }}
                transition={activeSession.type === 'breathing' ? {
                  duration: 4,
                  ease: "easeInOut"
                } : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r ${activeSession.color} flex items-center justify-center mb-4 shadow-2xl`}
              >
                <activeSession.icon className="text-white text-4xl" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {activeSession.title}
              </h3>
              
              {activeSession.type === 'breathing' && isPlaying && (
                <motion.p
                  key={breathingPhase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg text-gray-600 dark:text-gray-400 mb-4"
                >
                  {getBreathingText()}
                </motion.p>
              )}
              
              <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-6">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center shadow-lg"
              >
                {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={stopSession}
                className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
              >
                <FaStop className="text-xl" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar for Active Session */}
      {activeSession && (
        <div className="mt-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full bg-gradient-to-r ${activeSession.color}`}
              initial={{ width: '0%' }}
              animate={{ 
                width: `${((activeSession.duration * 60 - timeLeft) / (activeSession.duration * 60)) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
