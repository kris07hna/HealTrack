// React hooks for HealTrack frontend data management
// File: lib/hooks/useHealth.ts

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Types for our health data
export interface Profile {
  id: string;
  full_name: string;
  date_of_birth: string;
  height_cm: number;
  weight_kg: number;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions: string[];
  allergies: string[];
  current_medications: string[];
  created_at: string;
  updated_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  symptom_name: string;
  severity: number;
  description: string;
  duration_hours: number;
  triggers: string[];
  created_at: string;
}

export interface HealthGoal {
  id: string;
  user_id: string;
  goal_type: string;
  goal_description: string;
  target_value: number;
  current_value: number;
  unit: string;
  date: string;
  achieved: boolean;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_value: number;
  mood_description: string;
  notes: string;
  created_at: string;
}

export interface MeditationSession {
  id: string;
  user_id: string;
  session_type: string;
  duration: number;
  completed: boolean;
  created_at: string;
}

// Custom hook for profile management
export const useProfile = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await fetchProfile(); // Refresh profile data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
};

// Custom hook for symptoms tracking
export const useSymptoms = () => {
  const { data: session } = useSession();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchSymptoms = useCallback(async (page = 1, limit = 20) => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/symptoms?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch symptoms');
      }
      
      const data = await response.json();
      setSymptoms(data.symptoms);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const addSymptom = useCallback(async (symptomData: Omit<Symptom, 'id' | 'user_id' | 'created_at'>) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(symptomData),
      });

      if (!response.ok) {
        throw new Error('Failed to add symptom');
      }

      await fetchSymptoms(); // Refresh symptoms list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [session, fetchSymptoms]);

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  return {
    symptoms,
    loading,
    error,
    pagination,
    addSymptom,
    fetchSymptoms,
  };
};

// Custom hook for health goals
export const useHealthGoals = () => {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async (date?: string) => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const url = date ? `/api/health-goals?date=${date}` : '/api/health-goals';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch health goals');
      }
      
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const addGoal = useCallback(async (goalData: Omit<HealthGoal, 'id' | 'user_id'>) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/health-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        throw new Error('Failed to add health goal');
      }

      await fetchGoals(); // Refresh goals list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [session, fetchGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<HealthGoal>) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/health-goals?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update health goal');
      }

      await fetchGoals(); // Refresh goals list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [session, fetchGoals]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    fetchGoals,
  };
};

// Custom hook for mood tracking
export const useMood = () => {
  const { data: session } = useSession();
  const [moodData, setMoodData] = useState<{
    entries: MoodEntry[];
    average: string;
    total: number;
  }>({
    entries: [],
    average: '0',
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoodData = useCallback(async (days = 30) => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/mood?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch mood data');
      }
      
      const data = await response.json();
      setMoodData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const addMoodEntry = useCallback(async (moodData: Omit<MoodEntry, 'id' | 'user_id' | 'created_at'>) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moodData),
      });

      if (!response.ok) {
        throw new Error('Failed to add mood entry');
      }

      await fetchMoodData(); // Refresh mood data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [session, fetchMoodData]);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  return {
    moodData,
    loading,
    error,
    addMoodEntry,
    fetchMoodData,
  };
};

// Custom hook for dashboard statistics
export const useDashboardStats = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Custom hook for real-time updates
export const useRealtimeSync = (userId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!userId) return;

    // This would connect to Supabase real-time
    // Implementation depends on your Supabase client setup
    const channel = `user_${userId}_sync`;
    
    // Simulated connection
    setIsConnected(true);
    setLastUpdate(new Date());

    // Cleanup function
    return () => {
      setIsConnected(false);
    };
  }, [userId]);

  return {
    isConnected,
    lastUpdate,
  };
};

// Utility function for data export
export const useDataExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportHealthData = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      setExporting(true);
      const response = await fetch(`/api/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      console.error('Export failed:', err);
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportHealthData,
    exporting,
  };
};
