import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExamStore } from '../store/useExamStore';
import { useSubjectsStore } from '../store/useSubjectsStore';
import {
  Target, Calendar, Plus, Trash2, CheckCircle2,
  Trophy, Star, X
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export const ExamsPage = () => {
  const { exams, goals, addExam, removeExam, addGoal, removeGoal, toggleGoal } = useExamStore();
  const { subjects } = useSubjectsStore();

  const [showAddExam, setShowAddExam] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const [examForm, setExamForm] = useState({ title: '', subject: subjects[0] || '', date: '' });
  const [goalForm, setGoalForm] = useState({ title: '', targetDate: '' });

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (examForm.title && examForm.date) {
      addExam(examForm);
      setExamForm({ title: '', subject: subjects[0] || '', date: '' });
      setShowAddExam(false);
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalForm.title && goalForm.targetDate) {
      addGoal(goalForm);
      setGoalForm({ title: '', targetDate: '' });
      setShowAddGoal(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-black">Goals & Exams</h1>
        <p className="text-text-muted text-sm mt-1">Track your major milestones and academic targets</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Exams Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Trophy size={20} className="text-brand" /> Upcoming Exams
            </h2>
            <button 
              onClick={() => setShowAddExam(true)}
              className="p-2 bg-brand/10 text-brand rounded-xl hover:bg-brand/20 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {exams.length === 0 ? (
              <div className="glass border-border border rounded-3xl p-8 text-center">
                <Calendar size={40} className="mx-auto text-text-muted/20 mb-3" />
                <p className="text-sm font-bold text-text-muted">No exams added yet.</p>
              </div>
            ) : (
              exams.map(exam => {
                const daysLeft = differenceInDays(new Date(exam.date), new Date());
                return (
                  <motion.div 
                    key={exam.id}
                    layout
                    className="glass border-border border rounded-3xl p-5 relative overflow-hidden group hover:border-brand/30 transition-all"
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <h3 className="font-black text-lg">{exam.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {exam.subject}
                          </span>
                          <span className="text-[10px] font-bold text-text-muted">
                            {format(new Date(exam.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${daysLeft <= 7 ? 'text-danger' : 'text-text'}`}>
                          {daysLeft}
                        </p>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Days Left</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeExam(exam.id)}
                      className="absolute top-2 right-2 p-1.5 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* Goals Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Target size={20} className="text-accent" /> Long-term Goals
            </h2>
            <button 
              onClick={() => setShowAddGoal(true)}
              className="p-2 bg-accent/10 text-accent rounded-xl hover:bg-accent/20 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="glass border-border border rounded-3xl p-8 text-center">
                <Star size={40} className="mx-auto text-text-muted/20 mb-3" />
                <p className="text-sm font-bold text-text-muted">No goals set yet.</p>
              </div>
            ) : (
              goals.map(goal => (
                <motion.div 
                  key={goal.id}
                  layout
                  className={`glass border-border border rounded-3xl p-4 flex items-center gap-4 group transition-all ${goal.completed ? 'opacity-50' : ''}`}
                >
                  <button 
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${goal.completed ? 'bg-success border-success' : 'border-text-muted hover:border-accent'}`}
                  >
                    {goal.completed && <CheckCircle2 size={14} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${goal.completed ? 'line-through' : ''}`}>
                      {goal.title}
                    </p>
                    <p className="text-[10px] font-bold text-text-muted uppercase mt-0.5">
                      Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeGoal(goal.id)}
                    className="p-1.5 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Add Exam Modal */}
      <AnimatePresence>
        {showAddExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass border-border border rounded-[2rem] p-8 max-w-md w-full space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">Add New Exam</h3>
                <button onClick={() => setShowAddExam(false)} className="text-text-muted hover:text-text"><X /></button>
              </div>
              <form onSubmit={handleAddExam} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Title</label>
                  <input 
                    type="text" 
                    required
                    value={examForm.title}
                    onChange={e => setExamForm({...examForm, title: e.target.value})}
                    placeholder="Mid-term Physics"
                    className="w-full bg-surface-hover border-border border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Subject</label>
                  <select 
                    value={examForm.subject}
                    onChange={e => setExamForm({...examForm, subject: e.target.value})}
                    className="w-full bg-surface-hover border-border border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand outline-none"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Date</label>
                  <input 
                    type="date" 
                    required
                    value={examForm.date}
                    onChange={e => setExamForm({...examForm, date: e.target.value})}
                    className="w-full bg-surface-hover border-border border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-brand text-white py-3 rounded-xl font-black text-sm shadow-glow-brand hover:scale-[1.02] transition-transform">
                  Schedule Exam
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass border-border border rounded-[2rem] p-8 max-w-md w-full space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">Set New Goal</h3>
                <button onClick={() => setShowAddGoal(false)} className="text-text-muted hover:text-text"><X /></button>
              </div>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Goal Title</label>
                  <input 
                    type="text" 
                    required
                    value={goalForm.title}
                    onChange={e => setGoalForm({...goalForm, title: e.target.value})}
                    placeholder="Complete 10 Mock Tests"
                    className="w-full bg-surface-hover border-border border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Target Date</label>
                  <input 
                    type="date" 
                    required
                    value={goalForm.targetDate}
                    onChange={e => setGoalForm({...goalForm, targetDate: e.target.value})}
                    className="w-full bg-surface-hover border-border border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-accent text-white py-3 rounded-xl font-black text-sm shadow-glow-accent hover:scale-[1.02] transition-transform">
                  Set Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
