import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Check, Clock, Coffee, CloudRain, Waves, VolumeX, Moon, Sparkles, Plus } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { useGameStore } from '../store/useGameStore';
import { useSubjectsStore } from '../store/useSubjectsStore';
import { useRef } from 'react';

export const TimerPage = () => {
  const { isRunning, isPaused, elapsed, startTimer, pauseTimer, resumeTimer, stopTimer, tick, activeSubjects } = useTimerStore();
  const { addCoins, addXP, updateStreak } = useGameStore();
  const { subjects, addSubject } = useSubjectsStore();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showCoins, setShowCoins] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [ambientSound, setAmbientSound] = useState<string | null>(null);


  const sounds = [
    { 
      id: 'rain', 
      name: 'Rain', 
      icon: CloudRain, 
      url: 'https://raw.githubusercontent.com/Utkarshn10/Focusly/master/public/sound/rain.mp3',
      theme: 'bg-indigo-950/80 border-indigo-500/50',
      pageTheme: 'from-indigo-950 via-bg to-indigo-950',
      accent: 'text-indigo-400',
      glow: 'shadow-[0_0_60px_-12px_rgba(99,102,241,0.6)]'
    },
    { 
      id: 'white', 
      name: 'White noise', 
      icon: Waves, 
      url: 'https://raw.githubusercontent.com/Utkarshn10/Focusly/master/public/sound/brownnoise.mp3',
      theme: 'bg-slate-900/60 border-slate-400/30',
      pageTheme: 'from-slate-900 via-bg to-slate-900',
      accent: 'text-slate-200',
      glow: 'shadow-[0_0_60px_-12px_rgba(255,255,255,0.4)]'
    },
    { 
      id: 'black', 
      name: 'Black noise', 
      icon: Moon, 
      url: 'https://raw.githubusercontent.com/Utkarshn10/Focusly/master/public/sound/sea.mp3',
      theme: 'bg-black/90 border-purple-900/50',
      pageTheme: 'from-black via-bg to-black',
      accent: 'text-purple-500',
      glow: 'shadow-[0_0_60px_-12px_rgba(168,85,247,0.5)]'
    },
    { 
      id: 'forest', 
      name: 'Deep Focus', 
      icon: Sparkles, 
      url: 'https://raw.githubusercontent.com/Utkarshn10/Focusly/master/public/sound/forest.mp3',
      theme: 'bg-emerald-950/40 border-emerald-500/30',
      pageTheme: 'from-emerald-950 via-bg to-emerald-950',
      accent: 'text-emerald-400',
      glow: 'shadow-[0_0_60px_-12px_rgba(16,185,129,0.4)]'
    },
    { 
      id: 'study', 
      name: 'Study Lofi', 
      icon: Coffee, 
      url: 'https://raw.githubusercontent.com/Utkarshn10/Focusly/master/public/sound/lofi-study.mp3',
      theme: 'bg-orange-950/30 border-orange-500/30',
      pageTheme: 'from-orange-950 via-bg to-orange-950',
      accent: 'text-orange-400',
      glow: 'shadow-[0_0_60px_-12px_rgba(249,115,22,0.3)]'
    },
  ];

  const currentSound = sounds.find(s => s.id === ambientSound);

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    if (ambientSound) {
      const sound = sounds.find(s => s.id === ambientSound);
      const url = sound ? sound.url : ambientSound;
      const name = sound ? sound.name : 'Custom Media';
      
      audio.src = url;
      audio.loop = true;
      audio.load();
      console.log("Playing sound:", name, "from", url);
      audio.play().catch(e => console.error("Audio play failed:", e));
    } else {
      audio.pause();
      audio.src = "";
    }
    
    return () => {
      audio.pause();
    };
  }, [ambientSound]);

  // Live clock
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, tick]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleStop = useCallback(() => {
    const minutes = Math.floor(elapsed / 60);
    const coinsEarned = minutes;
    stopTimer();
    if (minutes > 0) {
      addCoins(coinsEarned);
      addXP(minutes);
      updateStreak();
      setEarnedCoins(coinsEarned);
      setShowCoins(true);
      setTimeout(() => setShowCoins(false), 3000);
    }
  }, [elapsed, stopTimer, addCoins, addXP, updateStreak]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className={`space-y-6 max-w-4xl mx-auto p-8 rounded-[3rem] transition-all duration-1000 bg-gradient-to-br ${
        currentSound ? currentSound.pageTheme : 'from-transparent to-transparent'
      }`}
    >
      {/* Use Headphones Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-brand/10 border border-brand/20 text-brand font-black text-xs uppercase tracking-widest shadow-sm"
      >
        <VolumeX size={16} className="animate-pulse" />
        Use Headphones for better experience
        <VolumeX size={16} className="animate-pulse" />
      </motion.div>

      {/* Current Time */}
      <div className="text-center">
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Current Time</p>
        <p className={`text-2xl font-mono font-bold transition-colors duration-500 timer-digit ${
          currentSound ? currentSound.accent : 'text-text-secondary'
        }`}>
          {currentTime.toLocaleTimeString()}
        </p>
      </div>

      {/* Timer Display */}
      <div className={`glass rounded-3xl p-8 md:p-12 border transition-all duration-700 text-center relative overflow-hidden ${
        currentSound ? `${currentSound.theme} ${currentSound.glow}` : 'border-border'
      }`}>
        {/* Theme Overlay Effects */}
        <AnimatePresence>
          {ambientSound === 'rain' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bg-indigo-400/20 w-[1px] h-12"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animation: `fall ${0.5 + Math.random()}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
        
        {/* Futuristic Clock Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Clock size={300} />
        </div>

        <div className="relative flex flex-col items-center">
          <div className={`timer-digit text-7xl md:text-8xl font-black tracking-tight mb-2 drop-shadow-glow transition-colors duration-500 ${
            currentSound ? currentSound.accent : 'text-brand'
          }`}>
            {formatTime(elapsed)}
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors duration-500 ${
              currentSound ? currentSound.accent : 'text-text-muted'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse transition-colors ${
                currentSound ? currentSound.accent.replace('text', 'bg') : 'bg-brand'
              }`} />
              {isRunning ? 'Focus Session Active' : 'Ready to Start Focus'}
            </div>
            {isRunning && activeSubjects.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap justify-center gap-1.5 mt-1"
              >
                {activeSubjects.map(sub => (
                  <span key={sub} className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-wider border border-brand/20">
                    {sub}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {/* Ambient Sounds */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {sounds.map(sound => (
              <button
                key={sound.id}
                onClick={() => setAmbientSound(ambientSound === sound.id ? null : sound.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[100px] transition-all border ${
                  ambientSound === sound.id 
                    ? 'bg-brand text-white border-brand shadow-glow-brand scale-110' 
                    : 'bg-surface/40 border-border/50 text-text-muted hover:border-brand/30 hover:bg-surface/60'
                }`}
              >
                <sound.icon size={24} className={ambientSound === sound.id ? 'animate-bounce' : ''} />
                <span className="text-[10px] font-black uppercase tracking-wider">{sound.name}</span>
              </button>
            ))}
            <button
              onClick={() => setAmbientSound(null)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[100px] transition-all border ${
                !ambientSound 
                  ? 'bg-surface-hover text-text border-border shadow-inner' 
                  : 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20'
              }`}
            >
              <VolumeX size={24} />
              <span className="text-[10px] font-black uppercase tracking-wider">None</span>
            </button>

            {/* Custom Media Import */}
            <input
              type="file"
              id="custom-audio"
              className="hidden"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setAmbientSound(url);
                  // Add to temporary sounds list if needed, or just set as current
                }
              }}
            />
            <button
              onClick={() => document.getElementById('custom-audio')?.click()}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[100px] transition-all border bg-surface/40 border-dashed border-text-muted text-text-muted hover:border-brand/50 hover:text-brand hover:bg-surface/60"
            >
              <Plus size={24} />
              <span className="text-[10px] font-black uppercase tracking-wider">Import</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isRunning && !isPaused ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseTimer}
                className="w-16 h-16 rounded-2xl bg-surface border-2 border-brand text-brand flex items-center justify-center shadow-lg transition-colors hover:bg-brand/10"
              >
                <Pause size={28} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRunning ? resumeTimer : () => startTimer(selectedSubjects)}
                disabled={!isRunning && selectedSubjects.length === 0}
                className="w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center shadow-glow-brand disabled:opacity-50 disabled:shadow-none transition-all"
              >
                <Play size={28} className="ml-1" />
              </motion.button>
            )}

            {isRunning && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="w-12 h-12 rounded-2xl bg-surface border border-border text-text-muted flex items-center justify-center hover:text-danger hover:border-danger/30 transition-all"
              >
                <Square size={20} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Coin Animation */}
        <AnimatePresence>
          {showCoins && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, y: -60 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl font-bold text-coin coin-glow"
            >
              +{earnedCoins} 🪙
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subject Selection */}
      {!isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-3xl p-6 border border-border"
        >
          <h3 className="font-bold text-lg mb-4">Select Subjects</h3>
          <div className="flex flex-wrap gap-2">
            {subjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub);
              return (
                <motion.button
                  key={sub}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSubject(sub)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand text-white shadow-glow'
                      : 'bg-surface border border-border text-text-secondary hover:border-brand/30'
                  }`}
                >
                  {isSelected && <Check size={14} className="inline mr-1.5 -mt-0.5" />}
                  {sub}
                </motion.button>
              );
            })}
            
            {showAddSubject ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newSubject.trim()) {
                  addSubject(newSubject.trim());
                  if (!selectedSubjects.includes(newSubject.trim())) toggleSubject(newSubject.trim());
                  setNewSubject('');
                  setShowAddSubject(false);
                }
              }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="New subject..."
                  className="px-3 py-1.5 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand w-32"
                  autoFocus
                  onBlur={() => {
                    if (!newSubject.trim()) setShowAddSubject(false);
                  }}
                />
              </form>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddSubject(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-surface border border-dashed border-text-muted text-text-muted hover:border-brand/50 hover:text-brand"
              >
                + Other
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
