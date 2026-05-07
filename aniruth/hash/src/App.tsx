import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/Home';
import { TimerPage } from './pages/TimerPage';
import { ProgressPage } from './pages/ProgressPage';
import { LearnPage } from './pages/LearnPage';
import { ShopPage } from './pages/ShopPage';
import { NotebookPage } from './pages/NotebookPage';
import { PlannerPage } from './pages/PlannerPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TasksPage } from './pages/TasksPage';
import { ExamsPage } from './pages/ExamsPage';
import { GetStarted } from './pages/GetStarted';
import { useAuthStore } from './store/useAuthStore';

import { useSyncService } from './hooks/useSyncService';
import { useNotificationService } from './hooks/useNotificationService';

function InitialRedirect({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If we land on the root, always go to GetStarted unless we want to bypass it.
    // The user wants to see the start page "Every time when I click the link".
    if (location.pathname === '/') {
      navigate('/get-started', { replace: true });
    }

    const hasLaunched = sessionStorage.getItem('hash_session_launched') === 'true';

    if (!hasLaunched && location.pathname !== '/get-started') {
      navigate('/get-started', { replace: true });
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
}

function App() {
  const initAuthListener = useAuthStore((s) => s.initAuthListener);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, [initAuthListener]);

  // Initialize sync and notification services
  useSyncService();
  useNotificationService();

  return (
    <InitialRedirect>
      <Routes>
        <Route path="/get-started" element={<GetStarted />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/notebook" element={<NotebookPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Redirect old root to dashboard if reached */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </InitialRedirect>
  );
}

export default App;
