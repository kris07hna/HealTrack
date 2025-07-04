// Export utility types for HealTrack
export interface ExportData {
  profile?: ProfileData;
  symptoms?: SymptomData[];
  medications?: MedicationData[];
  exercises?: ExerciseData[];
  moodEntries?: MoodData[];
  meditations?: MeditationData[];
  healthGoals?: HealthGoalData[];
  healthInsights?: HealthInsightData[];
  exportDate: string;
  exportedBy: string;
}

export interface ProfileData {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  blood_type?: string;
  activity_level?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string[];
  allergies?: string[];
  current_medications?: string[];
  created_at: string;
  updated_at: string;
}

export interface SymptomData {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  severity: number;
  body_part?: string;
  duration?: string;
  triggers?: string;
  medications_taken?: string[];
  created_at: string;
}

export interface MedicationData {
  id: string;
  user_id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
}

export interface ExerciseData {
  id: string;
  user_id: string;
  exercise_type: string;
  duration_minutes: number;
  intensity_level: number;
  calories_burned: number;
  notes?: string;
  is_ongoing: boolean;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MoodData {
  id: string;
  user_id: string;
  mood_value: number;
  mood_description?: string;
  notes?: string;
  created_at: string;
}

export interface MeditationData {
  id: string;
  user_id: string;
  session_type: string;
  duration: number;
  completed: boolean;
  created_at: string;
}

export interface HealthGoalData {
  id: string;
  user_id: string;
  goal_type: string;
  goal_description?: string;
  target_value: number;
  current_value: number;
  unit?: string;
  date: string;
  achieved: boolean;
  streak: number;
  created_at: string;
}

export interface HealthInsightData {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}
