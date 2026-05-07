import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getAccountId, setAccountId } from '../lib/storage';

import { useProfileStore, type StudentProfile } from '../store/useProfileStore';
import { useGameStore } from '../store/useGameStore';
import { useTimerStore } from '../store/useTimerStore';
import { useSubjectsStore } from '../store/useSubjectsStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  Camera, Save, User, BookOpen, School, Calendar, Target,
  Heart, Clock, Trophy, Flame, Star, Edit3, Plus, X, Trash2, Mail, Phone, Image as ImageIcon,
  Users
} from 'lucide-react';

export const ProfilePage = () => {
  const { profile, updateProfile, setPhoto } = useProfileStore();
  const { totalXP, streak, coins, getLevel } = useGameStore();
  const { sessions } = useTimerStore();
  const { subjects, addSubject, removeSubject } = useSubjectsStore();
  const { user, signOut } = useAuthStore();
  const level = getLevel();
  const currentAccountId = getAccountId();


  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<StudentProfile>({
    ...profile,
    name: profile.name || user?.displayName || '',
    email: profile.email || user?.email || '',
  });
  const [newSubject, setNewSubject] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [error] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalHours = Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 3600);
  const totalSessions = sessions.length;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhoto(dataUrl);
      if (isEditing) {
        setEditData({ ...editData, photoUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      addSubject(newSubject.trim());
      setNewSubject('');
      setShowAddSubject(false);
    }
  };

  const displayName = profile.name || user?.displayName || 'Student';
  const displayPhoto = profile.photoUrl || user?.photoURL || '';

  const stats = [
    { icon: Clock, label: 'Total Study', value: `${totalHours}h`, color: 'text-brand' },
    { icon: Flame, label: 'Streak', value: `${streak} days`, color: 'text-orange-500' },
    { icon: Trophy, label: 'Coins', value: `${coins}`, color: 'text-yellow-500' },
    { icon: Star, label: 'XP', value: `${totalXP}`, color: 'text-accent' },
    { icon: BookOpen, label: 'Sessions', value: `${totalSessions}`, color: 'text-emerald-500' },
    { icon: Target, label: 'Level', value: `${level.level}`, color: 'text-purple-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">My Profile</h1>
          <p className="text-text-muted text-sm mt-1">Your student information & stats</p>
          {error && <p className="text-danger text-xs font-bold mt-2 animate-bounce">{error}</p>}
        </div>
        {!isEditing ? (
          <button
            onClick={() => { setEditData(profile); setIsEditing(true); }}
            className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors flex items-center gap-1.5"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-border hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors flex items-center gap-1.5"
            >
              <Save size={14} /> Save
            </button>
          </div>
        )}
      </header>

      {/* Profile Card */}
      <div className="glass rounded-3xl border border-border overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-brand via-accent to-brand-light relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-40" />
        </div>

        {/* Avatar & Name */}
        <div className="px-6 pb-6 -mt-14">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            {/* Photo */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-surface bg-surface overflow-hidden shadow-lg">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand/20 to-accent/20 flex items-center justify-center">
                    <User size={40} className="text-text-muted" />
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon size={32} className="text-white drop-shadow-md" />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 px-3 py-1.5 rounded-full bg-brand text-white flex items-center justify-center shadow-lg hover:bg-brand-dark transition-colors opacity-0 group-hover:opacity-100 text-[10px] font-bold gap-1"
              >
                <Camera size={12} /> Gallery
              </button>
            </div>

            <div className="flex-1 text-center md:text-left pb-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Your Name"
                    className="text-2xl font-black bg-surface border-border px-3 py-1 rounded-lg border outline-none w-full max-w-xs focus:ring-2 focus:ring-brand"
                  />
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    placeholder="Email address"
                    className="text-sm bg-surface border-border px-3 py-1.5 rounded-lg border outline-none w-full max-w-xs focus:ring-2 focus:ring-brand"
                  />
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Contact Number"
                    className="text-sm bg-surface border-border px-3 py-1.5 rounded-lg border outline-none w-full max-w-xs focus:ring-2 focus:ring-brand"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black">{displayName}</h2>
                  <div className="flex flex-col gap-0.5 mt-0.5 items-center md:items-start">
                    <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 justify-center md:justify-start">
                      <Mail size={12} /> {profile.email || user?.email || 'No email set'}
                    </p>
                    <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 justify-center md:justify-start">
                      <Phone size={12} /> {profile.phone || 'No phone set'}
                    </p>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                <span className="text-lg">{level.emoji}</span>
                <span className="text-sm font-semibold text-text-muted">Level {level.level} — {level.name}</span>
              </div>
              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Write a short bio about yourself..."
                  rows={2}
                  className="mt-2 w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              ) : (
                profile.bio && <p className="text-sm text-text-secondary mt-1.5">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass rounded-2xl p-3 border border-border text-center hover:border-brand/20 transition-colors">
              <Icon size={18} className={`${stat.color} mx-auto mb-1.5`} />
              <p className="text-lg font-black">{stat.value}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Student Details */}
      <div className="glass rounded-3xl p-6 border border-border">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <User size={18} className="text-brand" /> Student Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'grade' as const, label: 'Grade / Year', icon: Calendar, placeholder: 'e.g. 10th Grade' },
            { key: 'school' as const, label: 'School / College', icon: School, placeholder: 'e.g. Delhi Public School' },
            { key: 'age' as const, label: 'Age', icon: User, placeholder: 'e.g. 16' },
            { key: 'favoriteSubject' as const, label: 'Favorite Subject', icon: Heart, placeholder: 'e.g. Mathematics' },
            { key: 'studyGoal' as const, label: 'Daily Study Goal', icon: Target, placeholder: 'e.g. 3 hours per day' },
            { key: 'emailReminders' as const, label: 'Gmail Reminders', icon: Mail, placeholder: 'Enable/Disable' },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key} className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Icon size={12} /> {field.label}
                </label>
                {isEditing ? (
                  field.key === 'emailReminders' ? (
                    <button 
                      type="button"
                      onClick={() => setEditData({ ...editData, emailReminders: !editData.emailReminders })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-left text-sm font-bold transition-all ${editData.emailReminders ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-surface border-border text-text-muted'}`}
                    >
                      {editData.emailReminders ? 'Enabled' : 'Disabled'}
                    </button>
                  ) : (
                    <input
                      type="text"
                      value={editData[field.key as keyof typeof editData] as string || ''}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
                    />
                  )
                ) : (
                  <p className="text-sm font-semibold px-1">
                    {field.key === 'emailReminders' 
                      ? (profile.emailReminders ? <span className="text-brand">Enabled</span> : <span className="text-text-muted">Disabled</span>)
                      : (profile[field.key as keyof typeof profile] || <span className="text-text-muted italic">Not set</span>)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manage Subjects */}
      <div className="glass rounded-3xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <BookOpen size={18} className="text-brand" /> My Subjects
          </h3>
          <button
            onClick={() => setShowAddSubject(true)}
            className="bg-brand text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors flex items-center gap-1"
          >
            <Plus size={12} /> Add Subject
          </button>
        </div>

        {showAddSubject && (
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubject(); }}
              placeholder="New subject name..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-brand"
              autoFocus
            />
            <button onClick={handleAddSubject} className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark">
              <Plus size={14} />
            </button>
            <button onClick={() => { setShowAddSubject(false); setNewSubject(''); }} className="p-2.5 rounded-xl border border-border hover:bg-surface-hover">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <div
              key={subject}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-sm font-semibold group hover:border-brand/20 transition-colors"
            >
              <BookOpen size={12} className="text-brand" />
              {subject}
              <button
                onClick={() => removeSubject(subject)}
                className="p-0.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
        {subjects.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">No subjects added yet. Add your first subject above!</p>
        )}
      </div>

      {/* Switch Account Section */}
      <div className="glass rounded-3xl p-6 border border-brand/20 bg-brand/5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Users size={18} className="text-brand" /> Switch Profile
        </h3>
        <p className="text-xs text-text-muted mb-6">Each profile has its own separate notebook, planner, and study data.</p>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setAccountId('account1')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${currentAccountId === 'account1' ? 'border-brand bg-surface shadow-glow-brand' : 'border-border bg-surface/50 hover:border-brand/30'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentAccountId === 'account1' ? 'bg-brand text-white' : 'bg-surface border border-border text-text-muted'}`}>
              <User size={24} />
            </div>
            <div>
              <p className="font-black text-sm text-center">Student 1</p>
              <p className="text-[10px] text-text-muted text-center mt-0.5">{currentAccountId === 'account1' ? 'Currently Active' : 'Switch to Profile'}</p>
            </div>
          </button>

          <button 
            onClick={() => setAccountId('account2')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${currentAccountId === 'account2' ? 'border-brand bg-surface shadow-glow-brand' : 'border-border bg-surface/50 hover:border-brand/30'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentAccountId === 'account2' ? 'bg-brand text-white' : 'bg-surface border border-border text-text-muted'}`}>
              <User size={24} />
            </div>
            <div>
              <p className="font-black text-sm text-center">Student 2</p>
              <p className="text-[10px] text-text-muted text-center mt-0.5">{currentAccountId === 'account2' ? 'Currently Active' : 'Switch to Profile'}</p>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to switch student profiles?')) {
                signOut();
              }
            }}
            className="w-full py-4 bg-brand/10 text-brand font-black text-sm rounded-2xl hover:bg-brand hover:text-white transition-all flex items-center justify-center gap-2 border border-brand/20"
          >
            <Users size={18} /> Switch Student Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
};
