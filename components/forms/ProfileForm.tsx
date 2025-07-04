import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaUser, 
  FaCamera, 
  FaSave, 
  FaEdit,
  FaBirthdayCake,
  FaPhone,
  FaMapMarkerAlt,
  FaWeight,
  FaRuler,
  FaAllergies,
  FaMedkit,
  FaEnvelope,
  FaUserMd
} from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { updateProfile } from '@/lib/supabase-helpers';

interface ProfileFormProps {
  onClose: () => void;
  onSubmit?: () => void;
  profile?: any;
}

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  height_cm: number | null;
  weight_kg: number | null;
  blood_type: string;
  allergies: string;
  emergency_contact: string;
  medical_conditions: string;
}

export default function ProfileForm({ onClose, onSubmit, profile: initialProfile }: ProfileFormProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [profile, setProfile] = useState<UserProfile>({
    full_name: initialProfile?.full_name || user?.name || '',
    email: initialProfile?.email || user?.email || '',
    phone: initialProfile?.phone || '',
    date_of_birth: initialProfile?.date_of_birth || '',
    address: initialProfile?.address || '',
    height_cm: initialProfile?.height_cm || null,
    weight_kg: initialProfile?.weight_kg || null,
    blood_type: initialProfile?.blood_type || '',
    allergies: Array.isArray(initialProfile?.allergies) ? initialProfile.allergies.join(', ') : (initialProfile?.allergies || ''),
    emergency_contact: initialProfile?.emergency_contact_name || initialProfile?.emergency_contact || '',
    medical_conditions: Array.isArray(initialProfile?.medical_conditions) ? initialProfile.medical_conditions.join(', ') : (initialProfile?.medical_conditions || ''),
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof UserProfile, value: string | number | null) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving profile data:', profile);
      
      // Convert string fields to arrays for database and map to correct schema
      const databaseProfile = {
        id: user.id, // The primary key for profiles table
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth || null,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        blood_type: profile.blood_type || null,
        medical_conditions: profile.medical_conditions ? profile.medical_conditions.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
        allergies: profile.allergies ? profile.allergies.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
        emergency_contact_name: profile.emergency_contact || null,
        emergency_contact_phone: null, // You might want to add a separate field for this
        current_medications: [], // Add if needed
        activity_level: null // Add if needed
      };
      
      console.log('Database profile:', databaseProfile);
      
      const result = await updateProfile(databaseProfile);
      console.log('Profile update result:', result);
      
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated!'
      });
      
      onSubmit?.();
      onClose(); // Close the form after successful save
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      // Don't close the form on error so user can retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <FaUser className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">My Profile</h2>
                  <p className="text-gray-400">Manage your personal health information</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  <FaSave className="inline mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-3 text-gray-400 hover:text-white rounded-2xl hover:bg-white/10 transition-all"
                >
                  <FaTimes className="h-6 w-6" />
                </motion.button>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <FaUser className="text-white text-4xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">{profile.full_name}</h3>
              <p className="text-gray-400">{profile.email}</p>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-black/20 backdrop-blur-md border border-gray-800/50 p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                  <FaUser className="mr-2 text-cyan-400" />
                  Personal Information
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                      <FaUser className="mr-2 text-cyan-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                      <FaEnvelope className="mr-2 text-cyan-400" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                      <FaBirthdayCake className="mr-2 text-pink-400" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                      <FaPhone className="mr-2 text-green-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-red-400" />
                      Address
                    </label>
                    <textarea
                      value={profile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div className="bg-black/20 backdrop-blur-md border border-gray-800/50 p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                  <FaMedkit className="mr-2 text-red-400" />
                  Health Information
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                        <FaRuler className="mr-1 text-blue-400" />
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={profile.height_cm || ''}
                        onChange={(e) => handleInputChange('height_cm', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                        <FaWeight className="mr-1 text-purple-400" />
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={profile.weight_kg || ''}
                        onChange={(e) => handleInputChange('weight_kg', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2">
                      Blood Type
                    </label>
                    <select
                      value={profile.blood_type}
                      onChange={(e) => handleInputChange('blood_type', e.target.value)}
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                      <FaAllergies className="mr-2 text-yellow-400" />
                      Allergies
                    </label>
                    <textarea
                      value={profile.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      rows={2}
                      placeholder="List any known allergies..."
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={profile.emergency_contact}
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                      placeholder="Name and phone number"
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                      <FaUserMd className="mr-2 text-indigo-400" />
                      Medical Conditions
                    </label>
                    <textarea
                      value={profile.medical_conditions}
                      onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                      rows={2}
                      placeholder="List any medical conditions..."
                      className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
