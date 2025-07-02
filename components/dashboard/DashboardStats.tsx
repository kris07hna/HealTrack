import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaPills, FaChartLine, FaCalendarAlt, FaArrowUp, FaArrowDown, FaSmile } from 'react-icons/fa';
import { useTheme } from '../../lib/theme';
import { symptomsHelpers, healthGoalsHelpers, moodHelpers } from '../../lib/supabase-helpers';
import { useAuth } from '../../lib/auth';

interface DashboardStatsData {
  totalSymptoms: number;
  avgSeverity: number;
  achievedGoals: number;
  totalGoals: number;
  avgMood: number;
  moodEntries: number;
}

export default function DashboardStats() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsData>({
    totalSymptoms: 0,
    avgSeverity: 0,
    achievedGoals: 0,
    totalGoals: 0,
    avgMood: 0,
    moodEntries: 0
  });

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        await fetchDashboardStats(user.id);
      }
      setLoading(false);
    };
    loadData();
  }, [isAuthenticated, user]);

  const fetchDashboardStats = async (userId: string) => {
    try {
      const [symptomsData, goalsData, moodData] = await Promise.all([
        symptomsHelpers.getSymptomsAnalytics(userId, 30),
        healthGoalsHelpers.getGoalStats(userId, 30),
        moodHelpers.getMoodEntries(userId, 30)
      ]);

      setStats({
        totalSymptoms: symptomsData.totalSymptoms,
        avgSeverity: typeof symptomsData.avgSeverity === 'string' ? parseFloat(symptomsData.avgSeverity) : symptomsData.avgSeverity,
        achievedGoals: goalsData.achievedGoals,
        totalGoals: goalsData.totalGoals,
        avgMood: typeof moodData.average === 'string' ? parseFloat(moodData.average) : moodData.average,
        moodEntries: moodData.total
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  if (!user || loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl h-48"></div>
        ))}
      </div>
    );
  }

  const dashboardStats = [
    {
      name: 'Recent Symptoms',
      value: stats.totalSymptoms,
      subtitle: 'Last 30 days',
      icon: FaHeartbeat,
      gradient: 'from-red-500 via-pink-500 to-rose-500',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      change: stats.totalSymptoms === 0 ? 'No symptoms' : `${stats.totalSymptoms} logged`,
      changeType: stats.totalSymptoms === 0 ? 'positive' : 'neutral',
      trend: stats.totalSymptoms > 10 ? 'up' : stats.totalSymptoms > 0 ? 'stable' : 'down',
    },
    {
      name: 'Average Severity',
      value: stats.avgSeverity || 0,
      subtitle: 'Scale 1-10',
      icon: FaChartLine,
      gradient: stats.avgSeverity <= 3 
        ? 'from-green-500 via-emerald-500 to-teal-500' 
        : stats.avgSeverity <= 6 
        ? 'from-yellow-500 via-orange-500 to-amber-500' 
        : 'from-red-500 via-rose-500 to-pink-500',
      glowColor: stats.avgSeverity <= 3 
        ? 'rgba(16, 185, 129, 0.4)' 
        : stats.avgSeverity <= 6 
        ? 'rgba(245, 158, 11, 0.4)' 
        : 'rgba(239, 68, 68, 0.4)',
      change: stats.avgSeverity <= 3 ? 'Low severity' : stats.avgSeverity <= 6 ? 'Moderate' : 'High severity',
      changeType: stats.avgSeverity <= 3 ? 'positive' : stats.avgSeverity <= 6 ? 'neutral' : 'negative',
      trend: stats.avgSeverity <= 3 ? 'down' : stats.avgSeverity <= 6 ? 'stable' : 'up',
    },
    {
      name: 'Goals Achieved',
      value: `${stats.achievedGoals}/${stats.totalGoals}`,
      subtitle: 'This month',
      icon: FaCalendarAlt,
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      glowColor: 'rgba(139, 92, 246, 0.4)',
      change: stats.totalGoals === 0 ? 'No goals set' : `${Math.round((stats.achievedGoals / stats.totalGoals) * 100)}% complete`,
      changeType: stats.totalGoals === 0 ? 'neutral' : stats.achievedGoals / stats.totalGoals > 0.7 ? 'positive' : 'neutral',
      trend: stats.achievedGoals / stats.totalGoals > 0.7 ? 'up' : 'stable',
    },
    {
      name: 'Average Mood',
      value: stats.avgMood || 0,
      subtitle: `${stats.moodEntries} entries`,
      icon: FaSmile,
      gradient: stats.avgMood >= 4 
        ? 'from-green-500 via-emerald-500 to-teal-500'
        : stats.avgMood >= 3
        ? 'from-yellow-500 via-orange-500 to-amber-500'
        : 'from-blue-500 via-cyan-500 to-teal-500',
      glowColor: stats.avgMood >= 4 
        ? 'rgba(16, 185, 129, 0.4)'
        : stats.avgMood >= 3
        ? 'rgba(245, 158, 11, 0.4)'
        : 'rgba(59, 130, 246, 0.4)',
      change: stats.avgMood >= 4 ? 'Great mood!' : stats.avgMood >= 3 ? 'Good mood' : 'Could be better',
      changeType: stats.avgMood >= 4 ? 'positive' : stats.avgMood >= 3 ? 'neutral' : 'negative',
      trend: stats.avgMood >= 4 ? 'up' : stats.avgMood >= 3 ? 'stable' : 'down',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
      {dashboardStats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: index * 0.15, 
            duration: 0.7,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            y: -8,
            transition: { duration: 0.3 }
          }}
          className="group relative"
        >
          {/* Glass morphism card with proper theming */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-6 sm:p-8 h-full min-h-[250px] sm:min-h-[280px] flex flex-col justify-between relative overflow-hidden rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20">
            {/* Animated background gradient */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}
              style={{
                background: `radial-gradient(circle at 30% 30%, ${stat.glowColor} 0%, transparent 70%)`
              }}
            />
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 dark:bg-gray-300/20 rounded-full"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 1.5,
                  }}
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${80 - i * 20}%`,
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header with enhanced design */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <motion.div 
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${stat.gradient} rounded-3xl flex items-center justify-center shadow-2xl relative`}
                  style={{
                    boxShadow: `0 20px 40px -10px ${stat.glowColor}, 0 8px 16px rgba(0, 0, 0, 0.1)`
                  }}
                >
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${stat.glowColor} 0%, transparent 70%)`,
                      filter: 'blur(20px)',
                      transform: 'scale(1.5)',
                    }}
                  />
                </motion.div>
                
                <div className="flex items-center space-x-2">
                  {stat.trend === 'up' && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center text-red-500 dark:text-red-400"
                    >
                      <FaArrowUp className="text-xs sm:text-sm" />
                    </motion.div>
                  )}
                  {stat.trend === 'down' && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center text-green-500 dark:text-green-400"
                    >
                      <FaArrowDown className="text-xs sm:text-sm" />
                    </motion.div>
                  )}
                  <div className={`text-xs font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-full backdrop-blur-md ${
                    stat.changeType === 'positive' 
                      ? 'text-green-700 dark:text-green-300 bg-green-100/60 dark:bg-green-900/30' 
                      : stat.changeType === 'negative'
                      ? 'text-red-700 dark:text-red-300 bg-red-100/60 dark:bg-red-900/30'
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100/60 dark:bg-gray-700/30'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>

              {/* Stats with enhanced typography */}
              <div className="space-y-2 sm:space-y-3 flex-grow">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-baseline space-x-2 sm:space-x-3"
                >
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {stat.subtitle}
                  </span>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors"
                >
                  {stat.name}
                </motion.p>
              </div>

              {/* Enhanced progress indicator with glow */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.6, duration: 0.8 }}
                className="mt-4 sm:mt-6 h-2 bg-gray-100/60 dark:bg-gray-700/60 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: stat.name === 'Average Severity' 
                    ? `${(stats.avgSeverity / 10) * 100}%`
                    : stat.name === 'Average Mood'
                    ? `${(stats.avgMood / 5) * 100}%`
                    : stat.name === 'Goals Achieved'
                    ? `${stats.totalGoals > 0 ? (stats.achievedGoals / stats.totalGoals) * 100 : 0}%`
                    : `${Math.min((stats.totalSymptoms / 20) * 100, 100)}%`
                  }}
                  transition={{ delay: index * 0.1 + 0.8, duration: 1.2, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${stat.gradient} relative rounded-full`}
                  style={{
                    boxShadow: `0 0 20px ${stat.glowColor}`
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-full" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
