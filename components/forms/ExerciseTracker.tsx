import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaRunning, 
  FaBicycle, 
  FaSwimmer, 
  FaDumbbell, 
  FaWalking,
  FaHeartbeat,
  FaClock,
  FaFire,
  FaCalendarAlt,
  FaSave,
  FaPlay,
  FaStop
} from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { exerciseHelpers } from '@/lib/supabase-helpers';

interface ExerciseTrackerProps {
  onClose: () => void;
  onSubmit: () => void;
}

const exerciseTypes = [
  { id: 'running', icon: FaRunning, label: 'Running', color: 'from-red-500 to-red-700', bgColor: 'bg-red-500/20' },
  { id: 'cycling', icon: FaBicycle, label: 'Cycling', color: 'from-blue-500 to-blue-700', bgColor: 'bg-blue-500/20' },
  { id: 'swimming', icon: FaSwimmer, label: 'Swimming', color: 'from-cyan-500 to-cyan-700', bgColor: 'bg-cyan-500/20' },
  { id: 'weightlifting', icon: FaDumbbell, label: 'Weight Lifting', color: 'from-purple-500 to-purple-700', bgColor: 'bg-purple-500/20' },
  { id: 'walking', icon: FaWalking, label: 'Walking', color: 'from-green-500 to-green-700', bgColor: 'bg-green-500/20' },
];

const intensityLevels = [
  { id: 1, label: 'Light', description: 'Easy pace, can talk easily', color: 'text-green-400' },
  { id: 2, label: 'Moderate', description: 'Comfortable effort', color: 'text-yellow-400' },
  { id: 3, label: 'Vigorous', description: 'Hard effort, breathing heavily', color: 'text-orange-400' },
  { id: 4, label: 'Very Hard', description: 'Very hard effort', color: 'text-red-400' },
  { id: 5, label: 'Maximum', description: 'All-out effort', color: 'text-red-600' },
];

export default function ExerciseTracker({ onClose, onSubmit }: ExerciseTrackerProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<number>(2);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Calculate estimated calories burned
  const calculateCalories = (exerciseType: string, durationMin: number, intensityLevel: number) => {
    const baseCaloriesPerMinute: { [key: string]: number } = {
      running: 12,
      cycling: 8,
      swimming: 10,
      weightlifting: 6,
      walking: 4,
    };
    
    const base = baseCaloriesPerMinute[exerciseType] || 5;
    const multiplier = 0.5 + (intensityLevel * 0.3);
    return Math.round(base * durationMin * multiplier);
  };

  // Update calories when exercise type, duration, or intensity changes
  const handleExerciseChange = (type: string) => {
    setSelectedExercise(type);
    setCaloriesBurned(calculateCalories(type, duration, intensity));
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    if (selectedExercise) {
      setCaloriesBurned(calculateCalories(selectedExercise, newDuration, intensity));
    }
  };

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    if (selectedExercise) {
      setCaloriesBurned(calculateCalories(selectedExercise, duration, newIntensity));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExercise) {
      addNotification({
        type: 'error',
        title: 'Incomplete Entry',
        message: 'Please select an exercise type'
      });
      return;
    }

    if (duration <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Duration',
        message: 'Duration must be greater than 0'
      });
      return;
    }

    if (!user?.id) {
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'Please log in to save your exercise'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Supabase database
      const exerciseData = {
        user_id: user.id,
        exercise_type: selectedExercise,
        duration_minutes: duration,
        intensity_level: intensity,
        calories_burned: caloriesBurned,
        notes: notes.trim() || null,
        is_ongoing: false,
        started_at: null,
        completed_at: new Date().toISOString()
      };

      await exerciseHelpers.addExercise(exerciseData);

      addNotification({
        type: 'success',
        title: 'Exercise Logged',
        message: `${exerciseTypes.find(e => e.id === selectedExercise)?.label} session recorded successfully`
      });

      onSubmit();
    } catch (error) {
      console.error('Error saving exercise:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save exercise session'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!selectedExercise) {
      addNotification({
        type: 'error',
        title: 'Incomplete Entry',
        message: 'Please select an exercise type'
      });
      return;
    }

    if (!user?.id) {
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'Please log in to start your workout'
      });
      return;
    }

    setIsStartingWorkout(true);

    try {
      // Start ongoing exercise
      const exerciseData = {
        user_id: user.id,
        exercise_type: selectedExercise,
        duration_minutes: duration,
        intensity_level: intensity,
        calories_burned: caloriesBurned,
        notes: notes.trim() || null,
        is_ongoing: true,
        started_at: new Date().toISOString(),
        completed_at: null
      };

      await exerciseHelpers.startExercise(exerciseData);

      addNotification({
        type: 'success',
        title: 'Workout Started',
        message: `${exerciseTypes.find(e => e.id === selectedExercise)?.label} session started! Track your progress in the ongoing section.`
      });

      onSubmit();
    } catch (error) {
      console.error('Error starting workout:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to start workout session'
      });
    } finally {
      setIsStartingWorkout(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <FaRunning className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">Exercise Tracker</h2>
                <p className="text-gray-400 text-sm">Log your workout and track your fitness</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes className="w-5 h-5" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Exercise Type Selection */}
            <div>
              <label className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaRunning className="mr-3 text-green-400" />
                What exercise did you do?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {exerciseTypes.map((exercise, index) => (
                  <motion.button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleExerciseChange(exercise.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedExercise === exercise.id
                        ? 'border-white/40 bg-white/10 scale-105'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-12 h-12 bg-gradient-to-r ${exercise.color} rounded-xl flex items-center justify-center`}>
                        <exercise.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{exercise.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Duration Input */}
            <div>
              <label className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaClock className="mr-3 text-blue-400" />
                How long did you exercise?
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={duration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5 min</span>
                    <span>180 min</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{duration}</div>
                  <div className="text-xs text-gray-400">minutes</div>
                </div>
              </div>
            </div>

            {/* Intensity Selection */}
            <div>
              <label className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaHeartbeat className="mr-3 text-red-400" />
                How intense was your workout?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {intensityLevels.map((level, index) => (
                  <motion.button
                    key={level.id}
                    type="button"
                    onClick={() => handleIntensityChange(level.id)}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      intensity === level.id
                        ? 'border-white/40 bg-white/10 scale-105'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-bold ${level.color}`}>{level.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{level.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Estimated Calories */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-center justify-center space-x-4">
                <FaFire className="w-6 h-6 text-orange-400" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{caloriesBurned}</div>
                  <div className="text-sm text-gray-300">Estimated calories burned</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCalendarAlt className="mr-3 text-cyan-400" />
                Additional Notes (Optional)
              </label>
              <motion.textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you feel? Any achievements or observations..."
                className="w-full h-24 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all duration-200 resize-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              />
            </div>

            {/* Submit Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Workout Button */}
              <motion.button
                type="button"
                onClick={handleStartWorkout}
                disabled={!selectedExercise || duration <= 0 || isStartingWorkout}
                className="py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: selectedExercise && duration > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedExercise && duration > 0 ? 0.98 : 1 }}
              >
                {isStartingWorkout ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Starting Workout...</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="w-5 h-5" />
                    <span>Start Workout</span>
                  </>
                )}
              </motion.button>

              {/* Log Completed Exercise Button */}
              <motion.button
                type="submit"
                disabled={!selectedExercise || duration <= 0 || isSubmitting}
                className="py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: selectedExercise && duration > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedExercise && duration > 0 ? 0.98 : 1 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Saving Exercise...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="w-5 h-5" />
                    <span>Log Completed Exercise</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
