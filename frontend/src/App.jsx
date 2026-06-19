import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Portal from './pages/Portal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DietPlan from './pages/DietPlan';
import FoodDatabase from './pages/FoodDatabase';
import Tracking from './pages/Tracking';
import Reports from './pages/Reports';
import Community from './pages/Community';
import Consultation from './pages/Consultation';
import Profile from './pages/Profile';
import AIChat from './pages/AIChat';
import Notifications from './pages/Notifications';
import AdminPortal from './pages/AdminPortal';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>Verifying security credentials... 🔐</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>Verifying credentials... 🔐</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Main Layout Wrapper
const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const themeMode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const hideSidebar = location.pathname === '/' || location.pathname === '/portal';

  return (
    <div className={`app-container ${isCollapsed || hideSidebar ? 'sidebar-collapsed' : ''}`}>
      {!hideSidebar && (
        <Sidebar 
          isCollapsed={isCollapsed} 
          onMouseEnter={() => setIsCollapsed(false)}
          onMouseLeave={() => setIsCollapsed(true)}
        />
      )}
      <div className="main-content" style={hideSidebar ? { marginLeft: 0 } : {}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portal" element={<Portal />} />
          
          {/* Guest Routes */}
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/diet-plan" element={
            <ProtectedRoute>
              <DietPlan />
            </ProtectedRoute>
          } />
          <Route path="/food-database" element={
            <ProtectedRoute>
              <FoodDatabase />
            </ProtectedRoute>
          } />
          <Route path="/tracking" element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />
          <Route path="/consultation" element={
            <ProtectedRoute>
              <Consultation />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/ai-chat" element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/admin-portal" element={
            <ProtectedRoute>
              <AdminPortal />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <LanguageProvider>
              <AppLayout />
            </LanguageProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
