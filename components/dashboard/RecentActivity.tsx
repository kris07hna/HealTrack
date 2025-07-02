import { motion } from 'framer-motion';
import { FaClock, FaPills, FaExclamationCircle, FaChartLine } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import type { DashboardData } from '@/types';

interface RecentActivityProps {
  data: DashboardData;
}

export default function RecentActivity({ data }: RecentActivityProps) {
  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200';
    if (severity <= 6) return 'text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
    return 'text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border-red-200';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  const getSeverityIcon = (severity: number) => {
    if (severity <= 3) return '🟢';
    if (severity <= 6) return '🟡';
    return '🔴';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="group"
    >
      <div className="card-hover h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
              <FaClock className="text-white text-lg" />
            </div>
            Recent Activity
          </h3>
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Live updates
          </div>
        </div>

        <div className="space-y-6">
          {/* Recent Symptoms */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <FaExclamationCircle className="mr-2 text-gray-400" />
              Recent Symptoms
              <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {data.recentSymptoms.length}
              </span>
            </h4>
            {data.recentSymptoms.length > 0 ? (
              <div className="space-y-3">
                {data.recentSymptoms.slice(0, 5).map((symptom, index) => (
                  <motion.div
                    key={symptom.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="group/item"
                  >
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-medium hover:scale-[1.02] transition-all duration-300">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-lg">{getSeverityIcon(symptom.severity)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{symptom.symptom}</p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(symptom.timestamp), { addSuffix: true })}
                          </p>
                          {symptom.bodyPart && (
                            <p className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                              {symptom.bodyPart}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(symptom.severity)}`}>
                          {getSeverityLabel(symptom.severity)} {symptom.severity}/10
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {data.recentSymptoms.length > 5 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full cursor-pointer transition-colors">
                      +{data.recentSymptoms.length - 5} more symptoms
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-medium text-gray-700">No recent symptoms logged</p>
                <p className="text-sm text-gray-500 mt-1">Start tracking your symptoms to see them here</p>
              </div>
            )}
          </div>

          {/* Active Medications */}
          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <FaPills className="mr-2 text-gray-400" />
              Active Medications
              <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {data.upcomingMedications.length}
              </span>
            </h4>
            {data.upcomingMedications.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingMedications.slice(0, 3).map((medication, index) => (
                  <motion.div
                    key={medication.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-medium hover:scale-[1.02] transition-all duration-300">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <FaPills className="text-white text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{medication.name}</p>
                          <p className="text-sm text-blue-700">{medication.dosage}</p>
                          <p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block mt-1">
                            {medication.frequency}
                          </p>
                        </div>
                      </div>
                      {medication.reminders && medication.reminderTimes.length > 0 && (
                        <div className="ml-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            Next: {medication.reminderTimes[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {data.upcomingMedications.length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full cursor-pointer transition-colors">
                      +{data.upcomingMedications.length - 3} more medications
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="text-4xl mb-3">💊</div>
                <p className="font-medium text-gray-700">No active medications</p>
                <p className="text-sm text-gray-500 mt-1">Add medications to track them here</p>
              </div>
            )}
          </div>

          {/* Health Trends */}
          {data.healthTrends.length > 0 && (
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-gray-400" />
                Recent Health Metrics
                <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {data.healthTrends.length}
                </span>
              </h4>
              <div className="space-y-3">
                {data.healthTrends.slice(0, 3).map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100 hover:shadow-medium transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                          <FaChartLine className="text-white text-xs" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {metric.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                        {metric.value} {metric.unit}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
