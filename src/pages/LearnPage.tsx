import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LEARNING_TECHNIQUES } from '../utils/constants';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

export const LearnPage = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-black">Learning Toolkit</h1>
        <p className="text-text-muted text-sm mt-1">Science-backed study techniques to boost retention</p>
      </header>

      <div className="glass rounded-3xl p-5 md:p-6 border border-brand/20 bg-gradient-to-r from-brand/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand"><Lightbulb size={20} /></div>
          <h2 className="font-bold">Pro Tip</h2>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Use <strong>2-3 techniques per study session</strong> for best results. Start with <strong>Active Recall</strong> and <strong>Spaced Repetition</strong> — they are the most effective evidence-based methods. Then layer in others as you get comfortable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEARNING_TECHNIQUES.map((tech, i) => {
          const isExpanded = expanded === tech.id;
          return (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass rounded-2xl border overflow-hidden transition-all cursor-pointer ${isExpanded ? 'border-brand/30' : 'border-border hover:border-brand/20'}`}
              onClick={() => setExpanded(isExpanded ? null : tech.id)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${tech.color}`}>
                      {tech.emoji}
                    </div>
                    <h3 className="font-bold text-sm">{tech.name}</h3>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </div>
                <p className="text-xs text-text-secondary mt-3 leading-relaxed">{tech.description}</p>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-surface-hover/50 border-t border-border px-5 py-4"
                >
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Try This Now</p>
                  <p className="text-sm text-brand font-medium leading-relaxed mb-4">💡 {tech.prompt}</p>
                  
                  {tech.detailedContent && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailId(tech.id);
                      }}
                      className="w-full py-2 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand/20 transition-all"
                    >
                      Learn More Details
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showDetailId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setShowDetailId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="glass rounded-[2rem] p-8 border border-brand/30 max-w-2xl w-full shadow-glow-brand"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const tech = LEARNING_TECHNIQUES.find(t => t.id === showDetailId);
                if (!tech) return null;
                return (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border ${tech.color}`}>
                        {tech.emoji}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">{tech.name}</h2>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Technique Deep Dive</p>
                      </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none mb-8">
                      <div className="text-text-secondary leading-relaxed whitespace-pre-line text-sm bg-surface/50 p-6 rounded-2xl border border-border">
                        {tech.detailedContent || 'Detailed guide coming soon...'}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowDetailId(null)}
                      className="w-full py-4 bg-brand text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-dark transition-all shadow-glow-brand"
                    >
                      Got it, thanks!
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
