import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/useAuth';
import { useExpenses } from '../store/useExpenses';
import { useCurrency } from '../hooks/useCurrency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { startOfMonth, isAfter, format } from 'date-fns';
import { AIBot } from '../components/dashboard/AIBot';
import { Link } from 'react-router-dom';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
import { Logo } from '../components/common/Logo';

export const Dashboard = () => {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const { formatAmount } = useCurrency();

  const { totalBalance, monthlySpending, categoryData, monthlyTrend } = useMemo(() => {
    // 1. Total Balance calculation (simplified: assuming starting balance of $10,000 for demo)
    const initialBalance = 10000;
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBalance = initialBalance - totalSpent;

    // 2. Monthly Spending
    const startOfCurrentMonth = startOfMonth(new Date());
    const monthlyExpenses = expenses.filter(e => isAfter(new Date(e.date), startOfCurrentMonth));
    const monthlySpending = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Category Data for Pie Chart
    const catMap = new Map<string, number>();
    expenses.forEach(e => {
      catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
    });
    const categoryData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));

    // 4. Monthly Trend Data for Bar Chart (last 6 months simplified, grouping by month)
    const trendMap = new Map<string, number>();
    expenses.forEach(e => {
      const monthYear = format(new Date(e.date), 'MMM yyyy');
      trendMap.set(monthYear, (trendMap.get(monthYear) || 0) + e.amount);
    });
    const monthlyTrend = Array.from(trendMap.entries())
      .map(([name, value]) => ({ name, value }))
      .reverse(); // Simplified ordering

    return { totalBalance, monthlySpending, categoryData, monthlyTrend };
  }, [expenses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Here is your financial overview.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
          <Logo size={24} />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Kfire Groups Certified</span>
        </div>
      </header>

      <AIBot />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 md:p-8 rounded-3xl glass border border-border/50 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Balance</h3>
          <p className="text-4xl md:text-5xl font-bold tracking-tight">{formatAmount(totalBalance)}</p>
          <p className="text-sm text-success mt-3 font-medium">+2.5% from last month</p>
        </div>
        <div className="p-6 md:p-8 rounded-3xl glass border border-border/50 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Monthly Spending</h3>
          <p className="text-4xl md:text-5xl font-bold tracking-tight">{formatAmount(monthlySpending)}</p>
          <p className="text-sm text-destructive mt-3 font-medium">+12% from last month</p>
        </div>
        <div className="p-6 md:p-8 rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <Logo size={100} />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-2">Savings Goal</h3>
          <p className="text-4xl md:text-5xl font-bold tracking-tight">{formatAmount(5000)}</p>
          <div className="w-full bg-primary-foreground/20 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-primary-foreground h-full rounded-full" style={{ width: '45%' }} />
          </div>
          <p className="text-sm opacity-90 mt-2">45% achieved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Spending by Category</h3>
          <div className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatAmount(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Monthly Trend</h3>
          <div className="h-[300px]">
             {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    formatter={(value: number) => formatAmount(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm font-medium text-primary hover:underline">View All</Link>
        </div>
        
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {expenses.slice(0, 5).map((expense) => (
              <li key={expense.id} className="py-4 flex items-center justify-between hover:bg-muted/30 transition-colors -mx-4 px-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-secondary-foreground text-sm flex-shrink-0">
                    {expense.category.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm md:text-base">{expense.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="bg-muted px-1.5 py-0.5 rounded-md">{expense.category}</span> • {format(new Date(expense.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm md:text-base">{formatAmount(expense.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};
