import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBullseye, 
  FaPlus, 
  FaCheck, 
  FaFire, 
  FaTrophy,
  FaWater,
  FaRunning,
  FaBed
} from 'react-icons/fa';
import { useTheme } from '../../lib/theme';
import { healthGoalsHelpers } from '../../lib/supabase-helpers';
import { supabase } from '../../lib/database';

interface Goal {
  id: string;
  goal_type: string;
  goal_description: string | null;
  target_value: number;
  current_value: number;
  unit: string | null;
  date: string;
  achieved: boolean;
  streak: number;
  icon: React.ComponentType<any>;
  color: string;
}

const goalIcons: Record<string, { icon: React.ComponentType<any>, color: string }> = {
  water: { icon: FaWater, color: 'from-blue-500 to-cyan-500' },
  steps: { icon: FaRunning, color: 'from-green-500 to-emerald-500' },
  sleep: { icon: FaBed, color: 'from-purple-500 to-violet-500' },
  exercise: { icon: FaRunning, color: 'from-orange-500 to-red-500' },
  meditation: { icon: FaBed, color: 'from-indigo-500 to-purple-500' },
  custom: { icon: FaBullseye, color: 'from-gray-500 to-gray-600' }
};

export default function GoalTracker() {
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'water',
    goal_description: '',
    target_value: 8,
    unit: 'glasses'
  });

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchTodaysGoals(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchTodaysGoals = async (userId: string) => {
    try {
      setLoading(true);
      const data = await healthGoalsHelpers.getTodaysGoals(userId);
      
      const formattedGoals = data.map(goal => ({
        ...goal,
        icon: goalIcons[goal.goal_type]?.icon || FaBullseye,
        color: goalIcons[goal.goal_type]?.color || 'from-gray-500 to-gray-600'
      }));
      
      setGoals(formattedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (goalId: string, increment: number) => {
    if (!user) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = Math.max(0, Math.min(goal.current_value + increment, goal.target_value));
      const isAchieved = newValue >= goal.target_value;

      await healthGoalsHelpers.updateGoalProgress(goalId, newValue, isAchieved);
      
      // Update local state
      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { 
              ...g, 
              current_value: newValue,
              achieved: isAchieved,
              streak: isAchieved && !g.achieved ? g.streak + 1 : g.streak
            }
          : g
      ));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const addNewGoal = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await healthGoalsHelpers.upsertGoal({
        user_id: user.id,
        goal_type: newGoal.goal_type,
        goal_description: newGoal.goal_description || null,
        target_value: newGoal.target_value,
        current_value: 0,
        unit: newGoal.unit || null,
        date: new Date().toISOString().split('T')[0],
        achieved: false,
        streak: 0
      });

      // Reset form and refresh goals
      setNewGoal({
        goal_type: 'water',
        goal_description: '',
        target_value: 8,
        unit: 'glasses'
      });
      setShowAddForm(false);
      await fetchTodaysGoals(user.id);
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Please sign in to track your goals
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-6 rounded-3xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
            <FaBullseye className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Goals</h3>
            <p className="text-gray-600 dark:text-gray-400">Track your health objectives</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <FaPlus className="text-sm" />
        </motion.button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Add New Goal</h4>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newGoal.goal_type}
              onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="water">Water Intake</option>
              <option value="steps">Daily Steps</option>
              <option value="sleep">Sleep Hours</option>
              <option value="exercise">Exercise Minutes</option>
              <option value="meditation">Meditation Minutes</option>
              <option value="custom">Custom Goal</option>
            </select>
            <input
              type="number"
              value={newGoal.target_value}
              onChange={(e) => setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) })}
              placeholder="Target value"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              value={newGoal.goal_description}
              onChange={(e) => setNewGoal({ ...newGoal, goal_description: e.target.value })}
              placeholder="Description (optional)"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              placeholder="Unit (e.g., glasses, steps)"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={addNewGoal}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Goal'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No goals for today. Add your first goal!
          </div>
        ) : (
          goals.map((goal, index) => {
            const progress = (goal.current_value / goal.target_value) * 100;
            const isCompleted = goal.achieved;
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm p-4 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${goal.color} rounded-xl flex items-center justify-center`}>
                      <goal.icon className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{goal.goal_type.replace('_', ' ')}</h4>
                      {goal.goal_description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">{goal.goal_description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {goal.streak > 0 && (
                      <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                        <FaFire className="text-orange-500 text-xs" />
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {goal.streak}
                        </span>
                      </div>
                    )}
                    
                    {isCompleted && (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${goal.color} rounded-full relative`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </motion.div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateGoalProgress(goal.id, -1)}
                      disabled={goal.current_value <= 0}
                      className="w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                    >
                      -
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateGoalProgress(goal.id, 1)}
                      disabled={isCompleted}
                      className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                    >
                      +
                    </motion.button>
                  </div>
                  
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center space-x-1 text-green-600 dark:text-green-400"
                    >
                      <FaTrophy className="text-sm" />
                      <span className="text-xs font-semibold">Goal Achieved!</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
