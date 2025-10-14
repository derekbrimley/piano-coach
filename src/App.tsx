import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useGoals } from './hooks/useGoals';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import GoalSetup from './components/GoalSetup';
import SessionGenerator from './components/SessionGenerator';
import PracticeTimer from './components/PracticeTimer';
import ProgressLogger from './components/ProgressLogger';
import Profile from './components/Profile';
import type { Session, Goal } from './types';
import { analyticsEvents } from './utils/analytics';

type ViewType = 'dashboard' | 'goalSetup' | 'editGoal' | 'sessionGenerator' | 'customizer' | 'timer' | 'progressLogger' | 'profile';

function AppContent() {
  const { user, logout } = useAuth();
  const { goals, loading, deleteGoal } = useGoals(user?.uid);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewSession = () => {
      navigate('/session');
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        const goal = goals.find(g => g.id === goalId);
        await deleteGoal(goalId);
        if (goal) {
          analyticsEvents.goalDeleted(goal.type);
        }
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleNavigate = (viewName: ViewType) => {
    setEditGoal(null);
    setCurrentSession(null);
    const routeMap: Record<ViewType, string> = {
      dashboard: '/',
      goalSetup: '/goals',
      editGoal: '/goals',
      sessionGenerator: '/session',
      customizer: '/customizer',
      timer: '/timer',
      progressLogger: '/progress',
      profile: '/profile'
    };
    navigate(routeMap[viewName]);
  };

  const handleSessionCreated = (session: Session) => {
    setCurrentSession(session);
    navigate('/timer');
  };

  const handleTimerComplete = () => {
    navigate('/progress');
  };

  const handleProgressComplete = () => {
    setCurrentSession(null);
    navigate('/');
  };

  const handleExitSession = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will not be saved.')) {
      setCurrentSession(null);
      navigate('/');
    }
  };

  const handleGoalComplete = () => {
    setEditGoal(null);
    navigate('/');
  };

  const handleEditGoal = (goal: Goal) => {
    setEditGoal(goal);
    navigate('/goals');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setCurrentSession(null);
      setEditGoal(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return <Auth />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Views that should show navigation
  const showNavigation = !['/timer', '/progress'].includes(location.pathname);

  // Get current view from path for navigation highlighting
  const pathToView: Record<string, ViewType> = {
    '/': 'dashboard',
    '/goals': 'goalSetup',
    '/session': 'sessionGenerator',
    '/customizer': 'customizer',
    '/timer': 'timer',
    '/progress': 'progressLogger',
    '/profile': 'profile'
  };
  const currentView = pathToView[location.pathname] || 'dashboard';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {showNavigation && (
        <Navigation
          currentView={currentView}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={
            <Dashboard
              numGoals={goals.length}
              onNewSession={handleNewSession}
              onManageGoals={() => navigate('/goals')}
            />
          } />

          <Route path="/goals" element={
            <GoalSetup
              existingGoals={goals}
              editGoal={editGoal}
              onComplete={handleGoalComplete}
              onEditGoal={handleEditGoal}
              handleDeleteGoal={handleDeleteGoal}
            />
          } />

          <Route path="/session" element={
            <SessionGenerator
              goals={goals}
              onSessionCreated={handleSessionCreated}
              onBack={() => navigate('/goals')}
            />
          } />

          <Route path="/timer" element={
            currentSession ? (
              <PracticeTimer
                session={currentSession}
                onComplete={handleTimerComplete}
                onExit={handleExitSession}
              />
            ) : (
              <div>No session available</div>
            )
          } />

          <Route path="/progress" element={
            currentSession ? (
              <ProgressLogger
                session={currentSession}
                onComplete={handleProgressComplete}
              />
            ) : (
              <div>No session available</div>
            )
          } />

          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <CssVarsProvider>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </CssVarsProvider>
  );
}

export default App;
