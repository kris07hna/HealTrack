import { motion } from 'framer-motion';
import { FaChartBar, FaChartLine, FaArrowUp, FaLightbulb } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { DashboardData } from '@/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartsSectionProps {
  data: DashboardData;
}

export default function ChartsSection({ data }: ChartsSectionProps) {
  // Prepare pain levels chart data with modern styling
  const painChartData = {
    labels: data.painLevels.slice(-14).map(p => {
      const date = new Date(p.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Pain Level',
        data: data.painLevels.slice(-14).map(p => p.level),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const painChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6B7280',
        },
        title: {
          display: true,
          text: 'Severity (1-10)',
          color: '#6B7280',
          font: {
            weight: 600,
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6B7280',
        },
        title: {
          display: true,
          text: 'Date',
          color: '#6B7280',
          font: {
            weight: 600,
          },
        },
      },
    },
  };

  // Prepare symptom frequency chart data with modern colors
  const symptomFrequencyEntries = Object.entries(data.symptomFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const frequencyChartData = {
    labels: symptomFrequencyEntries.map(([symptom]) => symptom),
    datasets: [
      {
        label: 'Frequency',
        data: symptomFrequencyEntries.map(([, count]) => count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const frequencyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6B7280',
        },
        title: {
          display: true,
          text: 'Number of Occurrences',
          color: '#6B7280',
          font: {
            weight: 600,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="space-y-6"
    >
      {/* Pain Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="group"
      >
        <div className="card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="text-white text-lg" />
              </div>
              Pain Level Trend
            </h3>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Last 14 days
            </div>
          </div>
          {data.painLevels.length > 0 ? (
            <div className="h-80 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
              <Line data={painChartData} options={painChartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="font-medium text-gray-700">No pain data to display</p>
                <p className="text-sm text-gray-500 mt-1">Log symptoms to see trends here</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Symptom Frequency Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="group"
      >
        <div className="card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <FaChartBar className="text-white text-lg" />
              </div>
              Most Common Symptoms
            </h3>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Top 5
            </div>
          </div>
          {symptomFrequencyEntries.length > 0 ? (
            <div className="h-80 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
              <Bar data={frequencyChartData} options={frequencyChartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="font-medium text-gray-700">No symptom data to display</p>
                <p className="text-sm text-gray-500 mt-1">Log symptoms to see frequency analysis</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="group"
      >
        <div className="card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <FaLightbulb className="text-white text-lg" />
              </div>
              Quick Insights
            </h3>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              AI Powered
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentSymptoms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Most recent symptom</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">
                      {data.recentSymptoms[0].symptom}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FaArrowUp className="text-white text-sm" />
                  </div>
                </div>
              </motion.div>
            )}
            
            {symptomFrequencyEntries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Most common symptom</p>
                    <p className="text-lg font-bold text-green-900 mt-1">
                      {symptomFrequencyEntries[0][0]}
                    </p>
                    <p className="text-xs text-green-600">
                      {symptomFrequencyEntries[0][1]} occurrences
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <FaChartBar className="text-white text-sm" />
                  </div>
                </div>
              </motion.div>
            )}
            
            {data.painLevels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100 hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Average pain level</p>
                    <p className="text-lg font-bold text-yellow-900 mt-1">
                      {Math.round(data.painLevels.reduce((sum, p) => sum + p.level, 0) / data.painLevels.length * 10) / 10}/10
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-white text-sm" />
                  </div>
                </div>
              </motion.div>
            )}

            {data.upcomingMedications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Active medications</p>
                    <p className="text-lg font-bold text-purple-900 mt-1">
                      {data.upcomingMedications.length} medication{data.upcomingMedications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FaArrowUp className="text-white text-sm" />
                  </div>
                </div>
              </motion.div>
            )}

            {data.recentSymptoms.length === 0 && data.upcomingMedications.length === 0 && (
              <div className="col-span-2 text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
                <div className="text-4xl mb-3">💡</div>
                <p className="font-medium text-gray-700">No insights available yet</p>
                <p className="text-sm text-gray-500 mt-1">Start logging symptoms and medications to see insights here</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
