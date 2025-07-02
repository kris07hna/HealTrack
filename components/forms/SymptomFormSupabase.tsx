// Simple Symptom Form that connects to Supabase
import { useState, useEffect } from 'react';
import { symptomsHelpers } from '../../lib/supabase-helpers';
import { supabase } from '../../lib/database';

export default function SymptomFormSupabase() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 5,
    body_part: '',
    duration: '',
    triggers: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [symptoms, setSymptoms] = useState<any[]>([]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadSymptoms(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const loadSymptoms = async (userId: string) => {
    try {
      const result = await symptomsHelpers.getSymptoms(userId, 1, 10);
      setSymptoms(result.symptoms);
    } catch (error) {
      console.error('Failed to load symptoms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const symptomData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        body_part: formData.body_part || null,
        duration: formData.duration || null,
        triggers: formData.triggers || null,
        medications_taken: []
      };

      await symptomsHelpers.addSymptom(symptomData);
      
      // Reload symptoms
      await loadSymptoms(user.id);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        severity: 5,
        body_part: '',
        duration: '',
        triggers: ''
      });
      
      alert('Symptom saved successfully!');
    } catch (error) {
      console.error('Failed to save symptom:', error);
      alert('Failed to save symptom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'severity' ? parseInt(value) : value
    }));
  };

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">Please sign in to track symptoms.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Track New Symptom</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Symptom Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Headache, Nausea, Back pain"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe your symptom in detail..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity (1-10) *
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Body Part
            </label>
            <input
              type="text"
              name="body_part"
              value={formData.body_part}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Head, Back, Stomach"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., 2 hours, All day"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Triggers
            </label>
            <input
              type="text"
              name="triggers"
              value={formData.triggers}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Stress, Weather, Food"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white 
                   font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Save Symptom'}
        </button>
      </form>

      {/* Recent Symptoms */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Symptoms</h3>
        <div className="space-y-3">
          {symptoms.length > 0 ? (
            symptoms.map((symptom) => (
              <div key={symptom.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{symptom.title}</h4>
                    {symptom.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{symptom.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Severity: {symptom.severity}/10</span>
                      {symptom.body_part && <span>Body: {symptom.body_part}</span>}
                      {symptom.duration && <span>Duration: {symptom.duration}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(symptom.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No symptoms recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
