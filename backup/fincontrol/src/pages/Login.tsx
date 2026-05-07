import React, { useState } from 'react';
import { useAuth } from '../store/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      login({ id: crypto.randomUUID(), name, email });
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-10 rounded-[2.5rem] glass shadow-glass dark:shadow-glass-dark border border-white/5 relative z-10 backdrop-blur-2xl bg-white/[0.02]"
      >
        <div className="flex flex-col items-center mb-10">
          <Logo size={120} showText={true} className="mb-6 drop-shadow-[0_0_25px_rgba(255,0,0,0.2)]" />
          <h1 className="text-3xl font-black text-center text-white tracking-tight">FinControl</h1>
          <p className="text-muted-foreground mt-2 text-center text-sm font-medium">Empowering your financial journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="john@example.com"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Continue to Dashboard
          </button>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
          FinControl <span className="w-1 h-1 rounded-full bg-primary/50"></span> By Kfire Group
        </p>
      </motion.div>
    </div>
  );
};
