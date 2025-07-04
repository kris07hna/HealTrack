import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRunning, 
  FaBicycle, 
  FaSwimmer, 
  FaDumbbell, 
  FaWalking,
  FaStop,
  FaPause,
  FaPlay,
  FaClock,
  FaFire,
  FaHeartbeat
} from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { exerciseHelpers } from '@/lib/supabase-helpers';

interface OngoingExercise {
  id: string;
  user_id: string;
  exercise_type: string;
  duration_minutes: number;
  intensity_level: number;
  calories_burned: number;
  notes: string | null;
  is_ongoing: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface OngoingExercisesProps {
  onExerciseCompleted: () => void;
}

const exerciseTypeIcons: { [key: string]: any } = {
  running: FaRunning,
  cycling: FaBicycle,
  swimming: FaSwimmer,
  weightlifting: FaDumbbell,
  walking: FaWalking,
};

const exerciseTypeColors: { [key: string]: string } = {
  running: 'from-red-500 to-red-700',
  cycling: 'from-blue-500 to-blue-700',
  swimming: 'from-cyan-500 to-cyan-700',
  weightlifting: 'from-purple-500 to-purple-700',
  walking: 'from-green-500 to-green-700',
};

export default function OngoingExercises({ onExerciseCompleted }: OngoingExercisesProps) {
  const [ongoingExercises, setOngoingExercises] = useState<OngoingExercise[]>([]);
  const [elapsedTimes, setElapsedTimes] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [completingExercise, setCompletingExercise] = useState<string | null>(null);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Load ongoing exercises
  const loadOngoingExercises = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const exercises = await exerciseHelpers.getOngoingExercises(user.id);
      setOngoingExercises(exercises);
      
      // Initialize elapsed times
      const times: { [key: string]: number } = {};
      exercises.forEach(exercise => {
        if (exercise.started_at) {
          const startTime = new Date(exercise.started_at).getTime();
          const now = new Date().getTime();
          times[exercise.id] = Math.floor((now - startTime) / 1000);
        }
      });
      setElapsedTimes(times);
    } catch (error) {
      console.error('Error loading ongoing exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update elapsed times every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTimes(prev => {
        const updated = { ...prev };
        ongoingExercises.forEach(exercise => {
          if (exercise.started_at) {
            const startTime = new Date(exercise.started_at).getTime();
            const now = new Date().getTime();
            updated[exercise.id] = Math.floor((now - startTime) / 1000);
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ongoingExercises]);

  // Load exercises on component mount
  useEffect(() => {
    loadOngoingExercises();
  }, [user?.id]);

  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate real-time calories
  const calculateRealtimeCalories = (exercise: OngoingExercise, elapsedMinutes: number) => {
    const baseCaloriesPerMinute: { [key: string]: number } = {
      running: 12,
      cycling: 8,
      swimming: 10,
      weightlifting: 6,
      walking: 4,
    };
    
    const base = baseCaloriesPerMinute[exercise.exercise_type] || 5;
    const multiplier = 0.5 + (exercise.intensity_level * 0.3);
    return Math.round(base * elapsedMinutes * multiplier);
  };

  // Complete exercise
  const completeExercise = async (exercise: OngoingExercise) => {
    if (!user?.id || completingExercise) return;
    
    setCompletingExercise(exercise.id);
    
    try {
      const elapsedSeconds = elapsedTimes[exercise.id] || 0;
      const elapsedMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));
      const realtimeCalories = calculateRealtimeCalories(exercise, elapsedMinutes);
      
      await exerciseHelpers.completeExercise(exercise.id, {
        duration_minutes: elapsedMinutes,
        calories_burned: realtimeCalories
      });
      
      addNotification({
        type: 'success',
        title: 'Workout Completed!',
        message: `Great job! You completed ${elapsedMinutes} minutes of ${exercise.exercise_type} and burned ${realtimeCalories} calories.`
      });
      
      await loadOngoingExercises();
      onExerciseCompleted();
    } catch (error) {
      console.error('Error completing exercise:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete exercise'
      });
    } finally {
      setCompletingExercise(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-center py-8">
          <motion.div
            className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (ongoingExercises.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaPlay className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white">Ongoing Workouts</h3>
          <p className="text-gray-400 text-sm">{ongoingExercises.length} active session{ongoingExercises.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {ongoingExercises.map((exercise, index) => {
            const IconComponent = exerciseTypeIcons[exercise.exercise_type] || FaRunning;
            const colorClass = exerciseTypeColors[exercise.exercise_type] || 'from-gray-500 to-gray-700';
            const elapsedSeconds = elapsedTimes[exercise.id] || 0;
            const elapsedMinutes = Math.floor(elapsedSeconds / 60);
            const realtimeCalories = calculateRealtimeCalories(exercise, elapsedMinutes);

            return (
              <motion.div
                key={exercise.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold capitalize">
                        {exercise.exercise_type.replace('_', ' ')}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <FaClock className="w-3 h-3" />
                          <span>{formatElapsedTime(elapsedSeconds)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaFire className="w-3 h-3" />
                          <span>{realtimeCalories} cal</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaHeartbeat className="w-3 h-3" />
                          <span>Intensity {exercise.intensity_level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => completeExercise(exercise)}
                    disabled={completingExercise === exercise.id}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {completingExercise === exercise.id ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Completing...</span>
                      </>
                    ) : (
                      <>
                        <FaStop className="w-4 h-4" />
                        <span>Complete</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
