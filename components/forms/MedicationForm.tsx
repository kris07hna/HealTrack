import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaClock } from 'react-icons/fa';
import { medicationsHelpers } from '@/lib/supabase-helpers';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';

interface MedicationFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'Weekly',
  'Monthly',
];

export default function MedicationForm({ onClose, onSubmit }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    reminders: false,
    reminderTimes: ['08:00'],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.dosage.trim() || !formData.frequency) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
      });
      return;
    }

    if (!user?.id) {
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'User not authenticated. Please sign in again.',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Saving medication to Supabase...');
      
      const medicationData = {
        user_id: user.id,
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        notes: formData.notes || null,
      };

      const savedMedication = await medicationsHelpers.addMedication(medicationData);
      
      console.log('✅ Medication saved successfully:', savedMedication);
      
      addNotification({
        type: 'success',
        title: 'Medication Added',
        message: `${formData.name} has been successfully added to your medication list.`,
      });
      
      onSubmit();
    } catch (error) {
      console.error('❌ Failed to save medication:', error);
      
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save medication. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addReminderTime = () => {
    setFormData({
      ...formData,
      reminderTimes: [...formData.reminderTimes, '08:00'],
    });
  };

  const updateReminderTime = (index: number, time: string) => {
    const newTimes = [...formData.reminderTimes];
    newTimes[index] = time;
    setFormData({ ...formData, reminderTimes: newTimes });
  };

  const removeReminderTime = (index: number) => {
    setFormData({
      ...formData,
      reminderTimes: formData.reminderTimes.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Medication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Medication Name */}
          <div>
            <label className="form-label">Medication Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Ibuprofen, Aspirin, Lisinopril"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Dosage */}
          <div>
            <label className="form-label">Dosage *</label>
            <input
              type="text"
              required
              placeholder="e.g., 200mg, 1 tablet, 5ml"
              className="form-input"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="form-label">Frequency *</label>
            <select
              required
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="form-input"
            >
              <option value="">Select frequency</option>
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">End Date (Optional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Reminders */}
          <div>
            <div className="flex items-center">
              <input
                id="reminders"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.reminders}
                onChange={(e) => setFormData({ ...formData, reminders: e.target.checked })}
              />
              <label htmlFor="reminders" className="ml-2 block text-sm text-gray-900">
                Enable reminders
              </label>
            </div>

            {formData.reminders && (
              <div className="mt-4 space-y-2">
                <label className="form-label">Reminder Times</label>
                {formData.reminderTimes.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FaClock className="text-gray-400" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateReminderTime(index, e.target.value)}
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeReminderTime(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={formData.reminderTimes.length === 1}
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReminderTime}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add another reminder time
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Notes</label>
            <textarea
              rows={3}
              placeholder="Additional information about this medication..."
              className="form-input"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || !formData.dosage.trim() || !formData.frequency || isLoading}
              className="btn btn-primary disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Add Medication'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
