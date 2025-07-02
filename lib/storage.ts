import { v4 as uuidv4 } from 'uuid';
import { SymptomEntry, Medication, HealthMetric, DashboardData } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  SYMPTOMS: 'healtrack_symptoms',
  MEDICATIONS: 'healtrack_medications',
  HEALTH_METRICS: 'healtrack_health_metrics',
} as const;

// Symptom operations
export const symptomStorage = {
  getAll: (): SymptomEntry[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYMPTOMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save: (symptom: Omit<SymptomEntry, 'id' | 'timestamp'>): SymptomEntry => {
    const newSymptom: SymptomEntry = {
      ...symptom,
      id: uuidv4(),
      timestamp: new Date(),
    };
    
    const symptoms = symptomStorage.getAll();
    symptoms.unshift(newSymptom);
    
    try {
      localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(symptoms));
    } catch (error) {
      console.error('Failed to save symptom:', error);
    }
    
    return newSymptom;
  },

  update: (id: string, updates: Partial<SymptomEntry>): boolean => {
    try {
      const symptoms = symptomStorage.getAll();
      const index = symptoms.findIndex(s => s.id === id);
      
      if (index === -1) return false;
      
      symptoms[index] = { ...symptoms[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(symptoms));
      return true;
    } catch {
      return false;
    }
  },

  delete: (id: string): boolean => {
    try {
      const symptoms = symptomStorage.getAll();
      const filtered = symptoms.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },
};

// Medication operations
export const medicationStorage = {
  getAll: (): Medication[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save: (medication: Omit<Medication, 'id'>): Medication => {
    const newMedication: Medication = {
      ...medication,
      id: uuidv4(),
    };
    
    const medications = medicationStorage.getAll();
    medications.push(newMedication);
    
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
    } catch (error) {
      console.error('Failed to save medication:', error);
    }
    
    return newMedication;
  },

  update: (id: string, updates: Partial<Medication>): boolean => {
    try {
      const medications = medicationStorage.getAll();
      const index = medications.findIndex(m => m.id === id);
      
      if (index === -1) return false;
      
      medications[index] = { ...medications[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
      return true;
    } catch {
      return false;
    }
  },

  delete: (id: string): boolean => {
    try {
      const medications = medicationStorage.getAll();
      const filtered = medications.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },
};

// Health metrics operations
export const healthMetricStorage = {
  getAll: (): HealthMetric[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HEALTH_METRICS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save: (metric: Omit<HealthMetric, 'id' | 'timestamp'>): HealthMetric => {
    const newMetric: HealthMetric = {
      ...metric,
      id: uuidv4(),
      timestamp: new Date(),
    };
    
    const metrics = healthMetricStorage.getAll();
    metrics.unshift(newMetric);
    
    try {
      localStorage.setItem(STORAGE_KEYS.HEALTH_METRICS, JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to save health metric:', error);
    }
    
    return newMetric;
  },

  update: (id: string, updates: Partial<HealthMetric>): boolean => {
    try {
      const metrics = healthMetricStorage.getAll();
      const index = metrics.findIndex(m => m.id === id);
      
      if (index === -1) return false;
      
      metrics[index] = { ...metrics[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.HEALTH_METRICS, JSON.stringify(metrics));
      return true;
    } catch {
      return false;
    }
  },

  delete: (id: string): boolean => {
    try {
      const metrics = healthMetricStorage.getAll();
      const filtered = metrics.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.HEALTH_METRICS, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },
};

// Dashboard data aggregation
export const getDashboardData = (): DashboardData => {
  const symptoms = symptomStorage.getAll();
  const medications = medicationStorage.getAll();
  const healthMetrics = healthMetricStorage.getAll();

  // Get recent symptoms (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSymptoms = symptoms
    .filter(s => new Date(s.timestamp) >= sevenDaysAgo)
    .slice(0, 10);

  // Get upcoming medications (active ones)
  const now = new Date();
  const upcomingMedications = medications.filter(m => {
    const endDate = m.endDate ? new Date(m.endDate) : null;
    return !endDate || endDate >= now;
  });

  // Calculate symptom frequency
  const symptomFrequency: { [key: string]: number } = {};
  symptoms.forEach(symptom => {
    symptomFrequency[symptom.symptom] = (symptomFrequency[symptom.symptom] || 0) + 1;
  });

  // Calculate pain levels over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const painLevels = symptoms
    .filter(s => new Date(s.timestamp) >= thirtyDaysAgo)
    .map(s => ({
      date: new Date(s.timestamp).toLocaleDateString(),
      level: s.severity,
    }))
    .reverse();

  return {
    recentSymptoms,
    upcomingMedications,
    healthTrends: healthMetrics.slice(0, 10),
    symptomFrequency,
    painLevels,
  };
};

// Export data functions
export const exportData = {
  json: () => {
    const data = {
      symptoms: symptomStorage.getAll(),
      medications: medicationStorage.getAll(),
      healthMetrics: healthMetricStorage.getAll(),
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healtrack-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  csv: () => {
    const symptoms = symptomStorage.getAll();
    
    if (symptoms.length === 0) {
      alert('No symptom data to export');
      return;
    }

    const headers = ['Date', 'Symptom', 'Severity', 'Description', 'Body Part', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...symptoms.map(s => [
        new Date(s.timestamp).toLocaleDateString(),
        s.symptom,
        s.severity,
        `"${s.description || ''}"`,
        s.bodyPart || '',
        `"${s.notes || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healtrack-symptoms-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// Sample data for demo
export const createSampleData = () => {
  const sampleSymptoms = [
    {
      userId: 'demo-user',
      symptom: 'Headache',
      severity: 6,
      description: 'Tension headache after long work session',
      bodyPart: 'head',
      notes: 'Started around 2 PM, lasted 3 hours',
    },
    {
      userId: 'demo-user',
      symptom: 'Back Pain',
      severity: 4,
      description: 'Lower back stiffness',
      bodyPart: 'lower back',
      notes: 'Improved with stretching',
    },
    {
      userId: 'demo-user',
      symptom: 'Fatigue',
      severity: 7,
      description: 'General tiredness and lack of energy',
      bodyPart: 'general',
      notes: 'Poor sleep quality last night',
    },
  ];

  const sampleMedications = [
    {
      userId: 'demo-user',
      name: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'As needed',
      startDate: new Date(),
      notes: 'For headaches and pain relief',
      reminders: false,
      reminderTimes: [],
    },
  ];

  // Only create sample data if storage is empty
  if (symptomStorage.getAll().length === 0) {
    sampleSymptoms.forEach(symptom => symptomStorage.save(symptom));
  }
  
  if (medicationStorage.getAll().length === 0) {
    sampleMedications.forEach(medication => medicationStorage.save(medication));
  }
};
