import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';
import { useExpenses } from '../../store/useExpenses';
import { useCurrency } from '../../hooks/useCurrency';
import { Logo } from '../common/Logo';

export const AIBot = () => {
  const { expenses } = useExpenses();
  const { formatAmount } = useCurrency();
  const [insights, setInsights] = useState<string[]>(["Analyzing your spending patterns..."]);
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    setIsTyping(true);
    // Simulated AI analysis based on expenses
    if (expenses.length === 0) {
      setTimeout(() => {
        setInsights(["I don't see any transactions yet. Start adding your expenses, and I'll analyze your spending habits!"]);
        setIsTyping(false);
      }, 1000);
      return;
    }
    
    // Simulate AI thinking time
    const timer = setTimeout(() => {
      const topCategory = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);
      
      const highestCat = Object.keys(topCategory).reduce((a, b) => topCategory[a] > topCategory[b] ? a : b, '');
      const highestCatAmount = topCategory[highestCat];
      const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const pct = Math.round((highestCatAmount / total) * 100);
      
      setInsights([
        `I noticed you spend the most on ${highestCat} (${formatAmount(highestCatAmount)}). This represents ${pct}% of your total spending.`,
        `You have logged ${expenses.length} transactions so far. A good rule of thumb is keeping discretionary spending under 30%.`,
        `Pro Tip: Set a monthly budget alert for ${highestCat} to help you reach your savings goals faster!`
      ]);
      setIsTyping(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [expenses, formatAmount]);

  return (
    <div className="relative glass rounded-3xl p-1 border border-primary/20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-blue-500/5 shadow-lg shadow-primary/5">
      <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] text-primary rotate-12">
        <Logo size={200} />
      </div>
      
      <div className="p-6 md:p-8 relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary animate-ping opacity-20 rounded-full" />
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 relative z-10 border border-white/10">
                <Logo size={32} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl leading-none flex items-center gap-2">
                Kfire Groups Bot
                <Sparkles size={16} className="text-blue-500 animate-pulse" />
              </h3>
              <p className="text-xs text-primary font-bold mt-1.5 uppercase tracking-widest flex items-center gap-1">
                <BrainCircuit size={12} /> Live AI Analysis
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-background/80 backdrop-blur-md rounded-2xl p-5 border border-border shadow-inner relative">
          {isTyping ? (
            <div className="flex items-center gap-1 h-6">
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex gap-3 items-start"
                >
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/70 flex-shrink-0" />
                  <p className="text-foreground leading-relaxed font-medium text-[15px]">
                    {msg}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        <button className="mt-5 text-sm font-semibold text-primary flex items-center gap-1.5 hover:gap-2.5 transition-all bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl">
          Generate Deep Analysis <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
