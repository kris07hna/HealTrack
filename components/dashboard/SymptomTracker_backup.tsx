import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaPlus, 
  FaUser, 
  FaCalendarDay, 
  FaExclamationTriangle, 
  FaClock,
  FaChartLine,
  FaHistory,
  FaChevronDown,
  FaChev    } finally {
      setLoading(false)
    }
  }

  const getSeverityLabel = (severity: number) => {ar,
  FaDatabase,
  FaRedo
} from 'react-icons/fa'
import { useTheme } from '../../lib/theme'
import { symptomsHelpers } from '../../lib/supabase-helpers'
import { useNotifications } from '../../lib/notifications'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/database'

interface Symptom {
  id: string
  title: string
  description: string | null
  severity: number
  body_part: string | null
  duration: string | null
  triggers: string | null
  medications_taken: string[] | null
  created_at: string
}

interface SymptomLog extends Symptom {
  id: string;
  created_at: string;
}

const severityColors = {
  1: 'text-green-500',
  2: 'text-yellow-500', 
  3: 'text-orange-500',
  4: 'text-red-500',
  5: 'text-red-700'
}

const bodyParts = [
  'Head', 'Eyes', 'Throat', 'Chest', 'Stomach', 'Back', 'Arms', 'Legs', 'Feet', 'Hands', 'Other'
]

export default function SymptomTracker() {
  const { theme } = useTheme()
  const { addNotification } = useNotifications()
  const { user, isAuthenticated } = useAuth()
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [symptomHistory, setSymptomHistory] = useState<SymptomLog[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [symptomData, setSymptomData] = useState({
    total: 0,
    averageSeverity: 0,
    entries: [] as SymptomLog[]
  })
  const [newSymptom, setNewSymptom] = useState({
    title: '',
    description: '',
    severity: 1,
    body_part: '',
    duration: '',
    triggers: '',
    medications_taken: [] as string[]
  })

  // Real-time subscription for symptom updates
  useEffect(() => {
    if (user) {
      console.log('Setting up real-time subscription for symptoms...')
      
      const channel = supabase
        .channel(`symptoms_changes_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'symptoms',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time symptom change:', payload)
            
            if (payload.eventType === 'INSERT') {
              addNotification({
                type: 'success',
                title: 'Symptom Added',
                message: 'New symptom entry synced successfully'
              })
              fetchSymptomData(user.id)
            } else if (payload.eventType === 'UPDATE') {
              addNotification({
                type: 'info',
                title: 'Symptom Updated',
                message: 'Symptom entry updated successfully'
              })
              fetchSymptomData(user.id)
            } else if (payload.eventType === 'DELETE') {
              addNotification({
                type: 'warning',
                title: 'Symptom Deleted',
                message: 'Symptom entry removed'
              })
              fetchSymptomData(user.id)
            }
          }
        )
        .subscribe()

      return () => {
        console.log('Cleaning up symptom subscription...')
        supabase.removeChannel(channel)
      }
    }
  }, [user, addNotification])

  // Get current user and symptoms
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        await fetchSymptoms(user.id);
        await fetchSymptomData(user.id);
      }
    };
    loadData()
  }, [isAuthenticated, user])

  const fetchSymptomHistory = async (userId: string) => {
    try {
      console.log('Fetching symptom history for user:', userId);
      const history = await symptomsHelpers.getSymptomHistory(userId);
      console.log('Fetched symptom history:', history);
      setSymptomHistory(history as SymptomLog[]);
    } catch (error) {
      console.error('Error fetching symptom history:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Load Symptom History',
        message: 'Could not retrieve your past symptom logs.'
      });
    }
  };

  const fetchSymptomData = async (userId: string) => {
    try {
      setLoading(true)
      console.log('🔄 Fetching symptom data for user:', userId)
      
      const history = await symptomsHelpers.getSymptomHistory(userId);
      const entries = history as SymptomLog[]
      
      // Calculate statistics
      const total = entries.length
      const averageSeverity = total > 0 ? entries.reduce((sum, entry) => sum + entry.severity, 0) / total : 0
      
      setSymptomData({
        total,
        averageSeverity: Math.round(averageSeverity * 10) / 10,
        entries: entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      })
      
      console.log('✅ Symptom data loaded successfully:', { total, averageSeverity })
      
      addNotification({
        type: 'success',
        title: 'Data Loaded',
        message: `${total} symptom entries synchronized`
      })
    } catch (error) {
      console.error('❌ Error fetching symptom data:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Load Data',
        message: 'Could not load symptom data from database'
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      setLoading(true)
      addNotification({
        type: 'info',
        title: 'Testing Connection',
        message: 'Checking database connectivity...'
      })

      if (!user) {
        throw new Error('No authenticated user')
      }

      console.log('🔍 Testing database connection...')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('symptoms')
        .select('count')
        .eq('user_id', user.id)
        .limit(1)

      if (error) {
        throw error
      }

      console.log('✅ Database connection successful')
      
      addNotification({
        type: 'success',
        title: 'Connection Successful',
        message: 'Database is connected and accessible'
      })
      
      // Refresh data
      await fetchSymptomData(user.id)
      
    } catch (error) {
      console.error('❌ Connection test failed:', error)
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: error instanceof Error ? error.message : 'Database connection failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSymptoms = async (userId: string) => {
    try {
      setLoading(true)
      const result = await symptomsHelpers.getSymptoms(userId, 1, 10)
      setSymptoms(result.symptoms)
    } catch (error) {
      console.error('Error fetching symptoms:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSymptom = async () => {
    if (!user || !newSymptom.title) return

    try {
      setLoading(true)
      
      // Set timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false)
        addNotification({
          type: 'error',
          title: 'Request Timeout',
          message: 'Symptom submission took too long. Please try again.'
        })
      }, 15000) // 15 seconds timeout
      
      console.log('🔄 Submitting symptom:', {
        user_id: user.id,
        title: newSymptom.title,
        description: newSymptom.description || null,
        severity: newSymptom.severity,
        body_part: newSymptom.body_part || null,
        duration: newSymptom.duration || null,
        triggers: newSymptom.triggers || null,
        medications_taken: newSymptom.medications_taken.length > 0 ? newSymptom.medications_taken : null
      })

      const result = await symptomsHelpers.addSymptom({
        user_id: user.id,
        title: newSymptom.title,
        description: newSymptom.description || null,
        severity: newSymptom.severity,
        body_part: newSymptom.body_part || null,
        duration: newSymptom.duration || null,
        triggers: newSymptom.triggers || null,
        medications_taken: newSymptom.medications_taken.length > 0 ? newSymptom.medications_taken : null
      })

      clearTimeout(timeoutId) // Clear timeout if successful
      console.log('✅ Symptom added successfully:', result)

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Symptom Logged Successfully! 📝',
        message: `${newSymptom.title} (severity ${newSymptom.severity}) has been logged and synced to your health records.`
      });

      // Refresh data after adding a new symptom
      await fetchSymptomData(user.id)
      
      // Reset form
      setNewSymptom({
        title: '',
        description: '',
        severity: 1,
        body_part: '',
        duration: '',
        triggers: '',
        medications_taken: []
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('❌ Error adding symptom:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Save Symptom',
        message: error instanceof Error ? error.message : 'Could not save your symptom to the database. Please check your connection and try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityLabel = (severity: number) => {
    const labels = {
      1: 'Mild',
      2: 'Light',
      3: 'Moderate', 
      4: 'Severe',
      5: 'Very Severe'
    }
    return labels[severity as keyof typeof labels] || 'Unknown'
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Please sign in to track your symptoms
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <FaExclamationTriangle className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Symptom Tracker</h3>
            <p className="text-gray-600 dark:text-gray-400">Log and monitor your symptoms</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <FaPlus className="text-sm" />
        </motion.button>
      </div>

      {/* Add Symptom Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Add New Symptom</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newSymptom.title}
                onChange={(e) => setNewSymptom({ ...newSymptom, title: e.target.value })}
                placeholder="Symptom name *"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
              <select
                value={newSymptom.body_part}
                onChange={(e) => setNewSymptom({ ...newSymptom, body_part: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select body part</option>
                {bodyParts.map(part => (
                  <option key={part} value={part}>{part}</option>
                ))}
              </select>
            </div>
            
            <textarea
              value={newSymptom.description}
              onChange={(e) => setNewSymptom({ ...newSymptom, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={2}
            />
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newSymptom.severity}
                  onChange={(e) => setNewSymptom({ ...newSymptom, severity: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center">
                  <span className={`font-semibold ${severityColors[newSymptom.severity as keyof typeof severityColors]}`}>
                    {getSeverityLabel(newSymptom.severity)}
                  </span>
                </div>
              </div>
              
              <input
                type="text"
                value={newSymptom.duration}
                onChange={(e) => setNewSymptom({ ...newSymptom, duration: e.target.value })}
                placeholder="Duration (e.g., 2 hours)"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              <input
                type="text"
                value={newSymptom.triggers}
                onChange={(e) => setNewSymptom({ ...newSymptom, triggers: e.target.value })}
                placeholder="Triggers (optional)"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={addSymptom}
              disabled={loading || !newSymptom.title}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Symptom'}
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

      {/* Enhanced Summary Statistics */}
      {symptomData.entries.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <FaChartLine className="text-red-500" />
            <span>Symptom Summary</span>
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-100 dark:border-red-800"
            >
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {symptomData.averageSeverity.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Severity</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800"
            >
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {symptomData.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800"
            >
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {symptomData.entries.filter(entry => entry.severity <= 2).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mild Days</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Symptoms List */}
      <div className="space-y-3">
        {loading && symptoms.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading symptoms...
          </div>
        ) : symptoms.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No symptoms logged yet. Add your first symptom!
          </div>
        ) : (
          symptoms.map((symptom, index) => (
            <motion.div
              key={symptom.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{symptom.title}</h4>
                    <span className={`text-sm font-medium ${severityColors[symptom.severity as keyof typeof severityColors]}`}>
                      {getSeverityLabel(symptom.severity)}
                    </span>
                    {symptom.body_part && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                        {symptom.body_part}
                      </span>
                    )}
                  </div>
                  
                  {symptom.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {symptom.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaCalendarDay />
                      {new Date(symptom.created_at).toLocaleDateString()}
                    </span>
                    {symptom.duration && (
                      <span>Duration: {symptom.duration}</span>
                    )}
                    {symptom.triggers && (
                      <span>Triggers: {symptom.triggers}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    symptom.severity <= 2 ? 'bg-green-500' :
                    symptom.severity <= 3 ? 'bg-yellow-500' :
                    symptom.severity <= 4 ? 'bg-orange-500' : 'bg-red-500'
                  }`}>
                    {symptom.severity}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Enhanced Symptom History with Expandable View */}
      {symptomData.entries.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FaHistory className="text-red-500" />
              <span>Recent Symptoms</span>
            </h4>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
            >
              <span className="text-sm">{showHistory ? 'Show Less' : 'Show All'}</span>
              {showHistory ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </motion.button>
          </div>
          
          <div className="space-y-2">
            {(showHistory ? symptomData.entries : symptomData.entries.slice(0, 7)).map((entry) => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    entry.severity <= 2 ? 'bg-green-500' :
                    entry.severity === 3 ? 'bg-yellow-500' :
                    entry.severity === 4 ? 'bg-orange-500' : 'bg-red-500'
                  }`}>
                    {entry.severity}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.title}
                    </p>
                    {entry.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        "{entry.description}"
                      </p>
                    )}
                    {entry.body_part && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Body part: {entry.body_part}
                      </p>
                    )}
                    {entry.duration && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Duration: {entry.duration}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <FaCalendar />
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Severity: {getSeverityLabel(entry.severity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {!showHistory && symptomData.entries.length > 7 && (
            <div className="text-center mt-3">
              <button
                onClick={() => setShowHistory(true)}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Show {symptomData.entries.length - 7} more entries
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={testConnection}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaDatabase className="text-sm" />
          <span className="text-sm">Test DB</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setNewSymptom({
              title: '',
              description: '',
              severity: 1,
              body_part: '',
              duration: '',
              triggers: '',
              medications_taken: []
            })
            setShowAddForm(false)
            addNotification({
              type: 'success',
              title: 'Reset Complete',
              message: 'Form has been reset successfully'
            })
          }}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        >
          <FaRedo className="text-sm" />
          <span className="text-sm">Reset</span>
        </motion.button>
        
        {symptomData.entries.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
          >
            <FaChartLine className="text-sm" />
            <span className="text-sm">{showHistory ? 'Hide History' : 'View Trends'}</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
