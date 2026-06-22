import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { toggleTheme } from './store/themeSlice';
// Pages
import Home from './pages/Home';
import Portal from './pages/Portal';
import Login from './pages/Login';
import Register from './pages/Register';
import DietPlan from './pages/DietPlan';
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
  if (user) return <Navigate to="/diet-plan" replace />;
  return children;
};

// Main Layout Wrapper
const AppLayout = () => {
  const { user, logout } = useAuth();
  const { changeLanguage, lang, t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const themeMode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const hideNavbar = location.pathname === '/' || location.pathname === '/portal';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      {!hideNavbar && (
        <header className="top-navbar">
          <div className="top-navbar-logo" onClick={() => navigate(user ? '/diet-plan' : '/')}>
            <span className="logo-icon">🥗</span>
            <span>DietPlanner</span>
          </div>

          {user && (
            <nav className="top-navbar-menu">
              <div className="top-navbar-item">
                <NavLink to="/diet-plan" className={({ isActive }) => isActive ? "active" : ""}>
                  <span>📋</span> {t('dietPlan')}
                </NavLink>
              </div>
              <div className="top-navbar-item">
                <NavLink to="/notifications" className={({ isActive }) => isActive ? "active" : ""}>
                  <span>🔔</span> Notifications
                </NavLink>
              </div>
              <div className="top-navbar-item">
                <NavLink to="/community" className={({ isActive }) => isActive ? "active" : ""}>
                  <span>💬</span> {t('community')}
                </NavLink>
              </div>
              <div className="top-navbar-item">
                <NavLink to="/consultation" className={({ isActive }) => isActive ? "active" : ""}>
                  <span>🩺</span> {t('dieticians')}
                </NavLink>
              </div>
              <div className="top-navbar-item">
                <NavLink to="/ai-chat" className={({ isActive }) => isActive ? "active" : ""}>
                  <span>🤖</span> {t('askAi')}
                </NavLink>
              </div>
              <div className="top-navbar-item">
                <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                  <span>👤</span> {t('welcome')}, {user.username || 'User'}
                </NavLink>
              </div>
            </nav>
          )}

          <div className="top-navbar-actions">
            {/* Theme Toggle */}
            <button 
              onClick={() => dispatch(toggleTheme())}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '4px'
              }}
              title={`Toggle ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {themeMode === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Language Selection */}
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                borderRadius: '6px',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem'
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>

            {user && (
              <>
                {(user.role === 'admin' || user.is_staff) && (
                  <button className="btn btn-secondary" onClick={() => navigate('/admin-portal')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    ⚙️ Admin
                  </button>
                )}
                <button className="btn btn-danger" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  🚪 Logout
                </button>
              </>
            )}
          </div>
        </header>
      )}

      <div className="main-content" style={{ marginLeft: 0 }}>
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
          <Route path="/diet-plan" element={
            <ProtectedRoute>
              <DietPlan />
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
