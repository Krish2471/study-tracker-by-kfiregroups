/* eslint-disable react-hooks/purity */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTimerStore } from '../store/useTimerStore';
import { useGameStore } from '../store/useGameStore';
import { useTaskStore } from '../store/useTaskStore';
import { usePlannerStore, getSubjectColor } from '../store/usePlannerStore';
import { useExamStore } from '../store/useExamStore';
import { differenceInDays } from 'date-fns';

import { Link } from 'react-router-dom';
import {
  Flame, Clock, Zap, Timer, BookOpen, 
  Calendar, TrendingUp, CheckCircle2, CheckSquare,
  Star, GraduationCap, ChevronRight, AlertCircle, Plus, Trophy, Target
} from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../utils/constants';
import { format, isToday } from 'date-fns';


export const HomePage = () => {
  const { sessions } = useTimerStore();
  const { totalXP, streak, getLevel } = useGameStore();
  const { tasks, toggleTask } = useTaskStore();
  const { events } = usePlannerStore();
  const { exams, goals } = useExamStore();
  const [planActivated, setPlanActivated] = useState(false);

  const level = getLevel();

  const todaySessions = useMemo(() =>
    sessions.filter(s => isToday(new Date(s.startTime))),
    [sessions]
  );

  const todayMinutes = useMemo(() =>
    Math.round(todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60),
    [todaySessions]
  );

  const todaySubjects = useMemo(() => {
    const map = new Map<string, number>();
    todaySessions.forEach(s => {
      const perSub = s.duration / (s.subjects?.length || 1);
      s.subjects?.forEach(sub => map.set(sub, (map.get(sub) || 0) + perSub));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [todaySessions]);




  const quote = useMemo(() =>
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
    []
  );

  const todaysTasks = useMemo(() => tasks.slice(0, 3), [tasks]);
  const completedTasksCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
  
  const todaysEvents = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return events.filter(e => e.date === todayStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events]);



  const weakSubject = useMemo(() => {
    if (todaySubjects.length === 0) return null;
    // Find subject with least time today compared to others, or just a random one if only one
    const sorted = [...todaySubjects].sort((a, b) => a[1] - b[1]);
    return sorted[0][0];
  }, [todaySubjects]);

  const lastSession = useMemo(() => sessions[0] || null, [sessions]);

  const missedTasks = useMemo(() => {
    return tasks.filter(t => !t.completed).slice(0, 2);
  }, [tasks]);

  const weeklyXP = useMemo(() => {
    // Mock weekly XP for chart
    return [400, 600, 800, 500, 900, 1200, 700];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      {/* Top Banner - Motivational Quote */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-brand-dark to-accent p-8 text-white shadow-glow-brand">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <GraduationCap size={160} />
        </div>
        <div className="relative z-10 max-w-2xl text-center mx-auto">
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4">
              <span className="bg-gradient-to-r from-white via-brand-light to-white bg-clip-text text-transparent uppercase">HASH</span>
            </h1>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              Daily Wisdom
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black leading-tight italic">
            "{quote}"
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/timer" className="bg-white text-brand px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-lg mx-auto">
              <Timer size={18} /> Start Focus Session
            </Link>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Hours Card */}
        <div className="glass rounded-3xl p-5 border border-border group hover:border-brand/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Today's Focus</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-3xl font-black">{todayMinutes}</p>
            <p className="text-sm font-bold text-text-muted">min</p>
          </div>
          <div className="mt-4 h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand rounded-full transition-all duration-1000" 
              style={{ 
                width: todayMinutes > 0 ? `${Math.min((todayMinutes / 300) * 100, 100)}%` : '0%',
                opacity: todayMinutes > 0 ? 1 : 0
              }} 
            />
          </div>
        </div>

        {/* Streak Card */}
        <div className="glass rounded-3xl p-5 border border-border group hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Flame size={20} />
            </div>
            <Star size={16} className="text-warning fill-warning" />
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Current Streak</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-3xl font-black">{streak}</p>
            <p className="text-sm font-bold text-text-muted">days</p>
          </div>
        </div>

        {/* XP / Level Card */}
        <div className="glass rounded-3xl p-5 border border-border group hover:border-accent/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <Zap size={20} />
            </div>
            <span className="text-[10px] font-black text-text-muted">{level.emoji}</span>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Level {level.level}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-3xl font-black">{totalXP}</p>
            <p className="text-sm font-bold text-text-muted">XP</p>
          </div>
          <div className="mt-4 h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${level.progress}%` }} />
          </div>
        </div>

        {/* Tasks Card */}
        <div className="glass rounded-3xl p-5 border border-border group hover:border-success/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
              <CheckSquare size={20} />
            </div>
            <Link to="/tasks" className="text-text-muted hover:text-brand"><ChevronRight size={16}/></Link>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Tasks Done</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-3xl font-black">{completedTasksCount}</p>
            <p className="text-sm font-bold text-text-muted">/ {tasks.length}</p>
          </div>
          <p className="mt-4 text-[10px] font-bold text-text-muted">
            {tasks.length - completedTasksCount} more to reach daily target
          </p>
        </div>
      </div>

      {/* Analytics & Planning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart & Exam Countdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Activity Chart */}
          <div className="glass rounded-[2rem] p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-lg">Weekly Activity</h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">XP gained per day</p>
              </div>
              <select className="bg-surface border-border text-[10px] font-black rounded-lg px-2 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            
            <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
              {weeklyXP.map((xp, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(xp / 1200) * 100}%` }}
                      className="w-full bg-gradient-to-t from-brand/40 to-brand rounded-t-xl group-hover:to-accent transition-all duration-500 shadow-glow-brand"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border px-2 py-1 rounded text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                      {xp} XP
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-text-muted uppercase">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Goals & Exams Section (Large & Visible) */}
          {(exams.length > 0 || goals.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.length > 0 && (
                <div className="glass rounded-[2rem] p-8 border-2 border-danger/20 bg-danger/5 shadow-glow-danger/10 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-danger/20 flex items-center justify-center text-danger">
                        <Trophy size={24} />
                      </div>
                      <h3 className="font-black text-2xl text-danger uppercase tracking-tighter">Upcoming Exams</h3>
                    </div>
                    <div className="space-y-4">
                      {exams.slice(0, 1).map(exam => {
                        const daysLeft = differenceInDays(new Date(exam.date), new Date());
                        return (
                          <div key={exam.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-xl font-black text-text-primary">{exam.title}</p>
                              <p className="text-sm font-bold text-text-muted mt-1">{format(new Date(exam.date), 'MMMM do, yyyy')}</p>
                              <span className="inline-block mt-2 text-[10px] font-black text-danger bg-danger/10 px-3 py-1 rounded-full uppercase tracking-widest border border-danger/20">
                                {exam.subject}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className={`text-6xl font-black leading-none ${daysLeft <= 7 ? 'text-danger animate-pulse' : 'text-text'}`}>{daysLeft}</p>
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Days Left</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Link to="/exams" className="inline-flex items-center gap-2 text-xs font-black text-danger hover:underline mt-6">
                    View All Exams <ChevronRight size={14} />
                  </Link>
                </div>
              )}

              {goals.length > 0 && (
                <div className="glass rounded-[2rem] p-8 border-2 border-accent/20 bg-accent/5 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                        <Target size={24} />
                      </div>
                      <h3 className="font-black text-2xl text-accent uppercase tracking-tighter">Focus Goals</h3>
                    </div>
                    <div className="space-y-4">
                      {goals.filter(g => !g.completed).slice(0, 1).map(goal => (
                        <div key={goal.id}>
                          <p className="text-xl font-black text-text-primary">{goal.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar size={14} className="text-accent" />
                            <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link to="/exams" className="inline-flex items-center gap-2 text-xs font-black text-accent hover:underline mt-6">
                    Manage My Goals <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Latest Session & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lastSession ? (
              <div className="glass border-border border rounded-[2rem] p-6 flex flex-col justify-between hover:border-brand/30 transition-all">
                <div>
                  <div className="flex items-center gap-2 text-brand mb-2">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Latest Session</span>
                  </div>
                  <h4 className="text-lg font-black">{lastSession.subjects?.join(', ') || 'Recent Session'}</h4>
                  <p className="text-[10px] font-bold text-text-muted mt-0.5">
                    {lastSession.startTime ? format(new Date(lastSession.startTime), 'MMM d, h:mm a') : 'Recently'}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xl font-black">{Math.round(lastSession.duration / 60)}m</p>
                      <p className="text-[9px] font-bold text-text-muted uppercase">Duration</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-coin">+{lastSession.coinsEarned}</p>
                      <p className="text-[9px] font-bold text-text-muted uppercase">Coins</p>
                    </div>
                  </div>
                  <Link to="/progress" className="p-2 rounded-xl bg-surface-hover hover:bg-border transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="glass border-border border rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center text-text-muted mb-4">
                  <BookOpen size={24} />
                </div>
                <h4 className="font-bold text-sm">No Sessions Yet</h4>
                <p className="text-[10px] text-text-muted mt-1">Start your first session to see stats here.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Link to="/notebook" className="glass border-border border rounded-[2rem] p-4 flex flex-col items-center justify-center text-center hover:border-brand/20 transition-all group">
                <BookOpen size={20} className="text-brand mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Notes</span>
              </Link>
              <Link to="/planner" className="glass border-border border rounded-[2rem] p-4 flex flex-col items-center justify-center text-center hover:border-brand/20 transition-all group">
                <Calendar size={20} className="text-accent mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Planner</span>
              </Link>
              <Link to="/flashcards" className="glass border-border border rounded-[2rem] p-4 flex flex-col items-center justify-center text-center hover:border-brand/20 transition-all group">
                <Zap size={20} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Cards</span>
              </Link>
              <Link to="/progress" className="glass border-border border rounded-[2rem] p-4 flex flex-col items-center justify-center text-center hover:border-brand/20 transition-all group">
                <TrendingUp size={20} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Stats</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Tasks */}
        <div className="space-y-6">
          {/* Quick Tasks */}
          <div className="glass rounded-[2rem] p-6 border border-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg">Quick Tasks</h3>
              <Link to="/tasks" className="text-brand p-1 hover:bg-brand/10 rounded-lg"><Plus size={18}/></Link>
            </div>
            <div className="space-y-2">
              {todaysTasks.map(task => (
                <button 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-surface/50 border border-border hover:border-brand/20 transition-all text-left group"
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-success border-success' : 'border-text-muted'}`}>
                    {task.completed && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className={`text-xs font-bold truncate flex-1 ${task.completed ? 'line-through text-text-muted' : ''}`}>
                    {task.title}
                  </span>
                </button>
              ))}
              {todaysTasks.length === 0 && (
                <p className="text-center text-text-muted py-4 text-[10px] font-bold">No pending tasks</p>
              )}
            </div>
          </div>

          {/* Today's Plan */}
          <div className="glass rounded-[2rem] p-6 border border-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg">Today's Plan</h3>
              <Link to="/planner" className="text-brand p-1 hover:bg-brand/10 rounded-lg"><ChevronRight size={18}/></Link>
            </div>
            
            {todaysEvents.length === 0 ? (
              <p className="text-center text-text-muted py-8 text-xs font-bold italic">No plans for today yet!</p>
            ) : (
              <div className="space-y-3">
                {todaysEvents.map(event => (
                  <div key={event.id} className="relative pl-4 group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-brand/20 group-hover:bg-brand transition-colors" style={{ backgroundColor: event.isCompleted ? '#10b981' : (event.color || getSubjectColor(event.subject)) }} />
                    <p className={`text-xs font-black truncate ${event.isCompleted ? 'line-through text-text-muted' : ''}`}>{event.title}</p>
                    <p className="text-[9px] font-bold text-text-muted uppercase mt-0.5">{event.startTime} - {event.endTime}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          <div className="bg-surface border border-border rounded-[2rem] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <Star size={14} className="fill-brand" />
              </div>
              <h3 className="font-black text-sm">Smart Insights</h3>
            </div>
            
            {weakSubject && (
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-danger/5 border border-danger/10">
                <AlertCircle size={16} className="text-danger mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-danger uppercase">Weak Subject Alert</p>
                  <p className="text-[11px] font-bold mt-1">You've spent less time on **{weakSubject}** lately. Boost your focus here!</p>
                </div>
              </div>
            )}

            {missedTasks.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-warning/5 border border-warning/10">
                <TrendingUp size={16} className="text-warning mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-warning uppercase">Recovery Suggestion</p>
                  <p className="text-[11px] font-bold mt-1">Finish "{missedTasks[0].title}" to get back on track for your daily goal.</p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-bg border border-border italic text-[11px] leading-relaxed text-text-secondary">
              "Based on your recent activity, try a 25-minute Pomodoro for **{todaySubjects[0]?.[0] || 'your favorite subject'}** to maintain your streak."
            </div>
            <button 
              onClick={() => setPlanActivated(true)}
              className={`w-full py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                planActivated 
                  ? 'bg-success text-white border-success shadow-glow-success scale-[1.02]' 
                  : 'bg-surface-hover hover:bg-border text-text-secondary border-border'
              }`}
            >
              {planActivated ? 'Plan Activated' : 'Accept Focus Plan'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
