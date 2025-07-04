import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaDownload, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCode, 
  FaFileCsv,
  FaUser,
  FaHeartbeat,
  FaPills,
  FaRunning,
  FaSmile,
  FaBrain,
  FaBullseye,
  FaLightbulb,
  FaCalendarAlt,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import { createHealthDataExporter, ExportOptions } from '@/lib/export-utils';
import { useNotifications } from '@/lib/notifications';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  userName 
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'pdf' | 'excel'>('pdf');
  const [selectedData, setSelectedData] = useState({
    includeProfile: true,
    includeSymptoms: true,
    includeMedications: true,
    includeExercises: true,
    includeMoodEntries: true,
    includeHealthGoals: true,
  });
  const [dateRange, setDateRange] = useState({
    enabled: false,
    start: '',
    end: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const { addNotification } = useNotifications();

  const formatOptions = [
    {
      value: 'pdf',
      label: 'PDF Report',
      icon: FaFilePdf,
      description: 'Professional health report with formatted layout',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      value: 'json',
      label: 'JSON Data',
      icon: FaFileCode,
      description: 'Complete data in JSON format for developers',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      value: 'csv',
      label: 'CSV Spreadsheet',
      icon: FaFileCsv,
      description: 'Spreadsheet format for data analysis',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      value: 'excel',
      label: 'Excel File',
      icon: FaFileExcel,
      description: 'Excel-compatible format with multiple sheets',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    }
  ];

  const dataOptions = [
    {
      key: 'includeProfile',
      label: 'Personal Profile',
      icon: FaUser,
      description: 'Basic information, medical history, emergency contacts',
      color: 'text-purple-500'
    },
    {
      key: 'includeSymptoms',
      label: 'Symptoms History',
      icon: FaHeartbeat,
      description: 'All logged symptoms with severity and details',
      color: 'text-red-500'
    },
    {
      key: 'includeMedications',
      label: 'Medications',
      icon: FaPills,
      description: 'Current and past medications with dosages',
      color: 'text-blue-500'
    },
    {
      key: 'includeExercises',
      label: 'Exercise Activities',
      icon: FaRunning,
      description: 'Workout history with calories and intensity',
      color: 'text-green-500'
    },
    {
      key: 'includeMoodEntries',
      label: 'Mood Tracking',
      icon: FaSmile,
      description: 'Mood entries and emotional wellness data',
      color: 'text-yellow-500'
    },
    {
      key: 'includeHealthGoals',
      label: 'Health Goals',
      icon: FaBullseye,
      description: 'Set goals and progress tracking',
      color: 'text-orange-500'
    }
  ];

  const handleDataToggle = (key: string) => {
    setSelectedData(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    
    try {
      const exporter = createHealthDataExporter(userId);
      
      const options: ExportOptions = {
        format: selectedFormat,
        ...selectedData,
        ...(dateRange.enabled && dateRange.start && dateRange.end ? {
          dateRange: {
            start: new Date(dateRange.start),
            end: new Date(dateRange.end)
          }
        } : {})
      };

      switch (selectedFormat) {
        case 'pdf':
          await exporter.exportAsPDF(options);
          break;
        case 'json':
          await exporter.exportAsJSON(options);
          break;
        case 'csv':
          await exporter.exportAsCSV(options);
          break;
        case 'excel':
          await exporter.exportAsExcel(options);
          break;
      }

      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: `Your health data has been exported as ${selectedFormat.toUpperCase()}`
      });

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'There was an error exporting your data. Please try again.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = Object.values(selectedData).filter(Boolean).length;
  const selectedFormatOption = formatOptions.find(f => f.value === selectedFormat);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Export Health Data
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Download your complete health information in your preferred format
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose Export Format
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formatOptions.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat === format.value;
                  
                  return (
                    <motion.div
                      key={format.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? `${format.borderColor} ${format.bgColor} shadow-lg`
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedFormat(format.value as any)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-6 h-6 ${format.color} mt-1`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {format.label}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {format.description}
                          </p>
                        </div>
                        {isSelected && (
                          <FaCheck className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Data Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Data to Include ({selectedCount} selected)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dataOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedData[option.key as keyof typeof selectedData];
                  
                  return (
                    <motion.div
                      key={option.key}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => handleDataToggle(option.key)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 ${option.color} mt-0.5`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {option.label}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <FaCheck className="w-4 h-4 text-green-500 mt-0.5" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="dateRange"
                  checked={dateRange.enabled}
                  onChange={(e) => setDateRange(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="dateRange" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filter by Date Range
                </label>
              </div>
              
              {dateRange.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Export Summary</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  {selectedFormatOption && <selectedFormatOption.icon className={selectedFormatOption.color} />}
                  <span>Format: {selectedFormatOption?.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-blue-500" />
                  <span>Data types: {selectedCount} categories selected</span>
                </div>
                {dateRange.enabled && dateRange.start && dateRange.end && (
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-green-500" />
                    <span>Date range: {dateRange.start} to {dateRange.end}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {userName && `Exporting data for ${userName}`}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  disabled={isExporting || selectedCount === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {isExporting ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <FaDownload className="w-4 h-4" />
                      <span>Export Data</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportModal;
