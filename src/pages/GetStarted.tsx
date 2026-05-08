import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Sparkles, ArrowRight, Brain, Target, 
  Phone, Mail, Clock
} from 'lucide-react';


export const GetStarted = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Force dark theme on landing page
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('hash-theme', 'dark');
  }, []);
  
  const { signInAsGuest, isAuthenticated, isGuestMode } = useAuthStore();
  
  const handleGetStarted = () => {
    sessionStorage.setItem('hash_session_launched', 'true');
    if (!isAuthenticated && !isGuestMode) {
      signInAsGuest();
    }
    navigate('/dashboard', { replace: true });
  };

  const features = [
    { 
      icon: Clock, 
      title: 'Study Tracker', 
      desc: 'Immersive study sessions with ambient soundscapes and high-performance tracking.',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      icon: Target, 
      title: 'Gamified Progress', 
      desc: 'Earn coins, level up your avatar, and track your study streaks to stay motivated.',
      color: 'from-orange-400 to-red-600'
    },
    { 
      icon: Brain, 
      title: 'Smart Planner', 
      desc: 'Automatically sync exams, goals, and tasks into a unified high-end schedule.',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '50K+' },
    { label: 'Study Hours', value: '1.2M+' },
    { label: 'Tasks Done', value: '800K+' },
    { label: 'Focus Score', value: '4.9/5' }
  ];

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-brand/30">
      {/* Premium Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto glass border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between backdrop-blur-xl">
          <div className="flex justify-center">
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black tracking-tighter italic leading-none text-brand">KFIRE GROUPS STUDY TRACKER</span>
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-brand mt-1.5 ml-0.5">Your Digital Partner in Excellence</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-text-muted">
            <a href="#features" className="hover:text-brand transition-colors">Features</a>
            <a href="#about" className="hover:text-brand transition-colors">About</a>
            <a href="#contact" className="hover:text-brand transition-colors">Contact</a>
          </div>

          <button 
            onClick={handleGetStarted}
            className="bg-brand text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-glow-brand"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.05, 0.08, 0.05]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
              opacity: [0.05, 0.08, 0.05]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent rounded-full blur-[120px]"
          />
        </div>
        
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-surface-hover border border-border text-[11px] font-black uppercase tracking-[0.3em] text-brand mb-4 shadow-xl"
          >
            <span className="text-brand mr-1">✦</span> The Future of Learning is Here
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] mb-8"
          >
            Study <span className="bg-gradient-to-r from-brand via-accent to-brand-light bg-clip-text text-transparent">Smarter.</span><br />
            <span className="text-outline">Level Up.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl text-text-muted max-w-4xl mx-auto leading-relaxed font-medium"
          >
            Experience the world's most immersive study companion. Gamified tracking, 
            Smart study planning, and focused ambient soundscapes.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-12"
          >
            <button 
              onClick={handleGetStarted}
              className="group relative bg-brand text-white px-12 py-6 rounded-[2rem] font-black text-2xl hover:bg-brand-dark transition-all shadow-glow-brand flex items-center gap-4 active:scale-95"
            >
              Start Your Journey
              <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
              <div className="absolute inset-0 rounded-[2rem] bg-brand blur-2xl opacity-20 group-hover:opacity-40 transition-opacity -z-10" />
            </button>
          </motion.div>

          {/* Trusted By Section */}
          <motion.div
            id="about"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="pt-24"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted mb-8">Trusted by students from</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-200">
              <div className="text-2xl font-black italic tracking-tighter">STANFORD</div>
              <div className="text-2xl font-black italic tracking-tighter">MIT</div>
              <div className="text-2xl font-black italic tracking-tighter">OXFORD</div>
              <div className="text-2xl font-black italic tracking-tighter">HARVARD</div>
              <div className="text-2xl font-black italic tracking-tighter">CAMBRIDGE</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-y border-border bg-surface/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-black mb-2">{stat.value}</h3>
              <p className="text-xs font-black uppercase tracking-widest text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Master Your Academic Life</h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">Everything you need to stay focused, organized, and ahead of the curve.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2.5rem] bg-surface border border-border hover:border-brand/30 transition-all relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity -mr-16 -mt-16 rounded-full`} />
                <f.icon size={40} className="text-brand mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black mb-3">{f.title}</h3>
                <p className="text-text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Footer & Contact Bar */}
      {/* Global Footer */}
      <footer id="contact" className="w-full py-20 px-8 border-t border-border bg-surface/30 mt-auto relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-brand/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="text-center lg:text-left space-y-4">
            <div className="flex justify-center lg:justify-start mb-4">
              <span className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-brand">HASH STUDY TRACKER</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter bg-gradient-to-r from-brand via-accent to-brand bg-clip-text text-transparent">
                BUILD YOUR OWN WEBSITE
              </h3>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] ml-1">Premium Digital Solutions by KFIRE GROUPS</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center lg:items-end gap-6">
            <span className="text-xs font-black text-brand uppercase tracking-widest bg-brand/10 px-4 py-1.5 rounded-full border border-brand/20">Contact Us</span>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <a href="tel:8778961957" className="flex items-center gap-4 text-xl font-black group hover:text-brand transition-all">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-brand shadow-xl group-hover:border-brand/30 group-hover:scale-110 transition-all">
                  <Phone size={24} />
                </div>
                8778961957
              </a>
              <a href="mailto:kfiregroups11@gmail.com" className="flex items-center gap-4 text-xl font-black group hover:text-brand transition-all">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-accent shadow-xl group-hover:border-accent/30 group-hover:scale-110 transition-all">
                  <Mail size={24} />
                </div>
                kfiregroups11@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
          <p className="text-xs font-black uppercase tracking-widest">© 2026 HASH STUDY TRACKER. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">Created by KFIRE GROUPS</p>
            <Sparkles size={12} className="text-brand" />
          </div>
        </div>
      </footer>
    </div>
  );
};
