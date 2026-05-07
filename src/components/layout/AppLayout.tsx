import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useGameStore } from '../../store/useGameStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useFlashcardStore } from '../../store/useFlashcardStore';
import {
  Home, Timer, BarChart3, ShoppingBag, BookOpen, Sun, Moon, Coins,
  FileText, Calendar, Brain, User, CheckSquare, Target,
  Menu, Bell, Clock as ClockIcon, Flame, Users, Phone, Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { Logo } from '../common/Logo';

export const AppLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  const coins = useGameStore((s) => s.coins);
  const streak = useGameStore((s) => s.streak);
  const getLevel = useGameStore((s) => s.getLevel);
  const level = getLevel();
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const decks = useFlashcardStore((s) => s.decks);
  const profile = useProfileStore((s) => s.profile);
  const [showMoreNav, setShowMoreNav] = useState(false);

  const displayName = profile?.name || user?.displayName || 'Student';
  const displayPhoto = profile?.photoUrl || user?.photoURL || '';


  // Count total due flashcards
  const totalDue = decks.reduce((acc, deck) => {
    const now = new Date();
    return acc + deck.cards.filter(c => c.difficulty === 'new' || new Date(c.nextReview) <= now).length;
  }, 0);

  const primaryNav = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Timer', path: '/timer', icon: Timer },
    { name: 'Progress', path: '/progress', icon: BarChart3 },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
  ];

  const secondaryNav = [
    { name: 'Notebook', path: '/notebook', icon: FileText },
    { name: 'Planner', path: '/planner', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Goals & Exams', path: '/exams', icon: Target },
    { name: 'Flashcards', path: '/flashcards', icon: Brain, badge: totalDue > 0 ? totalDue : undefined },
  ];

  const mobileMainNav = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Timer', path: '/timer', icon: Timer },
    { name: 'Notebook', path: '/notebook', icon: FileText },
    { name: 'Planner', path: '/planner', icon: Calendar },
  ];

  const mobileMoreNav = [
    { name: 'Progress', path: '/progress', icon: BarChart3 },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Goals & Exams', path: '/exams', icon: Target },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Flashcards', path: '/flashcards', icon: Brain },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg text-text transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="w-80 hidden md:flex flex-col border-r border-border glass fixed h-full z-20">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Logo size={48} />
            <h1 className="text-2xl font-black tracking-tight leading-none">
              <span className="bg-gradient-to-r from-brand via-accent to-brand-light bg-clip-text text-transparent italic uppercase">HASH</span>
            </h1>
          </div>
          <div className="flex flex-col mt-1">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em]">Study Smarter, Level Up</p>
            <p className="text-[9px] font-black text-brand/60 uppercase tracking-widest mt-0.5">Created by KFIRE GROUPS</p>
          </div>
        </div>

        {/* User Profile */}
        <Link to="/profile" className="mx-4 p-3 rounded-2xl bg-surface border border-border mb-2 flex items-center gap-3 hover:border-brand/20 transition-colors">
          {displayPhoto ? (
            <img src={displayPhoto} alt="" className="w-9 h-9 rounded-full border-2 border-brand/30 object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 rounded-full border-2 border-brand/30 bg-brand/10 flex items-center justify-center">
              <User size={16} className="text-brand" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{displayName}</p>
            <p className="text-[10px] text-text-muted truncate">{user?.email || profile.bio || 'Tap to set up profile'}</p>
          </div>
        </Link>

        {/* Level & Coins */}
        <div className="mx-4 p-4 rounded-2xl bg-surface border border-border mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{level.emoji}</span>
              <div>
                <p className="text-xs font-bold text-text-muted">Level {level.level}</p>
                <p className="text-sm font-bold">{level.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-coin/10 px-3 py-1.5 rounded-full">
              <Coins size={14} className="text-coin" />
              <span className="text-sm font-bold text-coin">{coins}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
            <div className="level-bar h-full rounded-full" style={{ width: `${level.progress}%` }} />
          </div>
          <p className="text-[10px] text-text-muted mt-1.5">{Math.round(level.progress)}% to Level {(level.level || 0) + 1}</p>
        </div>

        {/* Primary Nav */}
        {/* Primary Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-4 mb-1">Main</p>
          {primaryNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand text-white shadow-glow-brand'
                    : 'hover:bg-surface-hover text-text-secondary hover:text-text'
                }`}
              >
                <Icon size={18} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-semibold text-sm">{item.name}</span>
              </Link>
            );
          })}

          <div className="h-2" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-4 mb-1">Tools</p>
          {secondaryNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand text-white shadow-glow-brand'
                    : 'hover:bg-surface-hover text-text-secondary hover:text-text'
                }`}
              >
                <Icon size={18} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-semibold text-sm flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border space-y-1">
          <Link
            to="/profile"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:text-brand hover:bg-brand/5 rounded-xl transition-colors"
          >
            <User size={18} />
            <span className="font-medium text-sm">Account Settings</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:text-text hover:bg-surface-hover rounded-xl transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:text-brand hover:bg-brand/5 rounded-xl transition-colors"
          >
            <Users size={18} />
            <span className="font-medium text-sm">Switch Profile</span>
          </button>
        </div>

        {/* Footer Branding */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex flex-col items-center justify-center gap-2">
            <Logo size={24} />
            <div className="text-center">
              <p className="text-[7px] font-bold tracking-widest uppercase text-text-muted">HASH STUDY TRACKER</p>
              <p className="text-[8px] font-black text-brand uppercase tracking-widest">Created by KFIRE GROUPS</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-80 relative overflow-y-auto min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 glass border-b border-border px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setShowMoreNav(true)} className="md:hidden p-2 rounded-xl hover:bg-surface-hover">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Logo size={32} className="md:hidden" />
              <h2 className="text-xl font-black italic tracking-tighter truncate md:hidden">HASH</h2>
              <div className="hidden md:flex items-center gap-3">
                <ClockIcon size={16} className="text-brand" />
                <span className="text-sm font-mono font-bold">{format(time, 'HH:mm:ss')}</span>
                <span className="text-xs font-bold text-text-muted border-l border-border pl-3 ml-1 uppercase tracking-widest">{format(time, 'EEEE, MMM d')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
              <>
                {/* Streak */}
                <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-xl border border-orange-500/20">
                  <Flame size={16} className="fill-orange-500" />
                  <span className="text-sm font-black">{streak}</span>
                </div>

                {/* Coins */}
                <div className="flex items-center gap-1.5 bg-coin/10 text-coin px-3 py-1.5 rounded-xl border border-coin/20">
                  <Coins size={16} />
                  <span className="text-sm font-black">{coins}</span>
                </div>

                <button className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-surface-hover relative hidden sm:block">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
                </button>
              </>

            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-surface-hover hidden sm:block"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center overflow-hidden">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-brand" />
                )}
              </div>
            </Link>
          </div>
        </header>

        <div className="p-8 md:p-12 max-w-7xl mx-auto pb-12">
          <Outlet />
        </div>

        {/* Global Footer */}
        <footer className="w-full py-12 px-8 border-t border-border bg-surface/30 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                <Logo size={64} />
                <h3 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-brand via-accent to-brand bg-clip-text text-transparent uppercase">
                  BUILD YOUR OWN WEBSITE
                </h3>
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Premium Digital Craftsmanship by KFIRE GROUPS</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="flex flex-col items-center lg:items-start gap-4">
                <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">Contact Us</span>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <a href="tel:8778961957" className="flex items-center gap-3 text-sm font-black group hover:text-brand transition-all">
                    <div className="w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center text-brand shadow-sm group-hover:border-brand/30 group-hover:scale-110 transition-all">
                      <Phone size={18} />
                    </div>
                    8778961957
                  </a>
                  <a href="mailto:kfiregroups11@gmail.com" className="flex items-center gap-3 text-sm font-black group hover:text-brand transition-all">
                    <div className="w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center text-accent shadow-sm group-hover:border-accent/30 group-hover:scale-110 transition-all">
                      <Mail size={18} />
                    </div>
                    kfiregroups11@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 opacity-50">
            <p className="text-[9px] font-black uppercase tracking-widest">© 2026 HASH STUDY TRACKER</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand">Powered by KFIRE GROUPS</p>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-border px-2 py-1 safe-area-bottom">
        <div className="flex items-center justify-around">
          {mobileMainNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
                  isActive ? 'text-brand' : 'text-text-muted'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-semibold mt-0.5">{item.name}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setShowMoreNav(!showMoreNav)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
              showMoreNav ? 'text-brand' : 'text-text-muted'
            }`}
          >
            <Menu size={20} />
            <span className="text-[10px] font-semibold mt-0.5">More</span>
          </button>
        </div>

        {/* More Nav Panel */}
        {showMoreNav && (
          <div className="absolute bottom-full left-0 right-0 glass border-t border-border p-4 mb-0 rounded-t-2xl shadow-card-dark">
            <div className="grid grid-cols-3 gap-3">
              {mobileMoreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMoreNav(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                      location.pathname === item.path ? 'bg-brand/10 text-brand' : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-[10px] font-bold">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <button onClick={toggleTheme} className="text-xs text-text-muted flex items-center gap-1.5">
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <div className="flex flex-col items-center gap-0.5 opacity-50">
                <p className="text-[7px] font-bold tracking-widest uppercase">HASH STUDY TRACKER</p>
                <div className="flex items-center gap-1.5">
                  <Logo size={12} />
                  <span className="text-[9px] font-black text-brand uppercase tracking-widest">KFIRE GROUPS</span>
                </div>
              </div>
              <button onClick={signOut} className="text-xs text-brand flex items-center gap-1.5">
                <Users size={14} /> Switch Student
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
