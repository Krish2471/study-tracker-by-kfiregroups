import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { useExpenses } from '../store/useExpenses';
import { useCurrency } from '../hooks/useCurrency';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

export const Transactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { expenses, deleteExpense } = useExpenses();
  const { formatAmount } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your expenses here.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex-shrink-0"
        >
          + Add Expense
        </button>
      </header>

      <div className="glass rounded-3xl overflow-hidden border border-border/50 shadow-sm">
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            <AnimatePresence>
              {expenses.map((expense) => (
                <motion.li 
                  key={expense.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 md:p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-semibold text-secondary-foreground flex-shrink-0">
                      {expense.category.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{expense.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="bg-muted px-2 py-0.5 rounded-md text-xs font-medium">{expense.category}</span>
                        <span>•</span>
                        <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">{formatAmount(expense.amount)}</span>
                    <button 
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
};
