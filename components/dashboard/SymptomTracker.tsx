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
  FaChevronUp,
  FaCalendar,
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

  // Real-time subscription setup
  useEffect(() => {
    if (user) {
      console.log('🔄 Setting up real-time subscription for symptoms...')
      
      const subscription = supabase
        .channel(`symptoms_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'symptoms',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('🆕 New symptom added:', payload)
          fetchSymptomData(user.id)
          addNotification({
            type: 'success',
            title: 'Real-time Update',
            message: 'Symptom data synchronized successfully'
          })
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'symptoms',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('🔄 Symptom updated:', payload)
          fetchSymptomData(user.id)
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'symptoms',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('🗑️ Symptom deleted:', payload)
          fetchSymptomData(user.id)
        })
        .subscribe((status) => {
          console.log('📡 Symptoms subscription status:', status)
        })

      // Initial data fetch
      fetchSymptomData(user.id)

      return () => {
        console.log('🔌 Cleaning up symptoms subscription...')
        supabase.removeChannel(subscription)
      }
    }
  }, [user])

  const fetchSymptomData = async (userId: string) => {
    try {
      setLoading(true)
      console.log('🔄 Fetching symptom data for user:', userId)
      
      const analytics = await symptomsHelpers.getSymptomsAnalytics(userId, 30)
      const history = await symptomsHelpers.getSymptomHistory(userId, 50)
      
      setSymptomData({
        total: analytics.totalSymptoms,
        averageSeverity: typeof analytics.avgSeverity === 'string' ? parseFloat(analytics.avgSeverity) : analytics.avgSeverity,
        entries: history
      })

      console.log('✅ Symptom data loaded:', {
        total: analytics.totalSymptoms,
        averageSeverity: analytics.avgSeverity,
        historyCount: history.length
      })

      addNotification({
        type: 'success',
        title: 'Data Synchronized',
        message: `Loaded ${analytics.totalSymptoms} symptoms from your health records`
      })

    } catch (error) {
      console.error('❌ Error fetching symptom data:', error)
      addNotification({
        type: 'error',
        title: 'Data Load Failed',
        message: 'Could not load your symptom history'
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to test the database connection'
      })
      return
    }

    try {
      setLoading(true)
      console.log('🔍 Testing symptoms database connection...')
      console.log('User ID:', user.id)
      
      // Test 1: Basic table access
      console.log('📋 Test 1: Basic table access...')
      const { data: basicTest, error: basicError } = await supabase
        .from('symptoms')
        .select('count')
        .limit(1)

      if (basicError) {
        console.error('❌ Basic access failed:', basicError)
        throw new Error(`Basic access failed: ${basicError.message}`)
      }
      console.log('✅ Basic table access successful')

      // Test 2: User-specific query
      console.log('👤 Test 2: User-specific query...')
      const { data: userTest, error: userError } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .limit(5)

      if (userError) {
        console.error('❌ User query failed:', userError)
        throw new Error(`User query failed: ${userError.message}`)
      }
      console.log('✅ User-specific query successful:', userTest)

      // Test 3: Test insert with sample data
      console.log('💾 Test 3: Sample insert test...')
      const testSymptom = {
        user_id: user.id,
        title: 'Database Test Symptom',
        description: 'This is a test entry to verify database connectivity',
        severity: 1,
        body_part: 'Head',
        duration: 'Test duration',
        triggers: 'Test trigger',
        medications_taken: ['Test medication']
      }

      const { data: insertTest, error: insertError } = await supabase
        .from('symptoms')
        .insert([testSymptom])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Insert test failed:', insertError)
        addNotification({
          type: 'error',
          title: 'Insert Test Failed',
          message: `Cannot insert data: ${insertError.message}`
        })
        throw insertError
      }

      console.log('✅ Insert test successful:', insertTest)

      // Test 4: Delete the test entry
      console.log('🗑️ Test 4: Cleaning up test entry...')
      const { error: deleteError } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', insertTest.id)

      if (deleteError) {
        console.warn('⚠️ Could not delete test entry:', deleteError)
      } else {
        console.log('✅ Test entry cleaned up successfully')
      }

      addNotification({
        type: 'success',
        title: 'Database Tests Passed! ✅',
        message: 'All database operations are working correctly. Symptoms table is accessible and writable.'
      })
      
      await fetchSymptomData(user.id)
      
    } catch (error) {
      console.error('❌ Connection test failed:', error)
      addNotification({
        type: 'error',
        title: 'Database Connection Failed',
        message: error instanceof Error ? error.message : 'Database connection test failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const addSymptom = async () => {
    if (!user || !newSymptom.title) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a symptom title and ensure you are logged in.'
      })
      return
    }

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
      
      const symptomData = {
        user_id: user.id,
        title: newSymptom.title,
        description: newSymptom.description || null,
        severity: newSymptom.severity,
        body_part: newSymptom.body_part || null,
        duration: newSymptom.duration || null,
        triggers: newSymptom.triggers || null,
        medications_taken: newSymptom.medications_taken.length > 0 ? newSymptom.medications_taken : null
      }
      
      console.log('🔄 Submitting symptom:', symptomData)

      // Try direct Supabase insert first
      console.log('📝 Attempting direct Supabase insert...')
      const { data: directResult, error: directError } = await supabase
        .from('symptoms')
        .insert([symptomData])
        .select()
        .single()

      if (directError) {
        console.error('❌ Direct insert failed:', directError)
        addNotification({
          type: 'error',
          title: 'Database Error',
          message: `Direct insert failed: ${directError.message}`
        })
        throw directError
      }

      console.log('✅ Direct insert successful:', directResult)
      clearTimeout(timeoutId) // Clear timeout if successful

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Symptom Saved to Database! ✅',
        message: `${newSymptom.title} (severity ${newSymptom.severity}) has been successfully saved to Supabase database.`
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
      
      // Detailed error reporting
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error, null, 2)
      }
      
      addNotification({
        type: 'error',
        title: 'Failed to Save Symptom',
        message: `Database error: ${errorMessage}. Please check the console for more details.`
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <FaExclamationTriangle className="text-red-500" />
          <span>Symptom Tracker</span>
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          <FaPlus className="text-sm" />
          <span>Log Symptom</span>
        </motion.button>
      </div>

      {/* Summary Section */}
      {symptomData.entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {symptomData.total}
                </p>
                <p className="text-sm text-blue-500 dark:text-blue-300">Total Symptoms</p>
              </div>
              <FaChartLine className="text-2xl text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {symptomData.averageSeverity.toFixed(1)}
                </p>
                <p className="text-sm text-orange-500 dark:text-orange-300">Avg Severity</p>
              </div>
              <FaExclamationTriangle className="text-2xl text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {symptomData.entries.filter(entry => entry.severity <= 2).length}
                </p>
                <p className="text-sm text-green-500 dark:text-green-300">Mild Episodes</p>
              </div>
              <FaClock className="text-2xl text-green-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Symptom Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Log New Symptom
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Symptom Title *
              </label>
              <input
                type="text"
                value={newSymptom.title}
                onChange={(e) => setNewSymptom(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Headache, Nausea, Fatigue"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Part
              </label>
              <select
                value={newSymptom.body_part}
                onChange={(e) => setNewSymptom(prev => ({ ...prev, body_part: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select body part</option>
                {bodyParts.map(part => (
                  <option key={part} value={part}>{part}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity (1-5)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setNewSymptom(prev => ({ ...prev, severity: level }))}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      newSymptom.severity === level
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getSeverityLabel(newSymptom.severity)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <input
                type="text"
                value={newSymptom.duration}
                onChange={(e) => setNewSymptom(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 2 hours, All day, 30 minutes"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newSymptom.description}
                onChange={(e) => setNewSymptom(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your symptom in detail..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Possible Triggers
              </label>
              <input
                type="text"
                value={newSymptom.triggers}
                onChange={(e) => setNewSymptom(prev => ({ ...prev, triggers: e.target.value }))}
                placeholder="e.g., Stress, Food, Weather"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Medications Taken
              </label>
              <input
                type="text"
                value={newSymptom.medications_taken.join(', ')}
                onChange={(e) => setNewSymptom(prev => ({ 
                  ...prev, 
                  medications_taken: e.target.value.split(',').map(med => med.trim()).filter(med => med) 
                }))}
                placeholder="e.g., Ibuprofen, Tylenol"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addSymptom}
              disabled={loading || !newSymptom.title}
              className="flex items-center space-x-2 px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <FaPlus className="text-sm" />
              <span>{loading ? 'Saving...' : 'Save Symptom'}</span>
            </motion.button>

            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Symptoms History */}
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
            {(showHistory ? symptomData.entries : symptomData.entries.slice(0, 7)).map((symptom) => (
              <motion.div 
                key={symptom.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${
                    symptom.severity <= 2 ? 'from-green-400 to-blue-500' :
                    symptom.severity === 3 ? 'from-yellow-400 to-orange-500' :
                    'from-red-400 to-pink-500'
                  }`}>
                    <FaExclamationTriangle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {symptom.title} (severity {symptom.severity}/5)
                    </p>
                    {symptom.body_part && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📍 {symptom.body_part}
                      </p>
                    )}
                    {symptom.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        "{symptom.description}"
                      </p>
                    )}
                    {symptom.duration && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        ⏱️ Duration: {symptom.duration}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <FaCalendar />
                    <span>{new Date(symptom.created_at).toLocaleDateString()}</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(symptom.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            console.log('🔍 Debug Info:', {
              user: user ? { id: user.id, email: user.email } : null,
              isAuthenticated,
              environment: {
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
              },
              symptomData: {
                total: symptomData.total,
                entriesCount: symptomData.entries.length,
                averageSeverity: symptomData.averageSeverity
              }
            })
            
            // Test with actual helper function
            if (user) {
              console.log('🧪 Testing symptomsHelpers.addSymptom function...')
              const testData = {
                user_id: user.id,
                title: 'Test from Debug Button',
                description: 'This is a test symptom from debug',
                severity: 2,
                body_part: 'Head',
                duration: '5 minutes',
                triggers: 'Debug test',
                medications_taken: null
              }
              
              symptomsHelpers.addSymptom(testData)
                .then(result => {
                  console.log('✅ Helper function test successful:', result)
                  addNotification({
                    type: 'success',
                    title: 'Debug Test Passed',
                    message: 'Helper function is working correctly!'
                  })
                  fetchSymptomData(user.id)
                })
                .catch(error => {
                  console.error('❌ Helper function test failed:', error)
                  addNotification({
                    type: 'error',
                    title: 'Debug Test Failed',
                    message: `Helper function error: ${error.message}`
                  })
                })
            }
            
            addNotification({
              type: 'info',
              title: 'Debug Info',
              message: `User: ${user?.email || 'Not logged in'} | Check console for full details`
            })
          }}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
        >
          <FaUser className="text-sm" />
          <span className="text-sm">Debug</span>
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
