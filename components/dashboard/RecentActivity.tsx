import { motion } from 'framer-motion';
import { FaClock, FaPills, FaExclamationCircle } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import type { DashboardData } from '@/types';

interface RecentActivityProps {
  data: DashboardData;
}

export default function RecentActivity({ data }: RecentActivityProps) {
  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600 bg-green-50';
    if (severity <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="card"
    >
      <div className="card-header">
        <h3 className="card-title flex items-center">
          <FaClock className="mr-2 text-blue-600" />
          Recent Activity
        </h3>
      </div>

      <div className="space-y-4">
        {/* Recent Symptoms */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <FaExclamationCircle className="mr-2 text-gray-400" />
            Recent Symptoms
          </h4>
          {data.recentSymptoms.length > 0 ? (
            <div className="space-y-3">
              {data.recentSymptoms.slice(0, 5).map((symptom) => (
                <div key={symptom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{symptom.symptom}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(symptom.timestamp), { addSuffix: true })}
                    </p>
                    {symptom.bodyPart && (
                      <p className="text-xs text-gray-400 capitalize">{symptom.bodyPart}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                      {getSeverityLabel(symptom.severity)} ({symptom.severity}/10)
                    </span>
                  </div>
                </div>
              ))}
              {data.recentSymptoms.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{data.recentSymptoms.length - 5} more symptoms
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FaExclamationCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p>No recent symptoms logged</p>
              <p className="text-sm">Start tracking your symptoms to see them here</p>
            </div>
          )}
        </div>

        {/* Active Medications */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <FaPills className="mr-2 text-gray-400" />
            Active Medications
          </h4>
          {data.upcomingMedications.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingMedications.slice(0, 3).map((medication) => (
                <div key={medication.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{medication.name}</p>
                    <p className="text-sm text-gray-600">{medication.dosage}</p>
                    <p className="text-xs text-gray-500">{medication.frequency}</p>
                  </div>
                  {medication.reminders && medication.reminderTimes.length > 0 && (
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        Next: {medication.reminderTimes[0]}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {data.upcomingMedications.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{data.upcomingMedications.length - 3} more medications
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FaPills className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p>No active medications</p>
              <p className="text-sm">Add medications to track them here</p>
            </div>
          )}
        </div>

        {/* Health Trends */}
        {data.healthTrends.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Health Metrics</h4>
            <div className="space-y-2">
              {data.healthTrends.slice(0, 3).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600 capitalize">{metric.type.replace('_', ' ')}</span>
                  <span className="text-sm font-medium">
                    {metric.value} {metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
