import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBrain, 
  FaHeartbeat, 
  FaArrowUp, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaLightbulb,
  FaChartLine,
  FaCalendarCheck
} from 'react-icons/fa';
import { useTheme } from '../../lib/theme';
import { symptomsHelpers, healthGoalsHelpers, moodHelpers } from '../../lib/supabase-helpers';
import { useAuth } from '../../lib/auth';

interface HealthInsight {
  id: string;
  type: 'tip' | 'warning' | 'achievement' | 'trend';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

const insights: HealthInsight[] = [
  {
    id: '1',
    type: 'achievement',
    title: 'Hydration Goal Achieved!',
    description: 'You\'ve met your daily water intake goal for 5 consecutive days. Keep it up!',
    icon: FaCheckCircle,
    color: 'from-green-500 to-green-600',
    priority: 'medium'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Sleep Pattern Alert',
    description: 'Your sleep duration has decreased by 20% this week. Consider earlier bedtime.',
    icon: FaExclamationTriangle,
    color: 'from-orange-500 to-red-500',
    priority: 'high'
  },
  {
    id: '3',
    type: 'tip',
    title: 'Exercise Recommendation',
    description: 'Based on your activity levels, try adding 10 minutes of cardio to boost energy.',
    icon: FaLightbulb,
    color: 'from-blue-500 to-purple-500',
    priority: 'medium'
  },
  {
    id: '4',
    type: 'trend',
    title: 'Positive Mood Trend',
    description: 'Your mood scores have improved by 15% this month. Great progress!',
    icon: FaArrowUp,
    color: 'from-pink-500 to-rose-500',
    priority: 'low'
  }
];

const healthMetrics = [
  {
    label: 'Overall Health Score',
    value: 85,
    change: '+5%',
    color: 'text-green-500',
    icon: FaHeartbeat
  },
  {
    label: 'Weekly Activity',
    value: 92,
    change: '+12%',
    color: 'text-blue-500',
    icon: FaChartLine
  },
  {
    label: 'Consistency Score',
    value: 78,
    change: '+3%',
    color: 'text-purple-500',
    icon: FaCalendarCheck
  }
];

export default function HealthInsights() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [selectedInsight, setSelectedInsight] = useState<HealthInsight | null>(null);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [healthMetrics, setHealthMetrics] = useState([
    {
      label: 'Overall Health Score',
      value: 0,
      change: '0%',
      color: 'text-green-500 dark:text-green-400',
      icon: FaHeartbeat
    },
    {
      label: 'Weekly Activity',
      value: 0,
      change: '0%',
      color: 'text-blue-500 dark:text-blue-400',
      icon: FaChartLine
    },
    {
      label: 'Consistency Score',
      value: 0,
      change: '0%',
      color: 'text-purple-500 dark:text-purple-400',
      icon: FaCalendarCheck
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        await generateInsights(user.id);
      }
      setLoading(false);
    };
    loadData();
  }, [isAuthenticated, user]);

  const generateInsights = async (userId: string) => {
    try {
      // Fetch data from all sources
      const [symptomsData, goalsData, moodData] = await Promise.all([
        symptomsHelpers.getSymptomsAnalytics(userId, 30),
        healthGoalsHelpers.getGoalStats(userId, 30),
        moodHelpers.getMoodEntries(userId, 30)
      ]);

      // Generate dynamic insights based on real data
      const generatedInsights: HealthInsight[] = [];

      // Goals achievement insight
      if (goalsData.totalGoals > 0) {
        const completionRate = (goalsData.achievedGoals / goalsData.totalGoals) * 100;
        if (completionRate >= 80) {
          generatedInsights.push({
            id: 'goals-achievement',
            type: 'achievement',
            title: 'Excellent Goal Progress!',
            description: `You've achieved ${goalsData.achievedGoals} out of ${goalsData.totalGoals} goals this month. Keep up the great work!`,
            icon: FaCheckCircle,
            color: 'from-green-500 to-green-600',
            priority: 'medium'
          });
        } else if (completionRate < 50) {
          generatedInsights.push({
            id: 'goals-warning',
            type: 'warning',
            title: 'Goal Progress Needs Attention',
            description: `Only ${Math.round(completionRate)}% of your goals are completed. Consider reviewing and adjusting your targets.`,
            icon: FaExclamationTriangle,
            color: 'from-orange-500 to-red-500',
            priority: 'high'
          });
        }
      }

      // Mood trend insight
      if (moodData.total > 0) {
        const avgMood = typeof moodData.average === 'string' ? parseFloat(moodData.average) : moodData.average;
        if (avgMood >= 4) {
          generatedInsights.push({
            id: 'mood-positive',
            type: 'trend',
            title: 'Positive Mood Trend',
            description: `Your average mood score is ${avgMood.toFixed(1)}/5. You're maintaining excellent emotional well-being!`,
            icon: FaArrowUp,
            color: 'from-pink-500 to-rose-500',
            priority: 'low'
          });
        } else if (avgMood < 3) {
          generatedInsights.push({
            id: 'mood-concern',
            type: 'warning',
            title: 'Mood Pattern Alert',
            description: `Your average mood has been ${avgMood.toFixed(1)}/5. Consider speaking with someone or practicing stress management.`,
            icon: FaExclamationTriangle,
            color: 'from-orange-500 to-red-500',
            priority: 'high'
          });
        }
      }

      // Symptoms insight
      if (symptomsData.totalSymptoms > 0) {
        const avgSeverity = typeof symptomsData.avgSeverity === 'string' ? parseFloat(symptomsData.avgSeverity) : symptomsData.avgSeverity;
        if (avgSeverity > 7) {
          generatedInsights.push({
            id: 'symptoms-high',
            type: 'warning',
            title: 'High Symptom Severity Detected',
            description: `Your symptoms average ${avgSeverity.toFixed(1)}/10 severity. Consider consulting your healthcare provider.`,
            icon: FaExclamationTriangle,
            color: 'from-red-500 to-red-600',
            priority: 'high'
          });
        } else if (avgSeverity < 4) {
          generatedInsights.push({
            id: 'symptoms-low',
            type: 'achievement',
            title: 'Low Symptom Severity',
            description: `Great news! Your symptoms are averaging only ${avgSeverity.toFixed(1)}/10 severity. Keep following your current routine.`,
            icon: FaCheckCircle,
            color: 'from-green-500 to-green-600',
            priority: 'low'
          });
        }
      } else {
        generatedInsights.push({
          id: 'no-symptoms',
          type: 'achievement',
          title: 'No Symptoms Recorded',
          description: 'Excellent! You haven\'t logged any symptoms recently. Keep maintaining your healthy lifestyle.',
          icon: FaCheckCircle,
          color: 'from-green-500 to-green-600',
          priority: 'low'
        });
      }

      // Activity recommendation
      generatedInsights.push({
        id: 'activity-tip',
        type: 'tip',
        title: 'Daily Activity Recommendation',
        description: 'Based on your health data, try adding 15 minutes of light exercise to boost your energy and mood.',
        icon: FaLightbulb,
        color: 'from-blue-500 to-purple-500',
        priority: 'medium'
      });

      setInsights(generatedInsights);

      // Update health metrics
      const avgSymptomSeverity = typeof symptomsData.avgSeverity === 'string' ? parseFloat(symptomsData.avgSeverity) : symptomsData.avgSeverity;
      const avgMoodScore = typeof moodData.average === 'string' ? parseFloat(moodData.average) : moodData.average;
      
      const overallScore = Math.round(
        ((5 - (avgSymptomSeverity || 0) / 2) + 
         (avgMoodScore || 3) + 
         (goalsData.totalGoals > 0 ? (goalsData.achievedGoals / goalsData.totalGoals) * 5 : 3)) / 3 * 20
      );

      setHealthMetrics([
        {
          label: 'Overall Health Score',
          value: Math.min(overallScore, 100),
          change: overallScore > 75 ? '+5%' : overallScore > 50 ? '+2%' : '-1%',
          color: overallScore > 75 ? 'text-green-500 dark:text-green-400' : overallScore > 50 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400',
          icon: FaHeartbeat
        },
        {
          label: 'Weekly Activity',
          value: Math.min(goalsData.totalGoals * 20, 100),
          change: goalsData.achievedGoals > goalsData.totalGoals * 0.7 ? '+12%' : '+5%',
          color: 'text-blue-500 dark:text-blue-400',
          icon: FaChartLine
        },
        {
          label: 'Consistency Score',
          value: moodData.total > 20 ? 95 : Math.max(moodData.total * 4, 30),
          change: moodData.total > 15 ? '+8%' : '+3%',
          color: 'text-purple-500 dark:text-purple-400',
          icon: FaCalendarCheck
        }
      ]);

    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return '';
    }
  };

  if (!user || loading) {
    return (
      <div className="glass-card bg-white/60 dark:bg-gray-800/60 p-6 rounded-3xl shadow-xl">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <FaBrain className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Health Insights</h3>
            <p className="text-gray-600 dark:text-gray-400">AI-powered recommendations</p>
          </div>
        </div>
      </div>

      {/* Health Metrics Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {healthMetrics.map((metric, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="text-center p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl"
          >
            <metric.icon className={`text-2xl ${metric.color} mx-auto mb-2`} />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{metric.label}</div>
            <div className={`text-xs font-semibold ${metric.color}`}>{metric.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Recent Insights
        </h4>
        
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <FaBrain className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Keep tracking your health data to receive personalized insights!
            </p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedInsight(insight)}
              className={`p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl cursor-pointer transition-all hover:shadow-md ${getPriorityBorder(insight.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${insight.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <insight.icon className="text-white text-sm" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {insight.title}
                    </h5>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.priority === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : insight.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedInsight(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${selectedInsight.color} rounded-2xl flex items-center justify-center`}>
                <selectedInsight.icon className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedInsight.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedInsight.priority === 'high' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : selectedInsight.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {selectedInsight.priority} priority
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {selectedInsight.description}
            </p>
            
            {/* Action Recommendations */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recommended Actions:
              </h4>
              {selectedInsight.type === 'warning' && selectedInsight.id.includes('mood') && (
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Practice daily meditation or mindfulness</li>
                  <li>• Maintain regular sleep schedule</li>
                  <li>• Consider talking to a counselor</li>
                  <li>• Engage in physical activity</li>
                </ul>
              )}
              {selectedInsight.type === 'warning' && selectedInsight.id.includes('symptoms') && (
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Schedule appointment with healthcare provider</li>
                  <li>• Keep detailed symptom diary</li>
                  <li>• Review current medications</li>
                  <li>• Monitor triggers and patterns</li>
                </ul>
              )}
              {selectedInsight.type === 'warning' && selectedInsight.id.includes('goals') && (
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Review and adjust goal difficulty</li>
                  <li>• Break large goals into smaller steps</li>
                  <li>• Set daily reminders</li>
                  <li>• Track progress more frequently</li>
                </ul>
              )}
              {selectedInsight.type === 'tip' && (
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Start with 10-15 minutes daily</li>
                  <li>• Choose activities you enjoy</li>
                  <li>• Track your energy levels before/after</li>
                  <li>• Gradually increase intensity</li>
                </ul>
              )}
              {selectedInsight.type === 'achievement' && (
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Continue your excellent habits</li>
                  <li>• Share your success with others</li>
                  <li>• Consider setting new challenges</li>
                  <li>• Reward yourself for consistency</li>
                </ul>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedInsight(null)}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg"
            >
              Got it!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
