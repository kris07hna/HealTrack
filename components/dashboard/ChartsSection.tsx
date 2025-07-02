import { motion } from 'framer-motion';
import { FaChartBar, FaChartLine } from 'react-icons/fa';
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
  // Prepare pain levels chart data
  const painChartData = {
    labels: data.painLevels.slice(-14).map(p => {
      const date = new Date(p.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Pain Level',
        data: data.painLevels.slice(-14).map(p => p.level),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const painChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Severity (1-10)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  // Prepare symptom frequency chart data
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
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const frequencyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Occurrences',
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-6"
    >
      {/* Pain Trend Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <FaChartLine className="mr-2 text-blue-600" />
            Pain Level Trend
          </h3>
        </div>
        {data.painLevels.length > 0 ? (
          <div className="h-64">
            <Line data={painChartData} options={painChartOptions} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaChartLine className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No pain data to display</p>
              <p className="text-sm">Log symptoms to see trends here</p>
            </div>
          </div>
        )}
      </div>

      {/* Symptom Frequency Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <FaChartBar className="mr-2 text-green-600" />
            Most Common Symptoms
          </h3>
        </div>
        {symptomFrequencyEntries.length > 0 ? (
          <div className="h-64">
            <Bar data={frequencyChartData} options={frequencyChartOptions} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaChartBar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No symptom data to display</p>
              <p className="text-sm">Log symptoms to see frequency analysis</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Insights</h3>
        </div>
        <div className="space-y-3">
          {data.recentSymptoms.length > 0 && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Most recent symptom:</span>
              <span className="font-medium text-blue-900">
                {data.recentSymptoms[0].symptom}
              </span>
            </div>
          )}
          
          {symptomFrequencyEntries.length > 0 && (
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Most common symptom:</span>
              <span className="font-medium text-green-900">
                {symptomFrequencyEntries[0][0]} ({symptomFrequencyEntries[0][1]}x)
              </span>
            </div>
          )}
          
          {data.painLevels.length > 0 && (
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-600">Average pain level:</span>
              <span className="font-medium text-yellow-900">
                {Math.round(data.painLevels.reduce((sum, p) => sum + p.level, 0) / data.painLevels.length * 10) / 10}/10
              </span>
            </div>
          )}

          {data.upcomingMedications.length > 0 && (
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">Active medications:</span>
              <span className="font-medium text-purple-900">
                {data.upcomingMedications.length} medication{data.upcomingMedications.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {data.recentSymptoms.length === 0 && data.upcomingMedications.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p>Start logging symptoms and medications to see insights here</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
