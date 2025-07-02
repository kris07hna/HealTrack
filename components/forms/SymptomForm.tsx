import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { symptomStorage } from '@/lib/storage';
import { useAuth } from '@/lib/auth';

interface SymptomFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

const COMMON_SYMPTOMS = [
  'Headache',
  'Back Pain',
  'Neck Pain',
  'Fatigue',
  'Nausea',
  'Dizziness',
  'Chest Pain',
  'Abdominal Pain',
  'Joint Pain',
  'Muscle Pain',
  'Anxiety',
  'Depression',
  'Insomnia',
  'Fever',
  'Cough',
];

const BODY_PARTS = [
  'Head',
  'Neck',
  'Chest',
  'Upper Back',
  'Lower Back',
  'Left Arm',
  'Right Arm',
  'Left Leg',
  'Right Leg',
  'Abdomen',
  'General',
];

export default function SymptomForm({ onClose, onSubmit }: SymptomFormProps) {
  const [formData, setFormData] = useState({
    symptom: '',
    severity: 5,
    description: '',
    bodyPart: '',
    duration: '',
    triggers: '',
    notes: '',
  });
  const [customSymptom, setCustomSymptom] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSymptomSelect = (symptom: string) => {
    setFormData({ ...formData, symptom });
    setCustomSymptom('');
  };

  const handleCustomSymptom = () => {
    if (customSymptom.trim()) {
      setFormData({ ...formData, symptom: customSymptom.trim() });
      setCustomSymptom('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symptom.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const symptomData = {
        userId: user?.id || 'anonymous',
        symptom: formData.symptom,
        severity: formData.severity,
        description: formData.description || undefined,
        bodyPart: formData.bodyPart || undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        triggers: formData.triggers ? formData.triggers.split(',').map(t => t.trim()) : undefined,
        notes: formData.notes || undefined,
      };

      symptomStorage.save(symptomData);
      onSubmit();
    } catch (error) {
      console.error('Failed to save symptom:', error);
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-xl font-semibold text-gray-900">Log New Symptom</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Symptom Selection */}
          <div>
            <label className="form-label">Symptom *</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => handleSymptomSelect(symptom)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    formData.symptom === symptom
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
            
            {/* Custom symptom input */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Or enter custom symptom..."
                className="form-input flex-1"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomSymptom())}
              />
              <button
                type="button"
                onClick={handleCustomSymptom}
                disabled={!customSymptom.trim()}
                className="btn btn-secondary disabled:opacity-50"
              >
                <FaPlus className="h-4 w-4" />
              </button>
            </div>
            
            {formData.symptom && (
              <p className="mt-2 text-sm text-green-600">
                Selected: <strong>{formData.symptom}</strong>
              </p>
            )}
          </div>

          {/* Severity Scale */}
          <div>
            <label className="form-label">Severity (1-10) *</label>
            <div className="mt-2">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild (1)</span>
                <span className="font-medium text-lg text-blue-600">{formData.severity}</span>
                <span>Severe (10)</span>
              </div>
            </div>
          </div>

          {/* Body Part */}
          <div>
            <label className="form-label">Body Part</label>
            <select
              value={formData.bodyPart}
              onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
              className="form-input"
            >
              <option value="">Select body part (optional)</option>
              {BODY_PARTS.map((part) => (
                <option key={part} value={part.toLowerCase()}>
                  {part}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="form-label">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              placeholder="How long did it last?"
              className="form-input"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="Describe the symptom in more detail..."
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Triggers */}
          <div>
            <label className="form-label">Possible Triggers</label>
            <input
              type="text"
              placeholder="e.g., stress, weather, food (separate by commas)"
              className="form-input"
              value={formData.triggers}
              onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Additional Notes</label>
            <textarea
              rows={2}
              placeholder="Any other relevant information..."
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
              disabled={!formData.symptom.trim() || isLoading}
              className="btn btn-primary disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Log Symptom'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
