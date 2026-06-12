import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { toggleLanguage, lang, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="logo-icon">🥗</span>
        <span>DietPlanner</span>
      </div>

      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
            <span>🏠</span> {t('home')}
          </NavLink>
        </li>

        {user ? (
          <>
            <li className="nav-item">
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                <span>📊</span> {t('dashboard')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/diet-plan" className={({ isActive }) => isActive ? "active" : ""}>
                <span>📋</span> {t('dietPlan')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/food-database" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🍎</span> {t('foodDb')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/tracking" className={({ isActive }) => isActive ? "active" : ""}>
                <span>⏱️</span> {t('tracking')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/reports" className={({ isActive }) => isActive ? "active" : ""}>
                <span>📈</span> {t('reports')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/community" className={({ isActive }) => isActive ? "active" : ""}>
                <span>💬</span> {t('community')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/consultation" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🩺</span> {t('dieticians')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/ai-chat" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🤖</span> {t('askAi')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                <span>👤</span> {t('welcome')}, {user.username || 'User'}
              </NavLink>
            </li>
            {user.is_staff && (
              <li className="nav-item">
                <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer">
                  <span>⚙️</span> {t('admin')}
                </a>
              </li>
            )}
            <li className="nav-item" style={{ marginTop: 'auto' }}>
              <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%', padding: '10px' }}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item" style={{ marginTop: 'auto' }}>
              <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🔑</span> {t('login')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>
                <span>📝</span> {t('register')}
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <button className="lang-toggle" onClick={toggleLanguage}>
          🌐 {lang === 'en' ? 'हिन्दी' : 'English'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
