import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaUserMd, FaChartLine, FaMobile, FaPills, FaRocket, FaShieldAlt, FaStar } from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import LoginForm from '@/components/forms/LoginForm';
import RegisterForm from '@/components/forms/RegisterForm';
import LottieAnimation from '@/components/animations/LottieAnimation';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    console.log('Index page - Auth state:', { isAuthenticated, isLoading, user: isAuthenticated });
    if (isAuthenticated && !isLoading) {
      console.log('Redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (showLogin) {
    return (
      <LoginForm 
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
    );
  }

  if (showRegister) {
    return (
      <RegisterForm 
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    );
  }

  return <LandingPage onLogin={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} />;
}

function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center relative z-10"
      >
        {/* Logo container with Lottie animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8 relative"
        >
          <div className="w-40 h-40 mx-auto relative">
            {/* Lottie Animation as background */}
            <div className="absolute inset-0 w-full h-full">
              <LottieAnimation 
                src="https://lottie.host/embed/4e9ae918-b1d2-45a1-8562-610c54a04c36/taK6Aj7ddl.lottie"
                className="w-full h-full opacity-90"
              />
            </div>
            
            {/* Glass overlay with icon */}
            <div className="absolute inset-4 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
              <FaHeartbeat className="text-4xl text-white drop-shadow-lg" />
            </div>
          </div>
          
          {/* Enhanced pulse rings */}
          <div className="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-gradient-to-r from-white/10 to-purple-300/10 animate-ping"></div>
          <div className="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-gradient-to-r from-blue-300/10 to-white/5 animate-ping" style={{animationDelay: '1s'}}></div>
        </motion.div>
        
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-6xl font-bold text-white mb-4 font-display"
        >
          HealTrack
        </motion.h1>
        
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-xl text-white/90 mb-8 font-medium"
        >
          Your Personal Health Companion
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-white/60 to-purple-300/60 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-300/60 to-blue-300/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-300/60 to-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="backdrop-blur-lg bg-white/80 shadow-soft border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-3 shadow-glow">
                <FaHeartbeat className="text-xl text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HealTrack
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-x-4"
            >
              <button
                onClick={onLogin}
                className="btn btn-ghost text-gray-700 hover:text-indigo-600"
              >
                Sign In
              </button>
              <button
                onClick={onRegister}
                className="btn btn-primary shadow-glow"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6"
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-6">
                  🚀 Now in Beta - Free Forever
                </span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Take control of
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  your health
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Track symptoms, monitor progress, and gain insights into your health journey with our 
                comprehensive, secure, and beautifully designed platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={onRegister}
                  className="btn btn-primary text-lg px-8 py-4 shadow-strong"
                >
                  Start Your Journey
                  <span className="ml-2">→</span>
                </button>
                <button
                  onClick={onLogin}
                  className="btn btn-secondary text-lg px-8 py-4"
                >
                  Sign In
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Privacy First
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  100% Free
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Open Source
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="lg:col-span-6 mt-16 lg:mt-0"
            >
              <div className="relative">
                {/* Main dashboard mockup with Lottie animation */}
                <div className="glass-card p-8 transform rotate-3 hover:rotate-1 transition-transform duration-500 group">
                  <div className="bg-gradient-primary h-48 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                    {/* Lottie Animation Background */}
                    <div className="absolute inset-0 opacity-30">
                      <LottieAnimation 
                        src="https://lottie.host/embed/7fdd340c-1adc-4ff9-97e5-5bf299cd585f/3ZSmf0p1uc.lottie"
                        className="w-full h-full"
                      />
                    </div>
                    
                    {/* Overlay content */}
                    <div className="relative z-10 text-center">
                      <FaHeartbeat className="text-4xl text-white/80 mb-2" />
                      <p className="text-white/70 text-sm font-medium">Health Dashboard</p>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                  </div>
                  
                  {/* Dashboard preview content */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-gradient-to-r from-green-200 to-green-300 rounded-full w-16 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-2/3 animate-pulse" style={{animationDelay: '1.5s'}}></div>
                      <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-4/5 animate-pulse" style={{animationDelay: '2s'}}></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced floating elements with animations */}
                <motion.div 
                  animate={{ 
                    y: [-10, 10, -10],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-glow border border-green-200"
                >
                  <FaChartLine className="text-3xl text-green-600" />
                </motion.div>

                <motion.div 
                  animate={{ 
                    y: [10, -10, 10],
                    rotate: [0, -5, 0, 5, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute -bottom-4 -right-4 w-28 h-28 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-glow border border-blue-200"
                >
                  <FaPills className="text-3xl text-blue-600" />
                </motion.div>

                {/* Additional floating animations */}
                <motion.div 
                  animate={{ 
                    x: [-5, 5, -5],
                    y: [-3, 3, -3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute top-1/2 -left-8 w-16 h-16 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl flex items-center justify-center shadow-medium border border-purple-200"
                >
                  <FaRocket className="text-xl text-purple-600" />
                </motion.div>

                <motion.div 
                  animate={{ 
                    x: [5, -5, 5],
                    y: [3, -3, 3],
                    scale: [1.1, 1, 1.1]
                  }}
                  transition={{ 
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                  className="absolute top-1/4 -right-8 w-20 h-20 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl flex items-center justify-center shadow-medium border border-pink-200"
                >
                  <FaShieldAlt className="text-2xl text-pink-600" />
                </motion.div>

                {/* Sparkle effects */}
                <motion.div 
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-8 right-8 w-4 h-4 bg-yellow-400 rounded-full"
                >
                  <FaStar className="text-yellow-400 text-xs" />
                </motion.div>

                <motion.div 
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, -180, -360]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-8 left-8 w-3 h-3 bg-cyan-400 rounded-full"
                >
                  <FaStar className="text-cyan-400 text-xs" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-4 block">
              FEATURES
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to manage your health
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools you need to track, analyze, and improve your health journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaUserMd,
                title: "Smart Symptom Tracking",
                description: "Log symptoms with AI-powered suggestions, severity ratings, and pattern recognition.",
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-50 to-cyan-50",
                delay: 0.1,
                emoji: "🩺"
              },
              {
                icon: FaChartLine,
                title: "Visual Analytics",
                description: "Beautiful charts and insights to understand your health trends and progress over time.",
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
                delay: 0.2,
                emoji: "📊"
              },
              {
                icon: FaMobile,
                title: "Mobile Optimized",
                description: "Responsive design that works perfectly on all devices, anywhere, anytime.",
                color: "from-purple-500 to-violet-500",
                bgColor: "from-purple-50 to-violet-50",
                delay: 0.3,
                emoji: "📱"
              },
              {
                icon: FaHeartbeat,
                title: "Privacy First",
                description: "Your health data is encrypted and stored securely. You maintain full control.",
                color: "from-pink-500 to-rose-500",
                bgColor: "from-pink-50 to-rose-50",
                delay: 0.4,
                emoji: "🔒"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.6 }}
                className="group relative"
              >
                <div className="card-hover text-center relative overflow-hidden">
                  {/* Floating emoji */}
                  <motion.div
                    animate={{ 
                      y: [-5, 5, -5],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 3 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                    className="absolute -top-3 -right-3 text-2xl z-10 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-gray-100"
                  >
                    {feature.emoji}
                  </motion.div>

                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-glow`}
                    >
                      <feature.icon className="text-2xl text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </p>

                    {/* Progress bar animation */}
                    <motion.div 
                      className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ delay: feature.delay + 0.5, duration: 1 }}
                    >
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${feature.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ delay: feature.delay + 0.7, duration: 1.5, ease: "easeOut" }}
                      />
                    </motion.div>
                  </div>

                  {/* Sparkle effects */}
                  <motion.div 
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full"
                  />
                  
                  <motion.div 
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, -180, -360]
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3 + 1
                    }}
                    className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-cyan-400 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-20 grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: "🔐", 
                title: "Bank-level Security", 
                desc: "256-bit encryption",
                color: "from-red-100 to-pink-100",
                iconBg: "from-red-500 to-pink-500"
              },
              { 
                icon: "📱", 
                title: "PWA Support", 
                desc: "Install as native app",
                color: "from-blue-100 to-cyan-100",
                iconBg: "from-blue-500 to-cyan-500"
              },
              { 
                icon: "📊", 
                title: "Export Data", 
                desc: "CSV & JSON formats",
                color: "from-green-100 to-emerald-100",
                iconBg: "from-green-500 to-emerald-500"
              },
            ].map((item, index) => (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5
                }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300
                }}
                className="group relative"
              >
                <div className={`text-center p-8 rounded-2xl bg-gradient-to-br ${item.color} hover:shadow-strong transition-all duration-500 border border-white/50 backdrop-blur-sm relative overflow-hidden`}>
                  {/* Animated background pattern */}
                  <motion.div 
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 opacity-5"
                  >
                    <div className="w-full h-full bg-gradient-to-r from-white to-transparent transform rotate-45"></div>
                  </motion.div>

                  {/* Icon with gradient background */}
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${item.iconBg} rounded-2xl flex items-center justify-center shadow-lg relative z-10`}
                  >
                    <span className="text-2xl filter drop-shadow-sm">{item.icon}</span>
                  </motion.div>

                  <h4 className="font-bold text-gray-900 mb-2 text-lg relative z-10">{item.title}</h4>
                  <p className="text-sm text-gray-700 relative z-10 font-medium">{item.desc}</p>

                  {/* Floating particles */}
                  <motion.div 
                    animate={{ 
                      y: [-10, 10, -10],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"
                  />
                  
                  <motion.div 
                    animate={{ 
                      y: [10, -10, 10],
                      opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3 + 1
                    }}
                    className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              x: [-20, 20, -20],
              y: [-10, 10, -10],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          
          <motion.div 
            animate={{ 
              x: [20, -20, 20],
              y: [10, -10, 10],
              scale: [1.1, 1, 1.1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl"
          />

          {/* Additional floating elements */}
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/3 right-1/3 w-32 h-32 bg-cyan-300/10 rounded-full blur-2xl"
          />

          <motion.div 
            animate={{ 
              rotate: [360, 0],
              scale: [1.2, 0.8, 1.2]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-pink-300/10 rounded-full blur-2xl"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-white mb-6"
              animate={{ 
                textShadow: [
                  "0 0 10px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.8)",
                  "0 0 10px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Ready to start your health journey?
            </motion.h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of users who are taking control of their health with HealTrack. 
              Start tracking today and discover insights about your wellness.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.button
                onClick={onRegister}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(255,255,255,0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="btn bg-white text-indigo-600 hover:bg-gray-50 text-lg px-8 py-4 shadow-xl relative overflow-hidden group"
              >
                {/* Button shine effect */}
                <motion.div 
                  animate={{ x: [-100, 100] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 group-hover:via-white/40"
                />
                <span className="relative z-10">
                  Get Started for Free
                  <span className="ml-2">✨</span>
                </span>
              </motion.button>
              
              <motion.button
                onClick={onLogin}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                className="btn bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg px-8 py-4 backdrop-blur-sm"
              >
                Sign In
              </motion.button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex items-center justify-center space-x-8 text-white/70 text-sm flex-wrap gap-4"
            >
              {[
                { icon: "💳", text: "No credit card required", color: "bg-green-400" },
                { icon: "🆓", text: "Free forever", color: "bg-blue-400" },
                { icon: "⚡", text: "Setup in 2 minutes", color: "bg-purple-400" }
              ].map((item, index) => (
                <motion.div 
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="flex items-center"
                >
                  <motion.span 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    className={`w-2 h-2 ${item.color} rounded-full mr-2`}
                  />
                  <span className="text-sm">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-8 md:mb-0">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-3">
                <FaHeartbeat className="text-xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">HealTrack</h3>
                <p className="text-gray-400 text-sm">Your health, your data, your control</p>
              </div>
            </div>
            
            <div className="flex space-x-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; 2025 HealTrack. Made with ❤️ for better health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
