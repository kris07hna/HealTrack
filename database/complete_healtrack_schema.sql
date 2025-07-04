-- HealTrack Complete Database Schema for Supabase
-- Run this complete script in your Supabase SQL editor
-- This creates all tables, indexes, RLS policies, and functions for HealTrack

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptoms Table
CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10) NOT NULL,
  body_part TEXT,
  duration TEXT,
  triggers TEXT,
  medications_taken TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications Table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Goals Table
CREATE TABLE IF NOT EXISTS public.health_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('water', 'steps', 'sleep', 'exercise', 'meditation', 'weight', 'custom')),
  goal_description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT,
  date DATE DEFAULT CURRENT_DATE,
  achieved BOOLEAN DEFAULT FALSE,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood Entries Table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_value INTEGER CHECK (mood_value >= 1 AND mood_value <= 5) NOT NULL,
  mood_description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meditation Sessions Table
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('breathing', 'mindfulness', 'body_scan', 'loving_kindness', 'custom')),
  duration INTEGER NOT NULL, -- in minutes
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Insights Table
CREATE TABLE IF NOT EXISTS public.health_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('tip', 'warning', 'achievement', 'trend', 'reminder')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises Table (Enhanced with ongoing workout tracking)
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('running', 'cycling', 'swimming', 'weightlifting', 'walking', 'yoga', 'pilates', 'basketball', 'soccer', 'tennis', 'boxing', 'dancing', 'hiking', 'climbing', 'rowing', 'custom')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  intensity_level INTEGER NOT NULL CHECK (intensity_level >= 1 AND intensity_level <= 5),
  calories_burned INTEGER NOT NULL DEFAULT 0 CHECK (calories_burned >= 0),
  notes TEXT,
  is_ongoing BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_id ON public.symptoms(user_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_created_at ON public.symptoms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptoms_severity ON public.symptoms(severity DESC);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON public.medications(user_id, end_date);  -- Removed problematic WHERE clause
CREATE INDEX IF NOT EXISTS idx_health_goals_user_id_date ON public.health_goals(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_health_goals_type ON public.health_goals(user_id, goal_type, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON public.mood_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON public.meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_completed ON public.meditation_sessions(user_id, completed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_insights_user_id ON public.health_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_health_insights_unread ON public.health_insights(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_created_at ON public.exercises(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_is_ongoing ON public.exercises(is_ongoing);
CREATE INDEX IF NOT EXISTS idx_exercises_user_ongoing ON public.exercises(user_id, is_ongoing) WHERE is_ongoing = true;  -- This is fine as it's a column comparison
CREATE INDEX IF NOT EXISTS idx_exercises_type_date ON public.exercises(user_id, exercise_type, created_at DESC);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for symptoms
CREATE POLICY "Users can view own symptoms" ON public.symptoms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms" ON public.symptoms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms" ON public.symptoms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptoms" ON public.symptoms
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for medications
CREATE POLICY "Users can view own medications" ON public.medications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications" ON public.medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications" ON public.medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications" ON public.medications
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for health_goals
CREATE POLICY "Users can view own health goals" ON public.health_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health goals" ON public.health_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health goals" ON public.health_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health goals" ON public.health_goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mood_entries
CREATE POLICY "Users can view own mood entries" ON public.mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON public.mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" ON public.mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries" ON public.mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meditation_sessions
CREATE POLICY "Users can view own meditation sessions" ON public.meditation_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meditation sessions" ON public.meditation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meditation sessions" ON public.meditation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meditation sessions" ON public.meditation_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for health_insights
CREATE POLICY "Users can view own health insights" ON public.health_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health insights" ON public.health_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health insights" ON public.health_insights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health insights" ON public.health_insights
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exercises
CREATE POLICY "Users can view their own exercises" ON public.exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" ON public.exercises
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" ON public.exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for profiles
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate health score
CREATE OR REPLACE FUNCTION public.calculate_health_score(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  symptom_score INTEGER DEFAULT 0;
  medication_score INTEGER DEFAULT 0;
  exercise_score INTEGER DEFAULT 0;
  mood_score INTEGER DEFAULT 0;
  total_score INTEGER DEFAULT 0;
BEGIN
  -- Symptom impact (negative score, max -30)
  SELECT COALESCE(-AVG(severity) * 3, 0)::INTEGER INTO symptom_score
  FROM public.symptoms 
  WHERE user_id = user_id_param 
    AND created_at > NOW() - INTERVAL '7 days';
  
  -- Medication compliance (positive score, max +20)
  SELECT COALESCE(COUNT(*) * 5, 0)::INTEGER INTO medication_score
  FROM public.medications 
  WHERE user_id = user_id_param 
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  LIMIT 4;
  
  -- Exercise bonus (positive score, max +25)
  SELECT COALESCE(COUNT(*) * 5, 0)::INTEGER INTO exercise_score
  FROM public.exercises 
  WHERE user_id = user_id_param 
    AND created_at > NOW() - INTERVAL '7 days'
    AND is_ongoing = false
  LIMIT 5;
  
  -- Mood impact (positive score, max +15)
  SELECT COALESCE((AVG(mood_value) - 3) * 5, 0)::INTEGER INTO mood_score
  FROM public.mood_entries 
  WHERE user_id = user_id_param 
    AND created_at > NOW() - INTERVAL '7 days';
  
  -- Calculate total (base 70 + bonuses - penalties)
  total_score := 70 + medication_score + exercise_score + mood_score + symptom_score;
  
  -- Ensure score is between 0 and 100
  RETURN GREATEST(0, LEAST(100, total_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for user dashboard stats
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT 
  p.id as user_id,
  p.full_name,
  -- Symptom stats
  (SELECT COUNT(*) FROM public.symptoms s WHERE s.user_id = p.id AND s.created_at > NOW() - INTERVAL '7 days') as symptoms_this_week,
  (SELECT AVG(severity)::DECIMAL(3,1) FROM public.symptoms s WHERE s.user_id = p.id AND s.created_at > NOW() - INTERVAL '7 days') as avg_symptom_severity,
  -- Medication stats
  (SELECT COUNT(*) FROM public.medications m WHERE m.user_id = p.id AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)) as active_medications,
  -- Exercise stats
  (SELECT COUNT(*) FROM public.exercises e WHERE e.user_id = p.id AND e.created_at > NOW() - INTERVAL '7 days' AND e.is_ongoing = false) as exercises_this_week,
  (SELECT SUM(calories_burned) FROM public.exercises e WHERE e.user_id = p.id AND e.created_at > NOW() - INTERVAL '7 days' AND e.is_ongoing = false) as calories_this_week,
  (SELECT COUNT(*) FROM public.exercises e WHERE e.user_id = p.id AND e.is_ongoing = true) as ongoing_exercises,
  -- Mood stats
  (SELECT AVG(mood_value)::DECIMAL(3,1) FROM public.mood_entries m WHERE m.user_id = p.id AND m.created_at > NOW() - INTERVAL '7 days') as avg_mood_this_week,
  -- Health score
  public.calculate_health_score(p.id) as health_score,
  -- Last activity
  GREATEST(
    COALESCE((SELECT MAX(created_at) FROM public.symptoms s WHERE s.user_id = p.id), '1970-01-01'::timestamptz),
    COALESCE((SELECT MAX(created_at) FROM public.exercises e WHERE e.user_id = p.id), '1970-01-01'::timestamptz),
    COALESCE((SELECT MAX(created_at) FROM public.mood_entries m WHERE m.user_id = p.id), '1970-01-01'::timestamptz)
  ) as last_activity
FROM public.profiles p;

-- Grant permissions for the view
GRANT SELECT ON public.user_dashboard_stats TO authenticated;

-- Add table comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth with health-specific data';
COMMENT ON TABLE public.symptoms IS 'User-reported symptoms with severity tracking';
COMMENT ON TABLE public.medications IS 'Medication tracking with dosage and scheduling';
COMMENT ON TABLE public.health_goals IS 'Daily health goals with progress tracking';
COMMENT ON TABLE public.mood_entries IS 'Mood tracking with scale and notes';
COMMENT ON TABLE public.meditation_sessions IS 'Meditation and mindfulness session tracking';
COMMENT ON TABLE public.health_insights IS 'AI-generated health insights and recommendations';
COMMENT ON TABLE public.exercises IS 'Exercise and workout tracking with ongoing session support';

-- Add column comments for exercises table
COMMENT ON COLUMN public.exercises.exercise_type IS 'Type of exercise (running, cycling, swimming, weightlifting, walking, etc.)';
COMMENT ON COLUMN public.exercises.duration_minutes IS 'Duration of exercise in minutes';
COMMENT ON COLUMN public.exercises.intensity_level IS 'Exercise intensity from 1 (light) to 5 (maximum)';
COMMENT ON COLUMN public.exercises.calories_burned IS 'Estimated calories burned during exercise';
COMMENT ON COLUMN public.exercises.is_ongoing IS 'True if exercise is currently in progress';
COMMENT ON COLUMN public.exercises.started_at IS 'When the exercise session started (for ongoing exercises)';
COMMENT ON COLUMN public.exercises.completed_at IS 'When the exercise session was completed';

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'HealTrack database schema created successfully!';
  RAISE NOTICE 'Tables created: profiles, symptoms, medications, health_goals, mood_entries, meditation_sessions, health_insights, exercises';
  RAISE NOTICE 'All RLS policies, indexes, and triggers are in place.';
  RAISE NOTICE 'Ready for HealTrack application!';
END $$;