import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlannerStore, getSubjectColor, type PlannerEvent } from '../store/usePlannerStore';
import { useTaskStore } from '../store/useTaskStore';
import { useSubjectsStore } from '../store/useSubjectsStore';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Plus, X, Check, Trash2, Clock,
  CalendarDays, LayoutGrid, List, Edit2, CheckSquare, CheckCircle2, Circle, ArrowRight, Trophy
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
  addMonths, subMonths, isSameMonth, isToday, addWeeks, subWeeks, differenceInDays,
} from 'date-fns';

export const PlannerPage = () => {
  const { events, selectedDate, viewMode, addEvent, updateEvent, deleteEvent, toggleComplete, setSelectedDate, setViewMode } = usePlannerStore();
  const { subjects, addSubject } = useSubjectsStore();
  const { tasks, toggleTask } = useTaskStore();

  const [showNewEvent, setShowNewEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subject: subjects[0] || '',
    date: selectedDate,
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
    color: '',
  });

  const currentDate = new Date(selectedDate + 'T00:00:00');

  // Calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [selectedDate]);

  // Week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [selectedDate]);

  const getEventsForDate = (dateStr: string) =>
    events.filter((e) => e.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const selectedEvents = getEventsForDate(selectedDate);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const d = currentDate;
    if (viewMode === 'month') {
      const newDate = direction === 'prev' ? subMonths(d, 1) : addMonths(d, 1);
      setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    } else if (viewMode === 'week') {
      const newDate = direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1);
      setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    } else {
      const newDate = new Date(d);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
      setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    }
  };

  const openNewEvent = (date?: string) => {
    setFormData({
      title: '',
      subject: subjects[0] || '',
      date: date || selectedDate,
      startTime: '09:00',
      endTime: '10:00',
      notes: '',
      color: '',
    });
    setEditingEvent(null);
    setShowNewEvent(true);
  };

  const openEditEvent = (event: PlannerEvent) => {
    setFormData({
      title: event.title,
      subject: event.subject,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      notes: event.notes,
      color: event.color,
    });
    setEditingEvent(event);
    setShowNewEvent(true);
  };

  const handleSaveEvent = () => {
    if (!formData.title.trim() || !formData.subject) return;
    const eventData = {
      title: formData.title.trim(),
      subject: formData.subject,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes,
      color: formData.color || getSubjectColor(formData.subject),
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    setShowNewEvent(false);
    setEditingEvent(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Planner</h1>
          <p className="text-text-muted text-sm mt-1">Plan your study sessions</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Tabs */}
          <div className="flex bg-surface rounded-xl border border-border p-1">
            {[
              { mode: 'month' as const, icon: LayoutGrid, label: 'Month' },
              { mode: 'week' as const, icon: CalendarDays, label: 'Week' },
              { mode: 'day' as const, icon: List, label: 'Day' },
            ].map((v) => (
              <button
                key={v.mode}
                onClick={() => setViewMode(v.mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === v.mode ? 'bg-brand text-white' : 'text-text-muted hover:text-text'
                }`}
              >
                <v.icon size={12} />{v.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => openNewEvent()}
            className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Event
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="flex items-center justify-between glass rounded-2xl px-4 py-3 border border-border">
        <button onClick={() => handleNavigate('prev')} className="p-2 rounded-xl hover:bg-surface-hover transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-bold text-lg">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d')}`}
            {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
          </p>
          {!isToday(currentDate) && (
            <button
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
              className="text-[10px] font-bold text-brand hover:text-brand-dark"
            >
              Go to Today
            </button>
          )}
        </div>
        <button onClick={() => handleNavigate('next')} className="p-2 rounded-xl hover:bg-surface-hover transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="glass rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayEvents = getEventsForDate(dayStr);
              const isSelected = dayStr === selectedDate;
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDate(dayStr)}
                  className={`min-h-[80px] p-1.5 text-left border-b border-r border-border transition-colors relative ${
                    isSelected ? 'bg-brand/10' : 'hover:bg-surface-hover'
                  } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  <span className={`text-xs font-bold inline-block w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday(day) ? 'bg-brand text-white' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className={`text-[10px] font-black truncate px-2 py-1.5 rounded-lg shadow-sm mb-1 ${e.isCompleted ? 'line-through opacity-50' : ''} ${(e.isExam || e.id.startsWith('task-')) ? 'text-white' : ''}`}
                        style={{ backgroundColor: e.color || (e.id.startsWith('task-') ? '#064e3b' : (e.isExam ? '#991b1b' : `${getSubjectColor(e.subject)}20`)), color: (e.isExam || e.id.startsWith('task-')) ? 'white' : (e.color || getSubjectColor(e.subject)) }}
                      >
                        {(e.isExam || e.id.startsWith('task-')) && (
                          <span className="mr-1">{e.isExam ? '🔥' : '✅'}</span>
                        )}
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[9px] text-text-muted font-bold">+{dayEvents.length - 3} more</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="glass rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-border">
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayEvents = getEventsForDate(dayStr);
              const isSelected = dayStr === selectedDate;

              return (
                <div key={dayStr} className={`min-h-[300px] ${isSelected ? 'bg-brand/5' : ''}`}>
                  <button
                    onClick={() => setSelectedDate(dayStr)}
                    className={`w-full text-center py-3 border-b border-border ${isToday(day) ? 'bg-brand/10' : ''}`}
                  >
                    <p className="text-[10px] font-bold text-text-muted uppercase">{format(day, 'EEE')}</p>
                    <p className={`text-lg font-black ${isToday(day) ? 'text-brand' : ''}`}>{format(day, 'd')}</p>
                  </button>
                  <div className="p-1.5 space-y-1">
                    {dayEvents.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => openEditEvent(e)}
                        className={`w-full text-left p-3 rounded-xl text-[11px] transition-all hover:scale-[1.02] ${e.isCompleted ? 'opacity-50' : ''} ${(e.isExam || e.id.startsWith('task-')) ? 'text-white border-none shadow-lg py-4' : ''}`}
                        style={{ backgroundColor: e.color || (e.id.startsWith('task-') ? '#064e3b' : (e.isExam ? '#991b1b' : `${e.color || getSubjectColor(e.subject)}15`)), borderLeft: !(e.isExam || e.id.startsWith('task-')) ? `4px solid ${e.color || getSubjectColor(e.subject)}` : 'none' }}
                      >
                        <p className="font-black truncate flex items-center gap-2">
                          {e.isExam && <span className="text-[9px] bg-white/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">EXAM</span>}
                          {e.id.startsWith('task-') && <span className="text-[9px] bg-white/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">TASK</span>}
                          {e.title}
                        </p>
                        <p className={`mt-1 font-bold text-[10px] ${(e.isExam || e.id.startsWith('task-')) ? 'text-white/80' : 'text-text-muted'}`}>{e.startTime} - {e.endTime}</p>
                      </button>
                    ))}
                    <button
                      onClick={() => openNewEvent(dayStr)}
                      className="w-full text-center text-[10px] text-text-muted hover:text-brand py-1 transition-colors"
                    >
                      <Plus size={12} className="inline" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View / Selected Day Events */}
      {(viewMode === 'day' || viewMode === 'month') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">
                {viewMode === 'day' ? 'Schedule' : format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMM d')}
              </h2>
              <span className="text-xs font-bold text-text-muted">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</span>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays size={36} className="mx-auto text-text-muted/20 mb-2" />
                <p className="text-text-muted text-sm">No events scheduled</p>
                <button
                  onClick={() => openNewEvent()}
                  className="mt-3 text-brand font-semibold text-sm hover:text-brand-dark flex items-center gap-1 mx-auto"
                >
                  <Plus size={14} /> Add one
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Goals & Exams Section */}
                {selectedEvents.filter(e => e.isExam).length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-danger uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Trophy size={12} /> Goals & Exams
                    </h3>
                    <ul className="space-y-2">
                      {selectedEvents.filter(e => e.isExam).map((event) => (
                        <motion.li
                          key={event.id}
                          layout
                          className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-surface-hover bg-danger/5 border border-danger/10"
                          style={{ borderLeft: `4px solid #991b1b` }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-danger">{event.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-danger/80">{event.subject}</span>
                              <span className="text-[10px] text-text-muted flex items-center gap-0.5"><Clock size={9} />{event.startTime} - {event.endTime}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEditEvent(event)} className="p-1.5 rounded-lg hover:bg-danger/10 text-danger">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => deleteEvent(event.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-danger/60">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Regular Tasks/Sessions Section */}
                <div>
                  <h3 className="text-[10px] font-black text-brand uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckSquare size={12} /> Daily Tasks
                  </h3>
                  <ul className="space-y-2">
                    {selectedEvents.filter(e => !e.isExam).map((event) => (
                      <motion.li
                        key={event.id}
                        layout
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-surface-hover ${event.isCompleted ? 'opacity-60' : ''}`}
                        style={{ borderLeft: `4px solid ${event.color || getSubjectColor(event.subject)}` }}
                      >
                        <button
                          onClick={() => toggleComplete(event.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            event.isCompleted ? 'bg-success border-success' : 'border-text-muted hover:border-brand'
                          }`}
                        >
                          {event.isCompleted && <Check size={12} className="text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${event.isCompleted ? 'line-through' : ''}`}>{event.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold" style={{ color: event.color || getSubjectColor(event.subject) }}>{event.subject}</span>
                            <span className="text-[10px] text-text-muted flex items-center gap-0.5"><Clock size={9} />{event.startTime} - {event.endTime}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditEvent(event)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteEvent(event.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Tasks Block */}
          <div className="glass rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><CheckSquare size={18} className="text-brand"/> Daily Tasks</h2>
              <Link to="/tasks" className="text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1">View All <ArrowRight size={14} /></Link>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare size={36} className="mx-auto text-text-muted/30 mb-2" />
                <p className="text-text-muted text-sm">No tasks pending</p>
                <Link to="/tasks" className="mt-3 text-brand font-semibold text-sm hover:text-brand-dark flex items-center gap-1 mx-auto w-fit">
                  <Plus size={14} /> Add one
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <li key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${task.completed ? 'bg-surface border-border opacity-60' : 'bg-surface border-brand/20'}`}>
                    <button onClick={() => toggleTask(task.id)} className="text-text-muted hover:text-brand">
                      {task.completed ? <CheckCircle2 size={18} className="text-success" /> : <Circle size={18} />}
                    </button>
                    <p className={`font-semibold text-sm truncate ${task.completed ? 'line-through text-text-muted' : ''}`}>{task.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Persistent Upcoming Exams Section */}
      <section className="glass rounded-2xl p-6 border border-border mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Trophy size={22} className="text-danger" /> Upcoming Exams
          </h2>
          <Link to="/exams" className="text-sm font-bold text-brand hover:underline">Manage Exams</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.filter(e => e.isExam).sort((a, b) => a.date.localeCompare(b.date)).map(exam => {
            const daysLeft = differenceInDays(new Date(exam.date + 'T00:00:00'), new Date());
            if (daysLeft < 0) return null; // Don't show past exams
            
            return (
              <motion.div 
                key={exam.id}
                whileHover={{ y: -2 }}
                className="bg-surface-hover border border-border rounded-2xl p-4 flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-black text-sm truncate max-w-[150px]">{exam.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-danger bg-danger/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {exam.subject}
                    </span>
                    <span className="text-[9px] font-bold text-text-muted">
                      {format(new Date(exam.date + 'T00:00:00'), 'MMM d')}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-xl font-black ${daysLeft <= 7 ? 'text-danger animate-pulse' : 'text-text'}`}>
                      {daysLeft}
                    </span>
                    <span className="text-[8px] font-black text-text-muted uppercase">Days</span>
                  </div>
                  <button 
                    onClick={() => openEditEvent(exam)}
                    className="text-[8px] font-black text-brand hover:underline uppercase tracking-tighter mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            );
          })}
          {events.filter(e => e.isExam && differenceInDays(new Date(e.date + 'T00:00:00'), new Date()) >= 0).length === 0 && (
            <div className="col-span-full py-8 text-center text-text-muted italic text-sm">
              No upcoming exams scheduled. 
              <Link to="/exams" className="text-brand font-black ml-2 not-italic">Add one now →</Link>
            </div>
          )}
        </div>
      </section>

      {/* Event Form Modal */}
      <AnimatePresence>
        {showNewEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => { setShowNewEvent(false); setEditingEvent(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 border border-border max-w-md w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{editingEvent ? 'Edit Event' : 'New Study Event'}</h3>
                <button onClick={() => { setShowNewEvent(false); setEditingEvent(null); }} className="p-1.5 rounded-lg hover:bg-surface-hover">
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Study Chapter 5"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setAddingSubject(true);
                    } else {
                      setFormData({ ...formData, subject: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="__add_new__">+ Other</option>
                </select>
                {addingSubject && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="New subject name..."
                      className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSubjectName.trim()) {
                          addSubject(newSubjectName.trim());
                          setFormData({ ...formData, subject: newSubjectName.trim() });
                          setNewSubjectName('');
                          setAddingSubject(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newSubjectName.trim()) {
                          addSubject(newSubjectName.trim());
                          setFormData({ ...formData, subject: newSubjectName.trim() });
                          setNewSubjectName('');
                          setAddingSubject(false);
                        }
                      }}
                      className="px-3 py-2 bg-brand text-white rounded-xl text-sm font-bold"
                    >Add</button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Start</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">End</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Color Palette</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#064e3b', '#991b1b'
                  ].map(c => (
                    <button
                      key={c}
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'scale-110 border-brand shadow-lg' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSaveEvent}
                className="w-full py-3 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand-dark transition-colors shadow-glow"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
