// Supabase configuration for HealTrack
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client (for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          height_cm: number | null
          weight_kg: number | null
          blood_type: string | null
          activity_level: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_conditions: string[] | null
          allergies: string[] | null
          current_medications: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          blood_type?: string | null
          activity_level?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_conditions?: string[] | null
          allergies?: string[] | null
          current_medications?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          blood_type?: string | null
          activity_level?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_conditions?: string[] | null
          allergies?: string[] | null
          current_medications?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      symptoms: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          severity: number
          body_part: string | null
          duration: string | null
          triggers: string | null
          medications_taken: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          severity: number
          body_part?: string | null
          duration?: string | null
          triggers?: string | null
          medications_taken?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          severity?: number
          body_part?: string | null
          duration?: string | null
          triggers?: string | null
          medications_taken?: string[] | null
          created_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: string | null
          frequency: string | null
          start_date: string | null
          end_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage?: string | null
          frequency?: string | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string | null
          frequency?: string | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      health_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          goal_description: string | null
          target_value: number
          current_value: number
          unit: string | null
          date: string
          achieved: boolean
          streak: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: string
          goal_description?: string | null
          target_value: number
          current_value?: number
          unit?: string | null
          date?: string
          achieved?: boolean
          streak?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: string
          goal_description?: string | null
          target_value?: number
          current_value?: number
          unit?: string | null
          date?: string
          achieved?: boolean
          streak?: number
          created_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood_value: number
          mood_description: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_value: number
          mood_description?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood_value?: number
          mood_description?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      meditation_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: string
          duration: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type: string
          duration: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: string
          duration?: number
          completed?: boolean
          created_at?: string
        }
      }
      health_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: string
          title: string
          description: string
          priority: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: string
          title: string
          description: string
          priority?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: string
          title?: string
          description?: string
          priority?: string
          is_read?: boolean
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          exercise_type: string
          duration_minutes: number
          intensity_level: number
          calories_burned: number
          notes: string | null
          is_ongoing: boolean
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_type: string
          duration_minutes: number
          intensity_level: number
          calories_burned: number
          notes?: string | null
          is_ongoing?: boolean
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_type?: string
          duration_minutes?: number
          intensity_level?: number
          calories_burned?: number
          notes?: string | null
          is_ongoing?: boolean
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Environment variables required
export const requiredEnvVars = {
  // For PostgreSQL
  DATABASE_URL: 'postgresql://username:password@host:port/database',
  
  // For MongoDB
  MONGODB_URI: 'mongodb+srv://username:password@cluster.mongodb.net/database',
  
  // For Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'your-service-role-key',
  
  // Authentication
  NEXTAUTH_SECRET: 'your-secret-key',
  NEXTAUTH_URL: 'https://your-domain.com',
  
  // Optional: For email notifications
  EMAIL_FROM: 'noreply@yourdomain.com',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'your-email@gmail.com',
  SMTP_PASSWORD: 'your-app-password'
};
