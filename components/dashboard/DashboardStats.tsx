import { motion } from 'framer-motion';
import { FaHeartbeat, FaPills, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import type { DashboardData } from '@/types';

interface DashboardStatsProps {
  data: DashboardData;
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const totalSymptoms = data.recentSymptoms.length;
  const activeMedications = data.upcomingMedications.length;
  const avgSeverity = data.recentSymptoms.length > 0
    ? Math.round(data.recentSymptoms.reduce((sum, s) => sum + s.severity, 0) / data.recentSymptoms.length * 10) / 10
    : 0;
  const daysTracked = Math.max(7, data.painLevels.length);

  const stats = [
    {
      name: 'Recent Symptoms',
      value: totalSymptoms,
      subtitle: 'Last 7 days',
      icon: FaHeartbeat,
      color: 'bg-blue-500',
      change: totalSymptoms > 0 ? 'Active tracking' : 'No recent symptoms',
      changeType: totalSymptoms > 0 ? 'neutral' : 'positive',
    },
    {
      name: 'Active Medications',
      value: activeMedications,
      subtitle: 'Currently taking',
      icon: FaPills,
      color: 'bg-green-500',
      change: activeMedications > 0 ? 'Medications managed' : 'No medications',
      changeType: 'neutral',
    },
    {
      name: 'Average Severity',
      value: avgSeverity,
      subtitle: 'Scale 1-10',
      icon: FaChartLine,
      color: avgSeverity <= 3 ? 'bg-green-500' : avgSeverity <= 6 ? 'bg-yellow-500' : 'bg-red-500',
      change: avgSeverity <= 3 ? 'Low severity' : avgSeverity <= 6 ? 'Moderate severity' : 'High severity',
      changeType: avgSeverity <= 3 ? 'positive' : avgSeverity <= 6 ? 'neutral' : 'negative',
    },
    {
      name: 'Days Tracked',
      value: daysTracked,
      subtitle: 'Total days',
      icon: FaCalendarAlt,
      color: 'bg-purple-500',
      change: 'Keep it up!',
      changeType: 'positive',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-md ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="ml-2 text-sm text-gray-500">
                    {stat.subtitle}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-sm ${
              stat.changeType === 'positive' 
                ? 'text-green-600' 
                : stat.changeType === 'negative' 
                ? 'text-red-600' 
                : 'text-gray-600'
            }`}>
              {stat.change}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
