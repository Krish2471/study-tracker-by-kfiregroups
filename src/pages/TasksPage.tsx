import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../store/useTaskStore';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export const TasksPage = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const [newTask, setNewTask] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-black">Tasks</h1>
        <p className="text-text-muted text-sm mt-1">Manage your daily study tasks</p>
      </header>

      <div className="glass rounded-3xl p-6 border border-border">
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="bg-brand text-white px-5 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </form>

        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  task.completed ? 'bg-surface border-border opacity-60' : 'bg-surface border-brand/20'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 text-text-muted hover:text-brand transition-colors relative"
                >
                  <AnimatePresence>
                    {task.completed ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                      >
                        <CheckCircle2 size={24} className="text-success" />
                      </motion.div>
                    ) : (
                      <Circle size={24} />
                    )}
                  </AnimatePresence>
                </button>
                <span className={`flex-1 text-sm font-semibold transition-all ${task.completed ? 'line-through text-text-muted' : ''}`}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 md:opacity-100 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-text-muted py-8 text-sm">No tasks yet. Add some to stay productive!</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
