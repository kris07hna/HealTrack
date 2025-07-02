import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaSmile, 
  FaFrown, 
  FaMeh, 
  FaLaughBeam, 
  FaSadTear, 
  FaGrinStars,
  FaChartLine,
  FaHistory,
  FaChevronDown,
  FaChevronUp,
  FaCalendar,
  FaDatabase,
  FaRedo
} from 'react-icons/fa'
import { useTheme } from '../../lib/theme'
import { moodHelpers } from '../../lib/supabase-helpers'
import { useNotifications } from '../../lib/notifications'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/database'

interface MoodEntry {
  id: string
  mood_value: number
  mood_description: string | null
  notes: string | null
  created_at: string
}

const moodOptions = [
  { value: 1, icon: FaSadTear, label: 'Very Sad', color: 'text-red-500', description: 'Feeling very down' },
  { value: 2, icon: FaFrown, label: 'Sad', color: 'text-orange-500', description: 'Feeling low' },
  { value: 3, icon: FaMeh, label: 'Neutral', color: 'text-yellow-500', description: 'Feeling okay' },
  { value: 4, icon: FaSmile, label: 'Happy', color: 'text-green-500', description: 'Feeling good' },
  { value: 5, icon: FaGrinStars, label: 'Very Happy', color: 'text-blue-500', description: 'Feeling amazing' }
]

export default function MoodTracker() {
  const { theme } = useTheme()
  const { addNotification } = useNotifications()
  const { user, isAuthenticated } = useAuth()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [moodData, setMoodData] = useState<{
    entries: MoodEntry[]
    average: string
    total: number
  }>({
    entries: [],
    average: '0',
    total: 0
  })

  // Get current user and set up real-time subscriptions
  useEffect(() => {
    const getCurrentUser = async () => {
      if (isAuthenticated && user) {
        await fetchMoodData(user.id)
      }
    }
    getCurrentUser()

    // Set up real-time subscription for mood entries
    let subscription: any = null
    
    if (user) {
      console.log('Setting up mood real-time subscription for user:', user.id)
      
      subscription = supabase
        .channel('mood_entries_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mood_entries',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Mood real-time update received:', payload)
            
            switch (payload.eventType) {
              case 'INSERT':
                console.log('New mood entry added:', payload.new)
                fetchMoodData(user.id)
                addNotification({
                  type: 'success',
                  title: 'Mood Synced',
                  message: 'Your mood has been synchronized!'
                })
                break
                
              case 'UPDATE':
                console.log('Mood entry updated:', payload.new)
                // Update local state directly for better performance
                setMoodData(prevData => ({
                  ...prevData,
                  entries: prevData.entries.map(entry => 
                    entry.id === payload.new.id 
                      ? { ...entry, ...payload.new }
                      : entry
                  )
                }))
                break
                
              case 'DELETE':
                console.log('Mood entry deleted:', payload.old)
                setMoodData(prevData => ({
                  ...prevData,
                  entries: prevData.entries.filter(entry => entry.id !== payload.old.id)
                }))
                addNotification({
                  type: 'info',
                  title: 'Mood Entry Removed',
                  message: 'A mood entry has been deleted.'
                })
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('Mood subscription status:', status)
        })
    }

    return () => {
      if (subscription) {
        console.log('Cleaning up mood real-time subscription')
        supabase.removeChannel(subscription)
      }
    }
  }, [isAuthenticated, user])

  const fetchMoodData = async (userId: string) => {
    try {
      setLoading(true)
      console.log('Fetching mood data for user:', userId)
      
      const data = await moodHelpers.getMoodEntries(userId, 30)
      console.log('Mood data received:', data)
      
      setMoodData({
        entries: data.entries,
        average: typeof data.average === 'string' ? data.average : data.average.toString(),
        total: data.total
      })
      
      addNotification({
        type: 'success',
        title: 'Mood Data Loaded',
        message: `Found ${data.total} mood entries from the last 30 days.`
      })
    } catch (error) {
      console.error('Error fetching mood data:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Load Mood Data',
        message: `Could not retrieve your mood history: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      console.log('Testing mood database connection...')
      
      // Test auth first
      const { data: authData, error: authError } = await supabase.auth.getUser()
      console.log('Auth test:', { user: authData.user?.id, error: authError })
      
      if (authError) {
        addNotification({
          type: 'error',
          title: 'Auth Error',
          message: `Authentication failed: ${authError.message}`
        })
        return
      }
      
      // Test mood_entries table connection
      const { data, error, count } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true })
      
      console.log('Mood database test result:', { data, error, count })
      
      if (error) {
        console.error('Mood database error details:', error)
        addNotification({
          type: 'error',
          title: 'Database Error',
          message: `Mood database query failed: ${error.message}`
        })
      } else {
        addNotification({
          type: 'success',
          title: 'Connection Successful',
          message: `Mood database connected! Found ${count || 0} total mood entries.`
        })
      }
    } catch (error) {
      console.error('Mood connection test exception:', error)
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: `Mood connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  const handleMoodSubmit = async () => {
    if (!selectedMood || !user) {
      addNotification({
        type: 'error',
        title: 'Invalid Input',
        message: 'Please select a mood and make sure you are logged in.'
      })
      return
    }

    console.log('Starting mood submission...')
    setLoading(true)

    // Add timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      console.log('Mood submission timeout reached')
      setLoading(false)
      addNotification({
        type: 'error',
        title: 'Request Timeout',
        message: 'The request took too long. Please try again.'
      })
    }, 15000) // 15 second timeout

    try {
      const moodOption = moodOptions.find(m => m.value === selectedMood)
      
      const moodData = {
        user_id: user.id,
        mood_value: selectedMood,
        mood_description: moodOption?.description || null,
        notes: notes || null
      }
      
      console.log('Submitting mood entry:', moodData)

      const result = await moodHelpers.addMoodEntry(moodData)

      console.log('Mood entry result:', result)

      if (result) {
        clearTimeout(timeoutId)
        
        // Show success notification with specific details
        addNotification({
          type: 'success',
          title: 'Mood Logged Successfully!',
          message: `Your ${moodOption?.label.toLowerCase()} mood (${selectedMood}/5) has been saved to the database.`
        })

        // Refresh mood data
        console.log('Refreshing mood data after successful submission...')
        await fetchMoodData(user.id)
        
        // Reset form
        setSelectedMood(null)
        setNotes('')
        console.log('Form reset complete')
      } else {
        clearTimeout(timeoutId)
        throw new Error('No data returned from mood creation')
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Error saving mood:', error)
      addNotification({
        type: 'error',
        title: 'Failed to Save Mood',
        message: `Could not save your mood entry: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      console.log('Setting mood loading to false')
      setLoading(false)
    }
  }

  const getRecentMoods = () => {
    return moodData.entries.slice(0, 7).map(entry => {
      const mood = moodOptions.find(m => m.value === entry.mood_value)
      return {
        ...entry,
        mood: mood
      }
    })
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Please sign in to track your mood
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          How are you feeling today?
        </h3>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={testConnection}
            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
          >
            Test DB
          </motion.button>
          
          {loading && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLoading(false)}
              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
            >
              Reset
            </motion.button>
          )}
        </div>
      </div>

      {/* Mood Summary */}
      {moodData.entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <FaChartLine className="text-green-500" />
            <span>Your Mood Overview (Last 30 Days)</span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {moodData.average}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Average Mood</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {moodData.total}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Entries</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {moodData.entries.filter(m => m.mood_value >= 4).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Happy Days</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mood Selection */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {moodOptions.map((mood) => {
          const Icon = mood.icon
          const isSelected = selectedMood === mood.value
          
          return (
            <motion.button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`text-2xl mx-auto mb-2 ${mood.color}`} />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {mood.label}
              </p>
            </motion.button>
          )
        })}
      </div>

      {/* Notes Input */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's making you feel this way?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={3}
          />
        </motion.div>
      )}

      {/* Submit Button */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2"
        >
          <button
            onClick={handleMoodSubmit}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Saving...' : 'Save Mood'}
          </button>
          
          <button
            onClick={() => {
              setSelectedMood(null)
              setNotes('')
              setLoading(false)
            }}
            className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </motion.div>
      )}

      {/* Stats - Keep legacy stats for comparison */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {moodData.average}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Mood</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {moodData.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
        </div>
      </div>

      {/* Recent Moods with History */}
      {moodData.entries.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FaHistory className="text-blue-500" />
              <span>Recent Moods</span>
            </h4>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
            >
              <span className="text-sm">{showHistory ? 'Show Less' : 'Show All'}</span>
              {showHistory ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </motion.button>
          </div>
          
          <div className="space-y-2">
            {(showHistory ? moodData.entries : moodData.entries.slice(0, 7)).map((entry) => {
              const mood = moodOptions.find(m => m.value === entry.mood_value)
              return (
                <motion.div 
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    {mood && (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${
                        mood.value >= 4 ? 'from-green-400 to-blue-500' :
                        mood.value === 3 ? 'from-yellow-400 to-orange-500' :
                        'from-red-400 to-pink-500'
                      }`}>
                        <mood.icon className="text-white text-lg" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {mood?.label} ({entry.mood_value}/5)
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          "{entry.notes}"
                        </p>
                      )}
                      {entry.mood_description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {entry.mood_description}
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
                  </div>
                </motion.div>
              )
            })}
          </div>
          
          {!showHistory && moodData.entries.length > 7 && (
            <div className="text-center mt-3">
              <button
                onClick={() => setShowHistory(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Show {moodData.entries.length - 7} more entries
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
            setSelectedMood(null)
            setNotes('')
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
        
        {moodData.entries.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
          >
            <FaChartLine className="text-sm" />
            <span className="text-sm">{showHistory ? 'Hide History' : 'View Trends'}</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
