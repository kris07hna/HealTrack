import { motion, AnimatePresence } from 'framer-motion';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { useTheme } from '@/lib/theme';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const themeOptions = [
    { key: 'light', label: 'Light', icon: FaSun, color: 'text-yellow-500' },
    { key: 'dark', label: 'Dark', icon: FaMoon, color: 'text-blue-400' },
    { key: 'system', label: 'System', icon: FaDesktop, color: 'text-gray-500' },
  ];

  const currentTheme = themeOptions.find(t => t.key === theme) || themeOptions[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
        className="relative p-3 glass-card bg-white/40 hover:bg-white/60 dark:bg-gray-800/40 dark:hover:bg-gray-800/60 border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-sm transition-all group"
      >
        <motion.div
          initial={false}
          animate={{ 
            rotate: resolvedTheme === 'dark' ? 180 : 0,
            scale: resolvedTheme === 'dark' ? 1.1 : 1
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative"
        >
          <CurrentIcon className={`h-5 w-5 ${currentTheme.color} dark:text-blue-300`} />
          
          {/* Animated glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: resolvedTheme === 'dark' 
                ? '0 0 20px rgba(59, 130, 246, 0.4)' 
                : '0 0 20px rgba(251, 191, 36, 0.4)'
            }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        {/* Theme indicator dots */}
        <div className="absolute -bottom-1 -right-1 flex space-x-1">
          <motion.div 
            className={`w-2 h-2 rounded-full transition-colors ${
              theme === 'light' ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            animate={{ scale: theme === 'light' ? 1.2 : 1 }}
          />
          <motion.div 
            className={`w-2 h-2 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            animate={{ scale: theme === 'dark' ? 1.2 : 1 }}
          />
          <motion.div 
            className={`w-2 h-2 rounded-full transition-colors ${
              theme === 'system' ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            animate={{ scale: theme === 'system' ? 1.2 : 1 }}
          />
        </div>
      </motion.button>
      
      {/* Enhanced Tooltip/Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-2 min-w-[140px] z-50"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            {themeOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <motion.button
                  key={option.key}
                  whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                  onClick={() => setTheme(option.key as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    theme === option.key
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <OptionIcon className={`h-4 w-4 ${option.color} ${
                    theme === option.key ? 'text-indigo-600 dark:text-indigo-400' : ''
                  }`} />
                  <span>{option.label}</span>
                  {option.key === 'system' && (
                    <span className="ml-auto text-xs text-gray-500">
                      ({resolvedTheme})
                    </span>
                  )}
                </motion.button>
              );
            })}
            
            {/* Arrow pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-px">
              <div className="w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
