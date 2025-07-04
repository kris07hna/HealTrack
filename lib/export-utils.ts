import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from './database';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'excel';
  includeProfile?: boolean;
  includeSymptoms?: boolean;
  includeMedications?: boolean;
  includeExercises?: boolean;
  includeMoodEntries?: boolean;
  includeHealthGoals?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface UserHealthData {
  profile?: any;
  symptoms?: any[];
  medications?: any[];
  exercises?: any[];
  moodEntries?: any[];
  meditations?: any[];
  healthGoals?: any[];
  healthInsights?: any[];
  exportDate: string;
  exportedBy: string;
}

class HealthDataExporter {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async fetchUserData(options: ExportOptions): Promise<UserHealthData> {
    const data: UserHealthData = {
      exportDate: new Date().toISOString(),
      exportedBy: this.userId
    };

    try {
      // Fetch profile data
      if (options.includeProfile) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', this.userId)
          .single();
        
        if (!error) {
          data.profile = profile;
        }
      }

      // Fetch symptoms data
      if (options.includeSymptoms) {
        let query = supabase
          .from('symptoms')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false });

        if (options.dateRange) {
          query = query
            .gte('created_at', options.dateRange.start.toISOString())
            .lte('created_at', options.dateRange.end.toISOString());
        }

        const { data: symptoms, error } = await query;
        if (!error) {
          data.symptoms = symptoms;
        }
      }

      // Fetch medications data
      if (options.includeMedications) {
        const { data: medications, error } = await supabase
          .from('medications')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false });
        
        if (!error) {
          data.medications = medications;
        }
      }

      // Fetch exercises data
      if (options.includeExercises) {
        let query = supabase
          .from('exercises')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false });

        if (options.dateRange) {
          query = query
            .gte('created_at', options.dateRange.start.toISOString())
            .lte('created_at', options.dateRange.end.toISOString());
        }

        const { data: exercises, error } = await query;
        if (!error) {
          data.exercises = exercises;
        }
      }

      // Fetch mood entries data
      if (options.includeMoodEntries) {
        let query = supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false });

        if (options.dateRange) {
          query = query
            .gte('created_at', options.dateRange.start.toISOString())
            .lte('created_at', options.dateRange.end.toISOString());
        }

        const { data: moodEntries, error } = await query;
        if (!error) {
          data.moodEntries = moodEntries;
        }
      }

      // Fetch health goals data
      if (options.includeHealthGoals) {
        const { data: healthGoals, error } = await supabase
          .from('health_goals')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false });
        
        if (!error) {
          data.healthGoals = healthGoals;
        }
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Failed to fetch user data for export');
    }

    return data;
  }

  async exportAsJSON(options: ExportOptions): Promise<void> {
    try {
      const data = await this.fetchUserData(options);
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healtrack-complete-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      throw error;
    }
  }

  async exportAsCSV(options: ExportOptions): Promise<void> {
    try {
      const data = await this.fetchUserData(options);
      
      let csvContent = '';
      
      // Export symptoms as CSV
      if (data.symptoms && data.symptoms.length > 0) {
        csvContent += 'SYMPTOMS DATA\n';
        csvContent += 'Date,Title,Description,Severity,Body Part,Duration,Triggers,Medications Taken\n';
        
        data.symptoms.forEach(symptom => {
          csvContent += [
            new Date(symptom.created_at).toLocaleDateString(),
            `"${symptom.title || ''}"`,
            `"${symptom.description || ''}"`,
            symptom.severity,
            `"${symptom.body_part || ''}"`,
            `"${symptom.duration || ''}"`,
            `"${symptom.triggers || ''}"`,
            `"${symptom.medications_taken ? symptom.medications_taken.join(', ') : ''}"`
          ].join(',') + '\n';
        });
        csvContent += '\n\n';
      }

      // Export exercises as CSV
      if (data.exercises && data.exercises.length > 0) {
        csvContent += 'EXERCISES DATA\n';
        csvContent += 'Date,Exercise Type,Duration (min),Intensity Level,Calories Burned,Notes,Status\n';
        
        data.exercises.forEach(exercise => {
          csvContent += [
            new Date(exercise.created_at).toLocaleDateString(),
            exercise.exercise_type.replace('_', ' '),
            exercise.duration_minutes,
            exercise.intensity_level,
            exercise.calories_burned,
            `"${exercise.notes || ''}"`,
            exercise.is_ongoing ? 'Ongoing' : 'Completed'
          ].join(',') + '\n';
        });
        csvContent += '\n\n';
      }

      // Export medications as CSV
      if (data.medications && data.medications.length > 0) {
        csvContent += 'MEDICATIONS DATA\n';
        csvContent += 'Name,Dosage,Frequency,Start Date,End Date,Notes\n';
        
        data.medications.forEach(medication => {
          csvContent += [
            `"${medication.name}"`,
            `"${medication.dosage || ''}"`,
            `"${medication.frequency || ''}"`,
            medication.start_date || '',
            medication.end_date || '',
            `"${medication.notes || ''}"`
          ].join(',') + '\n';
        });
        csvContent += '\n\n';
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healtrack-complete-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }

  async exportAsPDF(options: ExportOptions): Promise<void> {
    try {
      const data = await this.fetchUserData(options);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;

      // Helper function to add new page if needed
      const checkPageSpace = (neededSpace: number) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HealTrack - Complete Health Report', margin, yPosition);
      yPosition += 15;

      // User info
      if (data.profile) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Personal Information', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        if (data.profile.full_name) {
          pdf.text(`Name: ${data.profile.full_name}`, margin, yPosition);
          yPosition += lineHeight;
        }
        
        if (data.profile.email) {
          pdf.text(`Email: ${data.profile.email}`, margin, yPosition);
          yPosition += lineHeight;
        }
        
        if (data.profile.date_of_birth) {
          pdf.text(`Date of Birth: ${new Date(data.profile.date_of_birth).toLocaleDateString()}`, margin, yPosition);
          yPosition += lineHeight;
        }
        
        if (data.profile.blood_type) {
          pdf.text(`Blood Type: ${data.profile.blood_type}`, margin, yPosition);
          yPosition += lineHeight;
        }
        
        if (data.profile.height_cm && data.profile.weight_kg) {
          pdf.text(`Height: ${data.profile.height_cm} cm, Weight: ${data.profile.weight_kg} kg`, margin, yPosition);
          yPosition += lineHeight;
        }

        yPosition += 10;
      }

      // Export date
      pdf.setFontSize(10);
      pdf.text(`Report Generated: ${new Date(data.exportDate).toLocaleString()}`, margin, yPosition);
      yPosition += 15;

      // Symptoms section
      if (data.symptoms && data.symptoms.length > 0) {
        checkPageSpace(30);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Symptoms History', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        data.symptoms.slice(0, 20).forEach((symptom, index) => {
          checkPageSpace(25);
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${symptom.title}`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`   Date: ${new Date(symptom.created_at).toLocaleDateString()}`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.text(`   Severity: ${symptom.severity}/10`, margin, yPosition);
          yPosition += lineHeight;
          
          if (symptom.description) {
            const description = symptom.description.substring(0, 80) + (symptom.description.length > 80 ? '...' : '');
            pdf.text(`   Description: ${description}`, margin, yPosition);
            yPosition += lineHeight;
          }
          
          yPosition += 3;
        });
        
        yPosition += 10;
      }

      // Exercises section
      if (data.exercises && data.exercises.length > 0) {
        checkPageSpace(30);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Exercise History', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        data.exercises.slice(0, 15).forEach((exercise, index) => {
          checkPageSpace(20);
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${exercise.exercise_type.replace('_', ' ').toUpperCase()}`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`   Date: ${new Date(exercise.created_at).toLocaleDateString()}`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.text(`   Duration: ${exercise.duration_minutes} min, Intensity: ${exercise.intensity_level}/5`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.text(`   Calories: ${exercise.calories_burned}`, margin, yPosition);
          yPosition += lineHeight;
          
          yPosition += 3;
        });
        
        yPosition += 10;
      }

      // Medications section
      if (data.medications && data.medications.length > 0) {
        checkPageSpace(30);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Current Medications', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        data.medications.forEach((medication, index) => {
          checkPageSpace(15);
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${medication.name}`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          if (medication.dosage) {
            pdf.text(`   Dosage: ${medication.dosage}`, margin, yPosition);
            yPosition += lineHeight;
          }
          
          if (medication.frequency) {
            pdf.text(`   Frequency: ${medication.frequency}`, margin, yPosition);
            yPosition += lineHeight;
          }
          
          yPosition += 3;
        });
      }

      // Save the PDF
      pdf.save(`healtrack-health-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }

  async exportAsExcel(options: ExportOptions): Promise<void> {
    // For Excel export, we'll create a CSV with multiple sheets represented as sections
    try {
      const data = await this.fetchUserData(options);
      
      let excelContent = '';
      
      // Add profile sheet
      if (data.profile) {
        excelContent += 'PROFILE INFORMATION\n';
        excelContent += 'Field,Value\n';
        Object.entries(data.profile).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            excelContent += `"${key}","${value}"\n`;
          }
        });
        excelContent += '\n\n';
      }

      // Add symptoms sheet
      if (data.symptoms && data.symptoms.length > 0) {
        excelContent += 'SYMPTOMS\n';
        excelContent += 'Date,Title,Description,Severity,Body Part,Duration,Triggers\n';
        data.symptoms.forEach(symptom => {
          excelContent += [
            new Date(symptom.created_at).toLocaleDateString(),
            `"${symptom.title || ''}"`,
            `"${symptom.description || ''}"`,
            symptom.severity,
            `"${symptom.body_part || ''}"`,
            `"${symptom.duration || ''}"`,
            `"${symptom.triggers || ''}"`
          ].join(',') + '\n';
        });
        excelContent += '\n\n';
      }

      // Add other sections...
      const blob = new Blob([excelContent], { 
        type: 'application/vnd.ms-excel' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healtrack-complete-export-${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  }
}

// Export functions
export const createHealthDataExporter = (userId: string) => {
  return new HealthDataExporter(userId);
};

// Quick export functions
export const quickExportHealthData = async (
  userId: string, 
  format: 'json' | 'csv' | 'pdf' | 'excel' = 'pdf',
  includeAllData: boolean = true
) => {
  const exporter = createHealthDataExporter(userId);
  
  const options: ExportOptions = {
    format,
    includeProfile: includeAllData,
    includeSymptoms: includeAllData,
    includeMedications: includeAllData,
    includeExercises: includeAllData,
    includeMoodEntries: includeAllData,
    includeHealthGoals: includeAllData,
  };

  switch (format) {
    case 'json':
      return await exporter.exportAsJSON(options);
    case 'csv':
      return await exporter.exportAsCSV(options);
    case 'pdf':
      return await exporter.exportAsPDF(options);
    case 'excel':
      return await exporter.exportAsExcel(options);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};
