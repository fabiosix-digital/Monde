import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth-store';
import { useThemeStore } from './store/theme-store';
import { LoginForm } from './components/auth/login-form';
import { AppShell } from './components/layout/app-shell';
import { Dashboard } from './components/dashboard/dashboard';
import { KanbanBoard } from './components/kanban/kanban-board';
import { UserManagement } from './components/users/user-management';
import { MondeIntegration } from './components/monde/monde-integration';

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function PrivateRoute({ children, adminOnly = false }: PrivateRouteProps) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="atendimentos" element={<KanbanBoard />} />
          <Route path="usuarios" element={<UserManagement />} />
          <Route
            path="monde"
            element={
              <PrivateRoute adminOnly>
                <MondeIntegration />
              </PrivateRoute>
            }
          />
          <Route path="configuracoes" element={<div>Configurações</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;