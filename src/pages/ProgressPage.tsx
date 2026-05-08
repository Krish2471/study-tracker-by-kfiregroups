import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTimerStore } from '../store/useTimerStore';
import { useGameStore } from '../store/useGameStore';
import {
  format, isToday, isThisWeek, isThisMonth, isThisYear, startOfDay,
  eachDayOfInterval, subDays, startOfWeek, endOfWeek,
  subMonths, isSameDay, isSameMonth,
} from 'date-fns';
import { Clock, TrendingUp, BookOpen, Target, Flame, Calendar, BarChart3, Star } from 'lucide-react';

type TimeRange = 'day' | 'week' | 'month' | 'year';

export const ProgressPage = () => {
  const { sessions } = useTimerStore();
  const { streak } = useGameStore();
  const [activeRange, setActiveRange] = useState<TimeRange>('day');

  const stats = useMemo(() => {
    const todayTotal = sessions.filter(s => isToday(new Date(s.startTime))).reduce((a, c) => a + c.duration, 0);
    const weekTotal = sessions.filter(s => isThisWeek(new Date(s.startTime))).reduce((a, c) => a + c.duration, 0);
    const monthTotal = sessions.filter(s => isThisMonth(new Date(s.startTime))).reduce((a, c) => a + c.duration, 0);
    const yearTotal = sessions.filter(s => isThisYear(new Date(s.startTime))).reduce((a, c) => a + c.duration, 0);
    const allTimeTotal = sessions.reduce((a, c) => a + c.duration, 0);

    // Per-subject breakdown for each range
    const subjectBreakdown = (filterFn: (d: Date) => boolean) => {
      const map = new Map<string, number>();
      sessions.filter(s => filterFn(new Date(s.startTime))).forEach(s => {
        const perSub = s.duration / s.subjects.length;
        s.subjects.forEach(sub => {
          map.set(sub, (map.get(sub) || 0) + perSub);
        });
      });
      return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    };

    const daySubjects = subjectBreakdown(isToday);
    const weekSubjects = subjectBreakdown(isThisWeek);
    const monthSubjects = subjectBreakdown(isThisMonth);
    const yearSubjects = subjectBreakdown(isThisYear);

    // 7-day chart
    const today = startOfDay(new Date());
    const days7 = eachDayOfInterval({ start: subDays(today, 6), end: today });
    const dailyData = days7.map(day => {
      const dayTotal = sessions
        .filter(s => isSameDay(new Date(s.startTime), day))
        .reduce((a, c) => a + c.duration, 0);
      return { label: format(day, 'EEE'), minutes: Math.round(dayTotal / 60), date: day };
    });

    // Weekly chart (last 8 weeks)
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(today, i * 7));
      const weekEnd = endOfWeek(weekStart);
      const weekTotal = sessions
        .filter(s => {
          const d = new Date(s.startTime);
          return d >= weekStart && d <= weekEnd;
        })
        .reduce((a, c) => a + c.duration, 0);
      weeks.push({ label: format(weekStart, 'MMM d'), minutes: Math.round(weekTotal / 60) });
    }

    // Monthly chart (last 12 months)
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const m = subMonths(today, i);
      const mTotal = sessions
        .filter(s => isSameMonth(new Date(s.startTime), m))
        .reduce((a, c) => a + c.duration, 0);
      months.push({ label: format(m, 'MMM'), minutes: Math.round(mTotal / 60) });
    }

    // Heatmap data (last 365 days)
    const heatmapDays = eachDayOfInterval({ start: subDays(today, 364), end: today });
    const heatmap = heatmapDays.map(day => {
      const dayTotal = sessions
        .filter(s => isSameDay(new Date(s.startTime), day))
        .reduce((a, c) => a + c.duration, 0);
      return { date: day, minutes: Math.round(dayTotal / 60) };
    });

    // Best streak
    let bestStreak = 0;
    let currentStreak = 0;
    const sortedDays = [...new Set(sessions.map(s => format(new Date(s.startTime), 'yyyy-MM-dd')))].sort();
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diff = (curr.getTime() - prev.getTime()) / 86400000;
        currentStreak = diff === 1 ? currentStreak + 1 : 1;
      }
      bestStreak = Math.max(bestStreak, currentStreak);
    }

    const monthlySummary = {
      totalSessions: sessions.filter(s => isThisMonth(new Date(s.startTime))).length,
      avgSessionLength: Math.round(monthTotal / (sessions.filter(s => isThisMonth(new Date(s.startTime))).length || 1) / 60),
      topSubject: monthSubjects[0]?.[0] || 'None',
    };

    return {
      todayTotal, weekTotal, monthTotal, yearTotal, allTimeTotal,
      daySubjects, weekSubjects, monthSubjects, yearSubjects,
      dailyData, weeks, months, heatmap, bestStreak, monthlySummary
    };
  }, [sessions]);

  const fmtHours = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.round((secs % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const getSubjectData = () => {
    switch (activeRange) {
      case 'day': return stats.daySubjects;
      case 'week': return stats.weekSubjects;
      case 'month': return stats.monthSubjects;
      case 'year': return stats.yearSubjects;
    }
  };

  const getChartData = () => {
    switch (activeRange) {
      case 'day': return stats.dailyData;
      case 'week': return stats.weeks;
      case 'month': return stats.months;
      case 'year': return stats.months; // reuse monthly for yearly
    }
  };

  const chartData = getChartData();
  const maxChartVal = Math.max(...chartData.map(d => d.minutes), 1);
  const subjectData = getSubjectData();
  const totalForRange = subjectData.reduce((a, [, secs]) => a + secs, 0) || 1;

  // Heatmap color intensity
  const getHeatmapColor = (mins: number) => {
    if (mins === 0) return 'bg-border';
    if (mins < 15) return 'bg-brand/20';
    if (mins < 30) return 'bg-brand/40';
    if (mins < 60) return 'bg-brand/60';
    if (mins < 120) return 'bg-brand/80';
    return 'bg-brand';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-black">Progress</h1>
        <p className="text-text-muted text-sm mt-1">Track your study journey</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><Flame size={16} /></div>
          </div>
          <p className="text-2xl font-black">{streak}</p>
          <p className="text-[10px] font-bold text-text-muted uppercase">Current Streak</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand"><Target size={16} /></div>
          </div>
          <p className="text-2xl font-black">{stats.bestStreak}</p>
          <p className="text-[10px] font-bold text-text-muted uppercase">Best Streak</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-black">{fmtHours(stats.todayTotal)}</p>
          <p className="text-[10px] font-bold text-text-muted uppercase">Today</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><TrendingUp size={16} /></div>
          </div>
          <p className="text-2xl font-black">{fmtHours(stats.weekTotal)}</p>
          <p className="text-[10px] font-bold text-text-muted uppercase">This Week</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-border col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning"><BookOpen size={16} /></div>
          </div>
          <p className="text-2xl font-black">{fmtHours(stats.allTimeTotal)}</p>
          <p className="text-[10px] font-bold text-text-muted uppercase">All Time</p>
        </div>
      </div>

      {/* Time Range Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl border border-border p-1 w-fit">
        {[
          { key: 'day' as const, label: 'Daily' },
          { key: 'week' as const, label: 'Weekly' },
          { key: 'month' as const, label: 'Monthly' },
          { key: 'year' as const, label: 'Yearly' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveRange(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeRange === tab.key ? 'bg-brand text-white shadow-glow' : 'text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="glass rounded-3xl p-6 border border-border">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          <BarChart3 size={18} className="text-brand" />
          {activeRange === 'day' ? 'Last 7 Days' : activeRange === 'week' ? 'Last 8 Weeks' : 'Last 12 Months'}
        </h2>
        <div className="flex items-end justify-between gap-1 md:gap-2 h-48">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {d.minutes > 0 && (
                <p className="text-[9px] font-bold text-text-secondary">{d.minutes}m</p>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.minutes / maxChartVal) * 100, d.minutes > 0 ? 4 : 0)}%` }}
                transition={{ delay: i * 0.03, duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-brand to-accent min-h-[2px]"
              />
              <p className="text-[9px] font-bold text-text-muted truncate max-w-full">{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Subject Breakdown */}
      <div className="glass rounded-3xl p-6 border border-border">
        <h2 className="text-lg font-bold mb-5">
          Subject Breakdown — {activeRange === 'day' ? 'Today' : activeRange === 'week' ? 'This Week' : activeRange === 'month' ? 'This Month' : 'This Year'}
        </h2>
        {subjectData.length === 0 ? (
          <p className="text-center text-text-muted py-6">No data for this period</p>
        ) : (
          <div className="space-y-4">
            {subjectData.map(([subject, seconds]) => {
              const pct = Math.round((seconds / totalForRange) * 100);
              return (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-sm">{subject}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{fmtHours(seconds)}</span>
                      <span className="text-xs font-bold text-brand">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                      className="level-bar h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Summary Card */}
      <div className="bg-gradient-to-br from-brand/10 to-accent/10 border border-brand/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-5">
          <TrendingUp size={150} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Star size={20} className="text-brand fill-brand" /> Monthly Performance Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Sessions</p>
              <p className="text-3xl font-black">{stats.monthlySummary.totalSessions}</p>
              <p className="text-xs text-brand font-bold mt-1">Focus blocks completed</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Avg. Session</p>
              <p className="text-3xl font-black">{stats.monthlySummary.avgSessionLength}m</p>
              <p className="text-xs text-accent font-bold mt-1">Intensity score: High</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Dominant Subject</p>
              <p className="text-3xl font-black">{stats.monthlySummary.topSubject}</p>
              <p className="text-xs text-success font-bold mt-1">Mastery in progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Heatmap */}
      {activeRange === 'year' && (
        <div className="glass rounded-3xl p-6 border border-border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-brand" /> Study Heatmap
          </h2>
          <div className="overflow-x-auto">
            <div className="flex gap-[3px] min-w-[700px]">
              {/* Group by weeks */}
              {Array.from({ length: 53 }).map((_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const idx = weekIdx * 7 + dayIdx;
                    const data = stats.heatmap[idx];
                    if (!data) return <div key={dayIdx} className="w-3 h-3" />;
                    return (
                      <div
                        key={dayIdx}
                        className={`w-3 h-3 rounded-sm ${getHeatmapColor(data.minutes)} transition-colors`}
                        title={`${format(data.date, 'MMM d, yyyy')}: ${data.minutes}m`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-[10px] text-text-muted">
            <span>Less</span>
            <div className="flex gap-[2px]">
              {['bg-border', 'bg-brand/20', 'bg-brand/40', 'bg-brand/60', 'bg-brand/80', 'bg-brand'].map(c => (
                <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      )}

      {/* Session History */}
      <div className="glass rounded-3xl p-6 border border-border">
        <h2 className="text-lg font-bold mb-5">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-center text-text-muted py-6">No sessions recorded yet.</p>
        ) : (
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {sessions.slice(0, 20).map((s) => (
              <li key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div>
                  <p className="font-semibold text-sm">{s.subjects.join(', ')}</p>
                  <p className="text-xs text-text-muted">{format(new Date(s.startTime), 'MMM d, yyyy · h:mm a')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{fmtHours(s.duration)}</p>
                  <p className="text-xs text-coin font-semibold">+{s.coinsEarned} 🪙</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};
