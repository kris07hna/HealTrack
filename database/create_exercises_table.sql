-- Create exercises table for HealTrack
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    intensity_level INTEGER NOT NULL CHECK (intensity_level >= 1 AND intensity_level <= 5),
    calories_burned INTEGER NOT NULL DEFAULT 0 CHECK (calories_burned >= 0),
    notes TEXT,
    is_ongoing BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for exercises table
CREATE POLICY "Users can view their own exercises" ON public.exercises
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises" ON public.exercises
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" ON public.exercises
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" ON public.exercises
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_created_at ON public.exercises(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_is_ongoing ON public.exercises(is_ongoing);
CREATE INDEX IF NOT EXISTS idx_exercises_user_ongoing ON public.exercises(user_id, is_ongoing) WHERE is_ongoing = true;

-- Add comments for documentation
COMMENT ON TABLE public.exercises IS 'Store user exercise sessions and workout data';
COMMENT ON COLUMN public.exercises.exercise_type IS 'Type of exercise (running, cycling, swimming, weightlifting, walking)';
COMMENT ON COLUMN public.exercises.duration_minutes IS 'Duration of exercise in minutes';
COMMENT ON COLUMN public.exercises.intensity_level IS 'Exercise intensity from 1 (light) to 5 (maximum)';
COMMENT ON COLUMN public.exercises.calories_burned IS 'Estimated calories burned during exercise';
COMMENT ON COLUMN public.exercises.is_ongoing IS 'True if exercise is currently in progress';
COMMENT ON COLUMN public.exercises.started_at IS 'When the exercise session started (for ongoing exercises)';
COMMENT ON COLUMN public.exercises.completed_at IS 'When the exercise session was completed';
