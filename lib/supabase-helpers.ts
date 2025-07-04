// Supabase helper functions for HealTrack
import { supabase } from './database'
import { Database } from './database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Symptom = Database['public']['Tables']['symptoms']['Row']
type HealthGoal = Database['public']['Tables']['health_goals']['Row']
type MoodEntry = Database['public']['Tables']['mood_entries']['Row']
type MeditationSession = Database['public']['Tables']['meditation_sessions']['Row']
type HealthInsight = Database['public']['Tables']['health_insights']['Row']
type Medication = Database['public']['Tables']['medications']['Row']
type Exercise = Database['public']['Tables']['exercises']['Row']

// Auth helpers
export const authHelpers = {
  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Sign up with email
  signUpWithEmail: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    if (error) throw error
    return data
  },

  // Sign in with email
  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // Sign in with Google
  signInWithGoogle: async (redirectTo?: string) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    if (error) throw error
    return data
  }
}

// Profile helpers
export const profileHelpers = {
  // Get user profile
  getProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update or create profile
  upsertProfile: async (profile: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Upload avatar
  uploadAvatar: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return publicUrl
  }
}

// Symptoms helpers
export const symptomsHelpers = {
  // Get user symptoms with pagination
  getSymptoms: async (userId: string, page = 1, limit = 20) => {
    const offset = (page - 1) * limit
    
    const { data, error, count } = await supabase
      .from('symptoms')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return {
      symptoms: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    }
  },

  // Add new symptom
  addSymptom: async (symptom: Omit<Symptom, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('symptoms')
      .insert([symptom])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update symptom
  updateSymptom: async (id: string, updates: Partial<Symptom>) => {
    const { data, error } = await supabase
      .from('symptoms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete symptom
  deleteSymptom: async (id: string) => {
    const { error } = await supabase
      .from('symptoms')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get symptoms analytics
  getSymptomsAnalytics: async (userId: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('symptoms')
      .select('severity, body_part, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
    
    if (error) throw error
    
    // Calculate analytics
    const totalSymptoms = data.length
    const avgSeverity = totalSymptoms > 0 
      ? (data.reduce((sum, s) => sum + s.severity, 0) / totalSymptoms).toFixed(1)
      : 0
    
    const bodyPartFrequency = data.reduce((acc, s) => {
      if (s.body_part) {
        acc[s.body_part] = (acc[s.body_part] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalSymptoms,
      avgSeverity,
      bodyPartFrequency,
      data
    }
  },

  // Get symptom history
  getSymptomHistory: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}

// Medications helpers
export const medicationsHelpers = {
  // Get user medications
  getMedications: async (userId: string, activeOnly = false) => {
    let query = supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (activeOnly) {
      const today = new Date().toISOString().split('T')[0]
      query = query.or(`end_date.is.null,end_date.gte.${today}`)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Add new medication
  addMedication: async (medication: Omit<Medication, 'id' | 'created_at'>) => {
    console.log('📋 Adding medication to Supabase:', medication);
    
    const { data, error } = await supabase
      .from('medications')
      .insert([medication])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Failed to add medication:', error);
      throw error;
    }
    
    console.log('✅ Medication added successfully:', data);
    return data
  },

  // Update medication
  updateMedication: async (id: string, updates: Partial<Medication>) => {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete medication
  deleteMedication: async (id: string) => {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get medication analytics
  getMedicationAnalytics: async (userId: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
    
    if (error) throw error
    
    const totalMedications = data.length
    const activeMedications = data.filter(m => {
      const today = new Date().toISOString().split('T')[0]
      return !m.end_date || m.end_date >= today
    }).length
    
    const frequencyStats = data.reduce((acc, m) => {
      if (m.frequency) {
        acc[m.frequency] = (acc[m.frequency] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalMedications,
      activeMedications,
      frequencyStats,
      data
    }
  },

  // Get medication history
  getMedicationHistory: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}

// Health goals helpers
export const healthGoalsHelpers = {
  // Get today's goals
  getTodaysGoals: async (userId: string, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create or update goal
  upsertGoal: async (goal: Omit<HealthGoal, 'id' | 'created_at'>) => {
    console.log('Attempting to upsert goal:', goal);
    
    try {
      // Try direct insert first (faster approach)
      console.log('Attempting direct insert...');
      const { data, error } = await supabase
        .from('health_goals')
        .insert([goal])
        .select()
        .single();

      if (error) {
        // If it's a unique constraint violation, try to update instead
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          console.log('Duplicate detected, attempting update...');
          
          const { data: updateData, error: updateError } = await supabase
            .from('health_goals')
            .update({
              goal_description: goal.goal_description,
              target_value: goal.target_value,
              unit: goal.unit,
              current_value: goal.current_value,
              achieved: goal.achieved,
              streak: goal.streak
            })
            .eq('user_id', goal.user_id)
            .eq('goal_type', goal.goal_type)
            .eq('date', goal.date)
            .select()
            .single();

          if (updateError) throw updateError;
          console.log('Goal updated successfully:', updateData);
          return updateData;
        } else {
          throw error;
        }
      }

      console.log('Goal inserted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in upsertGoal:', error);
      throw error;
    }
  },

  // Simple goal creation (alternative to upsert)
  createGoal: async (goal: Omit<HealthGoal, 'id' | 'created_at'>) => {
    console.log('Creating new goal directly:', goal);
    
    const { data, error } = await supabase
      .from('health_goals')
      .insert([goal])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      throw error;
    }

    console.log('Goal created successfully:', data);
    return data;
  },

  // Update goal progress
  updateGoalProgress: async (id: string, currentValue: number, achieved?: boolean) => {
    const { data, error } = await supabase
      .from('health_goals')
      .update({ 
        current_value: currentValue,
        achieved: achieved
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get goal statistics
  getGoalStats: async (userId: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
    
    if (error) throw error
    
    const totalGoals = data.length
    const achievedGoals = data.filter(g => g.achieved).length
    const achievementRate = totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0
    
    return {
      totalGoals,
      achievedGoals,
      achievementRate: achievementRate.toFixed(1),
      data
    }
  },

  // Get goal history for a specific goal type
  getGoalHistory: async (userId: string, goalType: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_type', goalType)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get all goals history
  getAllGoalsHistory: async (userId: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Delete a goal
  deleteGoal: async (id: string) => {
    const { error } = await supabase
      .from('health_goals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Mood tracking helpers
export const moodHelpers = {
  // Get mood entries
  getMoodEntries: async (userId: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    const avgMood = data.length > 0 
      ? (data.reduce((sum, entry) => sum + entry.mood_value, 0) / data.length).toFixed(1)
      : 0
    
    return {
      entries: data,
      average: avgMood,
      total: data.length
    }
  },

  // Add mood entry
  addMoodEntry: async (moodEntry: Omit<MoodEntry, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert([moodEntry])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get mood trends
  getMoodTrends: async (userId: string, days = 30) => {
    const { entries } = await moodHelpers.getMoodEntries(userId, days)
    
    // Group by date
    const dailyMoods = entries.reduce((acc: Record<string, number[]>, entry) => {
      const date = entry.created_at.split('T')[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(entry.mood_value)
      return acc
    }, {} as Record<string, number[]>)
    
    // Calculate daily averages
    const trends = Object.entries(dailyMoods).map(([date, moods]) => ({
      date,
      avgMood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
      entries: moods.length
    })).sort((a, b) => a.date.localeCompare(b.date))
    
    return trends
  }
}

// Meditation helpers
export const meditationHelpers = {
  // Get meditation sessions
  getMeditationSessions: async (userId: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    const totalSessions = data.length
    const completedSessions = data.filter(s => s.completed).length
    const totalMinutes = data.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0)
    
    return {
      sessions: data,
      totalSessions,
      completedSessions,
      totalMinutes,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
    }
  },

  // Start meditation session
  startMeditationSession: async (session: Omit<MeditationSession, 'id' | 'created_at' | 'completed'>) => {
    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert([{ ...session, completed: false }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Complete meditation session
  completeMeditationSession: async (id: string) => {
    const { data, error } = await supabase
      .from('meditation_sessions')
      .update({ completed: true })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Health insights helpers
export const healthInsightsHelpers = {
  // Get health insights
  getHealthInsights: async (userId: string, unreadOnly = false) => {
    let query = supabase
      .from('health_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Add health insight
  addHealthInsight: async (insight: Omit<HealthInsight, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('health_insights')
      .insert([insight])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Mark insight as read
  markInsightAsRead: async (id: string) => {
    const { data, error } = await supabase
      .from('health_insights')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Generate AI insights (mock function - replace with actual AI logic)
  generateInsights: async (userId: string) => {
    // This would typically call an AI service or analyze user data
    // For now, we'll create some sample insights
    const insights = [
      {
        user_id: userId,
        insight_type: 'tip' as const,
        title: 'Stay Hydrated',
        description: 'You\'ve been doing great with your water intake! Keep it up.',
        priority: 'medium' as const
      },
      {
        user_id: userId,
        insight_type: 'trend' as const,
        title: 'Mood Improvement',
        description: 'Your mood has been trending upward over the past week. Great progress!',
        priority: 'high' as const
      }
    ]
    
    const { data, error } = await supabase
      .from('health_insights')
      .insert(insights)
      .select()
    
    if (error) throw error
    return data
  }
}

// Exercise helpers
export const exerciseHelpers = {
  // Get user exercises with pagination
  getExercises: async (userId: string, page = 1, limit = 20) => {
    const offset = (page - 1) * limit
    
    const { data, error, count } = await supabase
      .from('exercises')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return {
      exercises: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    }
  },

  // Add new exercise
  addExercise: async (exercise: Omit<Exercise, 'id' | 'created_at'>) => {
    console.log('💪 Adding exercise to Supabase:', exercise);
    
    const { data, error } = await supabase
      .from('exercises')
      .insert([exercise])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Failed to add exercise:', error);
      throw error;
    }
    
    console.log('✅ Exercise added successfully:', data);
    return data
  },

  // Start an ongoing exercise
  startExercise: async (exercise: Omit<Exercise, 'id' | 'created_at' | 'completed_at'>) => {
    console.log('🏃 Starting exercise session:', exercise);
    
    const exerciseData = {
      ...exercise,
      is_ongoing: true,
      started_at: new Date().toISOString(),
      completed_at: null
    };

    const { data, error } = await supabase
      .from('exercises')
      .insert([exerciseData])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Failed to start exercise:', error);
      throw error;
    }
    
    console.log('✅ Exercise started successfully:', data);
    return data
  },

  // Complete an ongoing exercise
  completeExercise: async (exerciseId: string, updates?: Partial<Exercise>) => {
    console.log('🏁 Completing exercise:', exerciseId);
    
    const updateData = {
      ...updates,
      is_ongoing: false,
      completed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', exerciseId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Failed to complete exercise:', error);
      throw error;
    }
    
    console.log('✅ Exercise completed successfully:', data);
    return data
  },

  // Get ongoing exercises
  getOngoingExercises: async (userId: string) => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('is_ongoing', true)
      .order('started_at', { ascending: false })
    
    if (error) {
      console.error('❌ Failed to get ongoing exercises:', error);
      throw error;
    }
    
    return data
  },

  // Update exercise
  updateExercise: async (id: string, updates: Partial<Exercise>) => {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete exercise
  deleteExercise: async (id: string) => {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get exercise analytics
  getExerciseAnalytics: async (userId: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('is_ongoing', false) // Only completed exercises
      .gte('created_at', startDate.toISOString())
    
    if (error) throw error
    
    const totalExercises = data.length
    const totalDuration = data.reduce((sum, e) => sum + e.duration_minutes, 0)
    const totalCalories = data.reduce((sum, e) => sum + e.calories_burned, 0)
    const avgIntensity = totalExercises > 0 
      ? (data.reduce((sum, e) => sum + e.intensity_level, 0) / totalExercises).toFixed(1)
      : 0
    
    const exerciseTypeFrequency = data.reduce((acc, e) => {
      acc[e.exercise_type] = (acc[e.exercise_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalExercises,
      totalDuration,
      totalCalories,
      avgIntensity,
      exerciseTypeFrequency,
      data
    }
  },

  // Get exercise history
  getExerciseHistory: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get exercise trends (for graphs)
  getExerciseTrends: async (userId: string, days = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('exercises')
      .select('exercise_type, duration_minutes, intensity_level, calories_burned, created_at')
      .eq('user_id', userId)
      .eq('is_ongoing', false)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Group by date for trend analysis
    const dailyExercises = data.reduce((acc: Record<string, any[]>, exercise) => {
      const date = exercise.created_at.split('T')[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(exercise)
      return acc
    }, {} as Record<string, any[]>)
    
    // Calculate daily stats
    const trends = Object.entries(dailyExercises).map(([date, exercises]) => ({
      date,
      totalDuration: exercises.reduce((sum, e) => sum + e.duration_minutes, 0),
      totalCalories: exercises.reduce((sum, e) => sum + e.calories_burned, 0),
      avgIntensity: exercises.reduce((sum, e) => sum + e.intensity_level, 0) / exercises.length,
      exerciseCount: exercises.length,
      exercises
    })).sort((a, b) => a.date.localeCompare(b.date))
    
    return trends
  }
}

// Real-time subscriptions
export const realtimeHelpers = {
  // Subscribe to user's health data changes
  subscribeToUserData: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`user_${userId}_data`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  // Subscribe to profile changes
  subscribeToProfile: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`profile_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

// Utility functions
export const utils = {
  // Upload file to Supabase Storage
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    
    if (error) throw error
    return data
  },

  // Get public URL for uploaded file
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  // Export user data
  exportUserData: async (userId: string) => {
    const [profile, symptoms, goals, moods, meditations, insights] = await Promise.all([
      profileHelpers.getProfile(userId),
      symptomsHelpers.getSymptoms(userId, 1, 1000),
      healthGoalsHelpers.getGoalStats(userId, 365),
      moodHelpers.getMoodEntries(userId, 365),
      meditationHelpers.getMeditationSessions(userId, 365),
      healthInsightsHelpers.getHealthInsights(userId)
    ])
    
    return {
      profile,
      symptoms: symptoms.symptoms,
      healthGoals: goals.data,
      moodEntries: moods.entries,
      meditationSessions: meditations.sessions,
      healthInsights: insights,
      exportedAt: new Date().toISOString()
    }
  }
}

// Export individual helper functions for convenience
export const updateProfile = profileHelpers.upsertProfile;
