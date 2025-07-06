import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeartbeat, FaEye, FaEyeSlash, FaTimes, FaLock, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';

interface LoginFormProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onClose, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showResendButton, setShowResendButton] = useState(false);
  const { login, isLoading, resendConfirmation } = useAuth();
  const { addNotification } = useNotifications();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login({ email, password });
    
    if (result.success) {
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have been successfully logged in.',
      });
      setShowResendButton(false);
      onClose();
    } else if (result.needsConfirmation) {
      addNotification({
        type: 'email',
        title: 'Please Confirm Your Email 📧',
        message: result.error || 'Please check your email and click the confirmation link before signing in.',
        duration: 8000, // Show longer for important message
      });
      setErrors({ general: result.error || 'Please confirm your email before signing in.' });
      setShowResendButton(true); // Show resend button
    } else {
      addNotification({
        type: 'error',
        title: 'Sign In Failed',
        message: result.error || 'Invalid email or password. Please try again.',
      });
      setErrors({ general: result.error || 'Invalid email or password. Please try again.' });
      setShowResendButton(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      addNotification({
        type: 'error',
        title: 'Email Required',
        message: 'Please enter your email address first.',
      });
      return;
    }

    const result = await resendConfirmation(email);
    
    if (result.success) {
      addNotification({
        type: 'success',
        title: 'Confirmation Email Sent! 📧',
        message: `We've sent a new confirmation link to ${email}. Please check your email and click the link.`,
        duration: 8000,
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Failed to Send Email',
        message: result.error || 'Failed to resend confirmation email. Please try again.',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black backdrop-blur-sm flex items-center justify-center p-2 z-50">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black">
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"
          animate={{
            background: [
              "linear-gradient(45deg, #111827, #000000, #111827)",
              "linear-gradient(90deg, #1f2937, #111827, #1f2937)",
              "linear-gradient(135deg, #111827, #000000, #111827)",
              "linear-gradient(180deg, #1f2937, #111827, #1f2937)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Floating Orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Login Form */}
      <motion.div
        className="relative w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="relative p-4 pb-2">
          {/* Back Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaArrowLeft className="w-4 h-4" />
          </motion.button>

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaHeartbeat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">HealTrack</h1>
                <p className="text-xs text-gray-400">Welcome back</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Message */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {errors.general}
                </div>
                
                {/* Resend Confirmation Button */}
                {showResendButton && (
                  <motion.button
                    type="button"
                    onClick={handleResendConfirmation}
                    className="w-full py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-400 font-medium rounded-lg transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📧 Resend Confirmation Email
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FaEnvelope className="inline w-3 h-3 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FaLock className="inline w-3 h-3 mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>

          {/* Register Link */}
          <motion.div
            className="text-center pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Create your free account
              </button>
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
