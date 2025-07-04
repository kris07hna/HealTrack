import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaSmile, 
  FaFrown, 
  FaMeh, 
  FaGrinBeam, 
  FaSadTear,
  FaAngry,
  FaHeart,
  FaSun,
  FaCloud,
  FaCloudRain,
  FaCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { moodHelpers } from '@/lib/supabase-helpers';

interface MoodTrackerProps {
  onClose: () => void;
  onSubmit: () => void;
}

const moodOptions = [
  { id: 1, icon: FaSadTear, label: 'Very Sad', color: 'from-blue-600 to-blue-800', bgColor: 'bg-blue-500/20' },
  { id: 2, icon: FaFrown, label: 'Sad', color: 'from-blue-500 to-blue-700', bgColor: 'bg-blue-500/20' },
  { id: 3, icon: FaMeh, label: 'Neutral', color: 'from-gray-500 to-gray-700', bgColor: 'bg-gray-500/20' },
  { id: 4, icon: FaSmile, label: 'Happy', color: 'from-green-500 to-green-700', bgColor: 'bg-green-500/20' },
  { id: 5, icon: FaGrinBeam, label: 'Very Happy', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/20' },
];

const energyLevels = [
  { id: 1, label: 'Very Low', icon: FaCloudRain, color: 'text-blue-400' },
  { id: 2, label: 'Low', icon: FaCloud, color: 'text-gray-400' },
  { id: 3, label: 'Moderate', icon: FaCloud, color: 'text-yellow-400' },
  { id: 4, label: 'High', icon: FaSun, color: 'text-orange-400' },
  { id: 5, label: 'Very High', icon: FaSun, color: 'text-red-400' },
];

export default function MoodTracker({ onClose, onSubmit }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMood || !selectedEnergy) {
      addNotification({
        type: 'error',
        title: 'Incomplete Entry',
        message: 'Please select both mood and energy level'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Supabase using mood helpers
      const moodLabel = moodOptions.find(m => m.id === selectedMood)?.label || '';
      const moodData = {
        user_id: user?.id || '',
        mood_value: selectedMood,
        mood_description: moodLabel,
        notes: notes.trim() || null
      };

      await moodHelpers.addMoodEntry(moodData);

      addNotification({
        type: 'success',
        title: 'Mood Tracked',
        message: 'Your mood has been recorded successfully'
      });

      onSubmit();
    } catch (error) {
      console.error('Error saving mood:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save mood entry'
      });
    } finally {
      setIsSubmitting(false);
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
          className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <FaSmile className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">Mood Tracker</h2>
                <p className="text-gray-400 text-sm">How are you feeling today?</p>
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
            {/* Mood Selection */}
            <div>
              <label className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaHeart className="mr-3 text-pink-400" />
                How is your mood today?
              </label>
              <div className="grid grid-cols-5 gap-4">
                {moodOptions.map((mood, index) => (
                  <motion.button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedMood === mood.id
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
                      <div className={`w-12 h-12 bg-gradient-to-r ${mood.color} rounded-xl flex items-center justify-center`}>
                        <mood.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{mood.label}</span>
                      <span className="text-gray-400 text-xs">{mood.id}/5</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Energy Level Selection */}
            <div>
              <label className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaSun className="mr-3 text-yellow-400" />
                What's your energy level?
              </label>
              <div className="grid grid-cols-5 gap-4">
                {energyLevels.map((energy, index) => (
                  <motion.button
                    key={energy.id}
                    type="button"
                    onClick={() => setSelectedEnergy(energy.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedEnergy === energy.id
                        ? 'border-white/40 bg-white/10 scale-105'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <energy.icon className={`w-8 h-8 ${energy.color}`} />
                      <span className="text-white text-sm font-medium">{energy.label}</span>
                      <span className="text-gray-400 text-xs">{energy.id}/5</span>
                    </div>
                  </motion.button>
                ))}
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
                placeholder="What influenced your mood today? Any thoughts or observations..."
                className="w-full h-32 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 resize-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!selectedMood || !selectedEnergy || isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: selectedMood && selectedEnergy ? 1.02 : 1 }}
              whileTap={{ scale: selectedMood && selectedEnergy ? 0.98 : 1 }}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Saving Mood...</span>
                </>
              ) : (
                <>
                  <FaHeart className="w-5 h-5" />
                  <span>Save Mood Entry</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
