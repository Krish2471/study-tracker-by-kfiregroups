import React from 'react';
import { motion } from 'framer-motion';
import { usePreferences, SUPPORTED_CURRENCIES, type Currency } from '../store/usePreferences';
import { useAuth } from '../store/useAuth';

export const Settings = () => {
  const { currency, setCurrency } = usePreferences();
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and profile.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Currency Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Base Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-shadow cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground mt-2 ml-1">This will instantly update all your financial views across the application.</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1 ml-1">Name</label>
              <p className="px-4 py-3 bg-muted/50 rounded-xl font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1 ml-1">Email</label>
              <p className="px-4 py-3 bg-muted/50 rounded-xl font-medium">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
