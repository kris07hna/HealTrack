import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FaHeartbeat, FaUserMd, FaChartLine, FaMobile, FaPills, FaRocket, FaShieldAlt, FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBars, FaTimes, FaLinkedin, FaGithub, FaUser, FaCode, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import LoginForm from '@/components/forms/LoginForm';
import RegisterForm from '@/components/forms/RegisterForm';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        const scrollPercent = scrollTop / scrollHeight;
        
        if (scrollPercent < 0.25) {
          setCurrentPage(0);
        } else if (scrollPercent < 0.5) {
          setCurrentPage(1);
        } else if (scrollPercent < 0.75) {
          setCurrentPage(2);
        } else {
          setCurrentPage(3);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToPage = (pageIndex: number) => {
    if (containerRef.current) {
      const targetScroll = (pageIndex / 4) * (containerRef.current.scrollHeight - containerRef.current.clientHeight);
      containerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Glassmorphism Header */}
      <Header 
        currentPage={currentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogin={() => setShowLogin(true)}
        scrollToPage={scrollToPage}
      />

      {/* Main Content Container */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden scroll-smooth"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {/* Page 1: Hero with Spline Animation */}
        <HeroPage />
        
        {/* Page 2: Features with Dark Theme */}
        <FeaturesPage />
        
        {/* Page 3: Contact Section */}
        <ContactPage />
        
        {/* Page 4: Call to Action */}
        <CTAPage onLogin={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} />
      </div>

      {/* Footer */}
      <Footer currentPage={currentPage} scrollToPage={scrollToPage} />

      {/* Page Navigation Indicator */}
      <PageIndicator currentPage={currentPage} scrollToPage={scrollToPage} />
    </div>
  );
}

// Header Component with Glassmorphism
function Header({ currentPage, mobileMenuOpen, setMobileMenuOpen, onLogin, scrollToPage }: {
  currentPage: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogin: () => void;
  scrollToPage: (page: number) => void;
}) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/20 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => scrollToPage(0)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <FaHeartbeat className="text-2xl text-white" />
            </motion.div>
            <motion.h1 
              className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              HealTrack
            </motion.h1>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <motion.button
              onClick={() => scrollToPage(0)}
              className={`text-sm font-medium transition-all duration-300 ${currentPage === 0 ? 'text-cyan-400' : 'text-white/80 hover:text-white'}`}
              whileHover={{ scale: 1.1 }}
            >
              Home
            </motion.button>
            <motion.button
              onClick={() => scrollToPage(1)}
              className={`text-sm font-medium transition-all duration-300 ${currentPage === 1 ? 'text-cyan-400' : 'text-white/80 hover:text-white'}`}
              whileHover={{ scale: 1.1 }}
            >
              Features
            </motion.button>
            <motion.button
              onClick={() => scrollToPage(2)}
              className={`text-sm font-medium transition-all duration-300 ${currentPage === 2 ? 'text-cyan-400' : 'text-white/80 hover:text-white'}`}
              whileHover={{ scale: 1.1 }}
            >
              Contact
            </motion.button>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              onClick={onLogin}
              className="px-6 py-2 text-sm font-medium text-white/90 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 rounded-full border border-white/10 hover:border-white/20"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden backdrop-blur-2xl bg-black/40 border-t border-white/10"
          >
            <div className="px-6 py-4 space-y-4">
              <button onClick={() => { scrollToPage(0); setMobileMenuOpen(false); }} className="block w-full text-left text-white/80 hover:text-white">Home</button>
              <button onClick={() => { scrollToPage(1); setMobileMenuOpen(false); }} className="block w-full text-left text-white/80 hover:text-white">Features</button>
              <button onClick={() => { scrollToPage(2); setMobileMenuOpen(false); }} className="block w-full text-left text-white/80 hover:text-white">Contact</button>
              <button onClick={onLogin} className="block w-full text-left text-cyan-400 font-medium">Sign In</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// Page 1: Hero with Simple Background
function HeroPage() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
      {/* Simple Gradient Background */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Subtle animated elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-7xl md:text-9xl font-black mb-6"
            style={{
              background: "linear-gradient(45deg, #00f5ff, #ff00f5, #f5ff00, #00f5ff)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            HealTrack
          </motion.h1>
          
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="h-2 w-64 mx-auto bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full mb-8"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-2xl md:text-3xl text-white/90 mb-12 font-light leading-relaxed"
        >
          The Future of{" "}
          <motion.span
            className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AI-Powered
          </motion.span>
          {" "}Health Intelligence
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.button
            className="group relative px-12 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg overflow-hidden"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10">Experience the Future</span>
          </motion.button>

          <motion.div
            className="flex items-center space-x-4 text-white/70"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <FaHeartbeat className="text-cyan-400" />
            </div>
            <span className="text-sm">Join 10,000+ Users</span>
          </motion.div>
        </motion.div>

        {/* Simple Floating Elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-cyan-400/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-purple-400/20 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 bg-pink-400/20 rounded-full"></div>
      </div>

      {/* Simple Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full p-2">
          <div className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
        </div>
      </div>
    </section>
  );
}

// Page 2: Features with Dark Theme and Animations
function FeaturesPage() {
  const features = [
    {
      icon: FaUserMd,
      title: "AI Health Assistant",
      description: "Advanced AI algorithms analyze your health patterns and provide personalized insights for better wellness management.",
      gradient: "from-blue-500 to-cyan-500",
      delay: 0.2
    },
    {
      icon: FaChartLine,
      title: "Smart Analytics",
      description: "Comprehensive health tracking with intelligent data visualization and predictive health modeling.",
      gradient: "from-purple-500 to-pink-500",
      delay: 0.4
    },
    {
      icon: FaShieldAlt,
      title: "Privacy First",
      description: "Bank-level encryption with zero-knowledge architecture. Your health data remains completely private and secure.",
      gradient: "from-green-500 to-emerald-500",
      delay: 0.6
    },
    {
      icon: FaMobile,
      title: "Cross-Platform Sync",
      description: "Seamlessly sync across all your devices with real-time updates and offline capabilities.",
      gradient: "from-orange-500 to-red-500",
      delay: 0.8
    }
  ];

  return (
    <section className="relative min-h-screen bg-black flex items-center py-20" style={{ scrollSnapAlign: 'start' }}>
      {/* Simple Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h2 
            className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-cyan-400 to-purple-400 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Revolutionary Features
          </motion.h2>
          <motion.p 
            className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Experience the next generation of health technology with features that adapt to your unique needs
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, rotateY: 30 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: feature.delay, duration: 0.8, type: "spring" }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 p-8 h-full hover:bg-white/10 transition-all duration-500">
                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(45deg, transparent, rgba(0,255,255,0.2), transparent)`,
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative z-10">
                  {/* Feature Icon */}
                  <motion.div
                    className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center shadow-2xl`}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ delay: feature.delay + 0.2, duration: 0.8, type: "spring" }}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                  >
                    <feature.icon className="text-3xl text-white" />
                  </motion.div>

                  {/* Feature Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: feature.delay + 0.6, duration: 0.6 }}
                    className="text-2xl font-bold text-white mb-4 text-center"
                  >
                    {feature.title}
                  </motion.h3>

                  {/* Feature Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: feature.delay + 0.8, duration: 0.6 }}
                    className="text-white/70 leading-relaxed text-center"
                  >
                    {feature.description}
                  </motion.p>

                  {/* Animated Progress Bar */}
                  <motion.div
                    className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: feature.delay + 1, duration: 1 }}
                  >
                    <motion.div
                      className={`h-full bg-gradient-to-r ${feature.gradient}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ delay: feature.delay + 1.2, duration: 1.5 }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Page 3: Contact Section with Krishna's Details
function ContactPage() {
  const contactInfo = {
    name: "Krishna R",
    email: "krishedu07@gmail.com",
    linkedin: "https://www.linkedin.com/in/krishnar1508/",
    github: "https://github.com/kris07hna"
  };

  const socialLinks = [
    {
      icon: FaLinkedin,
      label: "LinkedIn",
      url: contactInfo.linkedin,
      color: "from-blue-600 to-blue-400",
      hoverColor: "hover:text-blue-400"
    },
    {
      icon: FaGithub,
      label: "GitHub", 
      url: contactInfo.github,
      color: "from-gray-800 to-gray-600",
      hoverColor: "hover:text-gray-300"
    },
    {
      icon: FaEnvelope,
      label: "Email",
      url: `mailto:${contactInfo.email}`,
      color: "from-red-600 to-pink-500",
      hoverColor: "hover:text-pink-400"
    }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-slate-900/50 to-black flex items-center justify-center py-20" style={{ scrollSnapAlign: 'start' }}>
      {/* Simple Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Get in Touch
          </motion.h2>
          <motion.p 
            className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Let's connect and build something amazing together
          </motion.p>
        </motion.div>

        {/* Contact Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 mb-12 hover:bg-white/10 transition-all duration-500"
        >
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-10"
          >
            <motion.div 
              className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full flex items-center justify-center text-6xl text-white"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8, duration: 1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <FaUser />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2"
            >
              {contactInfo.name}
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-lg text-white/70 mb-6"
            >
              Full-Stack Developer & Health Tech Enthusiast
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
              className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full"
            />
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.url}
                target={social.label !== "Email" ? "_blank" : undefined}
                rel={social.label !== "Email" ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 + index * 0.1, duration: 0.6 }}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated Background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />
                
                <div className="relative z-10 text-center">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 10 }}
                  >
                    <social.icon className={`text-2xl text-white/80 group-hover:text-white transition-colors duration-300 ${social.hoverColor}`} />
                  </motion.div>
                  
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {social.label}
                  </h4>
                  
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300 flex items-center justify-center">
                    {social.label === "Email" ? contactInfo.email : `@${social.url.split('/').pop()}`}
                    <FaExternalLinkAlt className="ml-2 text-xs" />
                  </p>
                </div>
                
                {/* Hover Effect Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-300"
                  whileHover={{ 
                    boxShadow: "0 0 30px rgba(255, 255, 255, 0.1)" 
                  }}
                />
              </motion.a>
            ))}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="mt-10 pt-8 border-t border-white/10"
          >
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-white/60">
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <FaCode className="mr-2 text-cyan-400" />
                <span>Open to collaborate</span>
              </motion.div>
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <FaHeartbeat className="mr-2 text-pink-400" />
                <span>Health Tech Passionate</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="text-center"
        >
          <motion.p
            className="text-lg text-white/70 mb-6"
            animate={{ 
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Ready to transform healthcare with technology?
          </motion.p>
          
          <motion.a
            href={`mailto:${contactInfo.email}`}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl text-white font-semibold text-lg hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaEnvelope className="mr-3" />
            Let's Talk
            <motion.div
              className="ml-3"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// Page 4: Call to Action
function CTAPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center" style={{ scrollSnapAlign: 'start' }}>
      {/* Simple Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Main CTA Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <motion.h2 
            className="text-5xl md:text-7xl font-black mb-8"
            animate={{ 
              backgroundImage: [
                "linear-gradient(45deg, #00f5ff, #ff00f5)",
                "linear-gradient(45deg, #ff00f5, #f5ff00)",
                "linear-gradient(45deg, #f5ff00, #00f5ff)",
                "linear-gradient(45deg, #00f5ff, #ff00f5)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Ready to Transform Your Health?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-white/80 mb-12 leading-relaxed"
          >
            Join thousands of users who have revolutionized their health journey with AI-powered insights
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <motion.button
            onClick={onRegister}
            className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl text-white font-bold text-xl overflow-hidden"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center">
              Get Started Free
              <motion.span
                className="ml-3"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>

          <motion.button
            onClick={onLogin}
            className="px-12 py-6 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl text-white font-bold text-xl hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </motion.div>

        {/* Stats/Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { number: "10K+", label: "Active Users", icon: FaUserMd },
            { number: "1M+", label: "Health Records", icon: FaChartLine },
            { number: "99.9%", label: "Uptime", icon: FaShieldAlt }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <stat.icon className="text-2xl text-white" />
              </motion.div>
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Footer Component
function Footer({ currentPage, scrollToPage }: { currentPage: number; scrollToPage: (page: number) => void }) {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-black/20 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-6 text-sm text-white/60">
            <div className="flex items-center">
              <FaEnvelope className="mr-2" />
              hello@healtrack.app
            </div>
            <div className="flex items-center">
              <FaPhone className="mr-2" />
              +1 (555) 123-4567
            </div>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center space-x-4">
            {['Home', 'Features', 'Contact', 'Get Started'].map((page, index) => (
              <motion.button
                key={page}
                onClick={() => scrollToPage(index)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                  currentPage === index 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {page}
              </motion.button>
            ))}
          </div>

          {/* Copyright */}
          <div className="hidden md:block text-sm text-white/40">
            © 2025 HealTrack. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

// Page Indicator Component
function PageIndicator({ currentPage, scrollToPage }: { currentPage: number; scrollToPage: (page: number) => void }) {
  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 space-y-4">
      {[0, 1, 2, 3].map((page) => (
        <motion.button
          key={page}
          onClick={() => scrollToPage(page)}
          className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
            currentPage === page 
              ? 'bg-white border-white' 
              : 'border-white/40 hover:border-white/60'
          }`}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
        />
      ))}
    </div>
  );
}
