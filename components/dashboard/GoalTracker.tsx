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
  FaBed,
  FaHistory,
  FaChevronDown,
  FaChevronUp,
  FaCalendar
} from 'react-icons/fa';
import { useTheme } from '../../lib/theme';
import { healthGoalsHelpers } from '../../lib/supabase-helpers';
import { useNotifications } from '../../lib/notifications';
import { useAuth } from '../../lib/auth';
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
  const { addNotification } = useNotifications();
  const { user, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalHistory, setGoalHistory] = useState<Record<string, any[]>>({});
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'water',
    goal_description: '',
    target_value: 8,
    unit: 'glasses'
  });

  // Handle goal type change and set appropriate defaults
  const handleGoalTypeChange = (goalType: string) => {
    const defaults = {
      water: { target_value: 8, unit: 'glasses' },
      steps: { target_value: 10000, unit: 'steps' },
      sleep: { target_value: 8, unit: 'hours' },
      exercise: { target_value: 30, unit: 'minutes' },
      meditation: { target_value: 15, unit: 'minutes' },
      custom: { target_value: 1, unit: 'units' }
    };

    const goalDefaults = defaults[goalType as keyof typeof defaults] || defaults.custom;
    
    setNewGoal({
      ...newGoal,
      goal_type: goalType,
      target_value: goalDefaults.target_value,
      unit: goalDefaults.unit
    });
  };

  // Force reset function for stuck states
  const forceReset = () => {
    console.log('Force resetting component state');
    setLoading(false);
    setShowAddForm(false);
    setNewGoal({
      goal_type: 'water',
      goal_description: '',
      target_value: 8,
      unit: 'glasses'
    });
    setExpandedGoals(new Set());
  };

  // Get current user and set up real-time subscriptions
  useEffect(() => {
    const getCurrentUser = async () => {
      if (isAuthenticated && user) {
        await fetchTodaysGoals(user.id);
      }
    };
    getCurrentUser();

    // Set up real-time subscription for goals
    let subscription: any = null;
    
    if (user) {
      console.log('Setting up real-time subscription for user:', user.id);
      
      subscription = supabase
        .channel('health_goals_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'health_goals',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time update received:', payload);
            
            switch (payload.eventType) {
              case 'INSERT':
                console.log('New goal added:', payload.new);
                fetchTodaysGoals(user.id);
                addNotification({
                  type: 'success',
                  title: 'Goal Added',
                  message: 'A new goal has been added!'
                });
                break;
                
              case 'UPDATE':
                console.log('Goal updated:', payload.new);
                // Update local state directly for better performance
                setGoals(prevGoals => 
                  prevGoals.map(goal => 
                    goal.id === payload.new.id 
                      ? { ...goal, ...payload.new, icon: goal.icon, color: goal.color }
                      : goal
                  )
                );
                break;
                
              case 'DELETE':
                console.log('Goal deleted:', payload.old);
                setGoals(prevGoals => 
                  prevGoals.filter(goal => goal.id !== payload.old.id)
                );
                addNotification({
                  type: 'info',
                  title: 'Goal Removed',
                  message: 'A goal has been deleted.'
                });
                break;
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
    }

    return () => {
      if (subscription) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(subscription);
      }
    };
  }, [isAuthenticated, user]);

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
      addNotification({
        type: 'error',
        title: 'Failed to Load Goals',
        message: 'Could not retrieve your daily goals. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalHistory = async (userId: string, goalType: string) => {
    try {
      const history = await healthGoalsHelpers.getGoalHistory(userId, goalType, 30);
      setGoalHistory(prev => ({
        ...prev,
        [goalType]: history
      }));
    } catch (error) {
      console.error('Error fetching goal history:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Load History',
        message: 'Could not retrieve goal history. Please try again.'
      });
    }
  };

  const toggleGoalExpansion = async (goalId: string, goalType: string) => {
    const newExpanded = new Set(expandedGoals);
    
    if (expandedGoals.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
      // Fetch history if not already loaded
      if (!goalHistory[goalType] && user) {
        await fetchGoalHistory(user.id, goalType);
      }
    }
    
    setExpandedGoals(newExpanded);
  };

  const updateGoalProgress = async (goalId: string, increment: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !user) return;

    const newValue = Math.max(0, goal.current_value + increment);
    const isAchieved = newValue >= goal.target_value;

    console.log(`Attempting to update goal: ${goalId}`, {
      newValue,
      isAchieved
    });

    try {
      const result = await healthGoalsHelpers.updateGoalProgress(goalId, newValue, isAchieved);
      console.log('Supabase update result:', result);

      if (result) {
        const actionText = increment > 0 ? 'increased' : 'decreased';
        const newValueText = `${newValue} ${goal.unit || 'units'}`;
        
        addNotification({
          type: 'success',
          title: 'Progress Updated!',
          message: `${goal.goal_type} ${actionText} to ${newValueText}${isAchieved ? ' - Goal Achieved! 🏆' : ''}`
        });
      } else {
        throw new Error("Update operation returned no data.");
      }

      // Update local state
      setGoals(goals.map(g => g.id === goalId ? { ...g, current_value: newValue, achieved: isAchieved } : g));
    } catch (error) {
      console.error('Failed to update goal progress in Supabase:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Update Progress',
        message: 'There was an error syncing your progress with the server.'
      });
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      console.log('Environment check:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
      
      // Test auth first
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('Auth test:', { user: authData.user?.id, error: authError });
      
      if (authError) {
        addNotification({
          type: 'error',
          title: 'Auth Error',
          message: `Authentication failed: ${authError.message}`
        });
        return;
      }
      
      // Test database connection with the simplest possible query
      const { data, error, count } = await supabase
        .from('health_goals')
        .select('*', { count: 'exact', head: true });
      
      console.log('Database test result:', { data, error, count });
      
      if (error) {
        console.error('Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        addNotification({
          type: 'error',
          title: 'Database Error',
          message: `Database query failed: ${error.message}`
        });
      } else {
        console.log('Database connection successful!', { count });
        addNotification({
          type: 'success',
          title: 'Connection Successful',
          message: `Database connected! Found ${count || 0} total goals.`
        });
      }
    } catch (error) {
      console.error('Connection test exception:', error);
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const addNewGoal = async () => {
    if (!user) {
      console.log('No user found, cannot add goal');
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'Please make sure you are logged in.'
      });
      setLoading(false);
      return;
    }

    // Validation
    if (!newGoal.goal_type || !newGoal.target_value || newGoal.target_value <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Goal',
        message: 'Please provide a valid goal type and target value greater than 0.'
      });
      setLoading(false);
      return;
    }

    console.log('Starting to add new goal...');
    setLoading(true);

    // Add timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      console.log('Goal creation timeout reached');
      setLoading(false);
      addNotification({
        type: 'error',
        title: 'Request Timeout',
        message: 'The request took too long. Please try again.'
      });
    }, 8000); // 8 seconds timeout

    try {
      const goalData = {
        user_id: user.id,
        goal_type: newGoal.goal_type,
        goal_description: newGoal.goal_description || null,
        target_value: newGoal.target_value,
        current_value: 0,
        unit: newGoal.unit || null,
        date: new Date().toISOString().split('T')[0],
        achieved: false,
        streak: 0
      };
      
      console.log('Adding new goal with data:', goalData);

      const result = await healthGoalsHelpers.createGoal(goalData);

      console.log('Goal add result:', result);

      if (result) {
        clearTimeout(timeoutId);
        
        addNotification({
          type: 'success',
          title: 'Goal Created Successfully!',
          message: `Your ${newGoal.goal_type} goal (${newGoal.target_value} ${newGoal.unit}) has been added for today.`
        });

        // Reset form and refresh goals
        setNewGoal({
          goal_type: 'water',
          goal_description: '',
          target_value: 8,
          unit: 'glasses'
        });
        setShowAddForm(false);
        
        console.log('Refreshing goals after successful add...');
        await fetchTodaysGoals(user.id);
        console.log('Goals refreshed successfully');
      } else {
        clearTimeout(timeoutId);
        throw new Error('No data returned from goal creation');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error adding goal:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Create Goal',
        message: `Could not save your new goal: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      console.log('Setting loading to false');
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
        
        <div className="flex items-center space-x-2">        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <FaPlus className="text-sm" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={testConnection}
          className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-xs"
        >
          Test DB
        </motion.button>
          
          {/* Temporary debug button - remove in production */}
          {loading && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={forceReset}
              className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs"
              title="Reset stuck state"
            >
              Reset
            </motion.button>
          )}
        </div>
      </div>

      {/* Goals Summary */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <FaCalendar className="text-blue-500" />
            <span>Today's Goals Summary</span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {goals.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Goals</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {goals.filter(g => g.achieved).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {goals.filter(g => g.current_value > 0 && !g.achieved).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((goals.filter(g => g.achieved).length / goals.length) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </motion.div>
      )}

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
              onChange={(e) => handleGoalTypeChange(e.target.value)}
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
              onClick={() => {
                setShowAddForm(false);
                setLoading(false); // Force reset loading state
                setNewGoal({
                  goal_type: 'water',
                  goal_description: '',
                  target_value: 8,
                  unit: 'glasses'
                });
              }}
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
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleGoalExpansion(goal.id, goal.goal_type)}
                      className="w-8 h-8 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      {expandedGoals.has(goal.id) ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </motion.button>
                    
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
                    
                    {/* Quick log buttons for common increments */}
                    {goal.goal_type === 'water' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateGoalProgress(goal.id, 2)}
                        disabled={isCompleted}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50"
                      >
                        +2
                      </motion.button>
                    )}
                    
                    {(goal.goal_type === 'steps' || goal.goal_type === 'exercise') && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateGoalProgress(goal.id, 10)}
                          disabled={isCompleted}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs hover:bg-green-200 dark:hover:bg-green-900/50 transition-all disabled:opacity-50"
                        >
                          +10
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateGoalProgress(goal.id, 30)}
                          disabled={isCompleted}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs hover:bg-green-200 dark:hover:bg-green-900/50 transition-all disabled:opacity-50"
                        >
                          +30
                        </motion.button>
                      </>
                    )}
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

                {/* Goal History Section */}
                {expandedGoals.has(goal.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <FaHistory className="text-sm text-gray-500 dark:text-gray-400" />
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent History (30 days)</h5>
                    </div>
                    
                    {goalHistory[goal.goal_type] && goalHistory[goal.goal_type].length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {goalHistory[goal.goal_type].map((historyItem: any, histIndex: number) => (
                          <div
                            key={historyItem.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <FaCalendar className="text-xs text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(historyItem.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                {historyItem.current_value} / {historyItem.target_value} {historyItem.unit}
                              </span>
                              {historyItem.achieved && (
                                <FaCheck className="text-xs text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No history available for this goal type
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
