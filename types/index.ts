import { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  dataRetention: number; // days
  exportFormat: 'json' | 'csv';
  theme: 'light' | 'dark' | 'auto';
}

export interface SymptomEntry {
  id: string;
  userId: string;
  symptom: string;
  severity: number; // 1-10 scale
  description?: string;
  triggers?: string[];
  tags?: string[];
  timestamp: Date;
  duration?: number; // in minutes
  bodyPart?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  reminders: boolean;
  reminderTimes: string[]; // ["08:00", "20:00"]
}

export interface HealthMetric {
  id: string;
  userId: string;
  type: 'weight' | 'blood_pressure' | 'heart_rate' | 'temperature' | 'mood' | 'sleep';
  value: number | string;
  unit: string;
  timestamp: Date;
  notes?: string;
}

export interface DashboardData {
  recentSymptoms: SymptomEntry[];
  upcomingMedications: Medication[];
  healthTrends: HealthMetric[];
  symptomFrequency: { [key: string]: number };
  painLevels: { date: string; level: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export interface InputProps extends BaseComponentProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}
