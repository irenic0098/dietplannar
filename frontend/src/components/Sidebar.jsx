import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ADMIN_URL } from '../config';

const Sidebar = ({ isCollapsed, onMouseEnter, onMouseLeave }) => {
  const { user, logout } = useAuth();
  const { changeLanguage, lang, t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="logo-icon">🥗</span>
        {!isCollapsed && <span>DietPlanner</span>}
      </div>

      <ul className="nav-menu">
        <li className="nav-item" title={t('home')}>
          <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
            <span>🏠</span> {!isCollapsed && t('home')}
          </NavLink>
        </li>

        {user ? (
          <>
            <li className="nav-item" title={t('dietPlan')}>
              <NavLink to="/diet-plan" className={({ isActive }) => isActive ? "active" : ""}>
                <span>📋</span> {!isCollapsed && t('dietPlan')}
              </NavLink>
            </li>
            <li className="nav-item" title={t('foodDb')}>
              <NavLink to="/food-database" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🍎</span> {!isCollapsed && t('foodDb')}
              </NavLink>
            </li>
            <li className="nav-item" title={t('tracking')}>
              <NavLink to="/tracking" className={({ isActive }) => isActive ? "active" : ""}>
                <span>⏱️</span> {!isCollapsed && t('tracking')}
              </NavLink>
            </li>
            <li className="nav-item" title={t('reports')}>
              <NavLink to="/reports" className={({ isActive }) => isActive ? "active" : ""}>
                <span>📈</span> {!isCollapsed && t('reports')}
              </NavLink>
            </li>
            <li className="nav-item" title="Notifications">
              <NavLink to="/notifications" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🔔</span> {!isCollapsed && 'Notifications'}
              </NavLink>
            </li>
            <li className="nav-item" title={t('community')}>
              <NavLink to="/community" className={({ isActive }) => isActive ? "active" : ""}>
                <span>💬</span> {!isCollapsed && t('community')}
              </NavLink>
            </li>
            <li className="nav-item" title={t('dieticians')}>
              <NavLink to="/consultation" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🩺</span> {!isCollapsed && t('dieticians')}
              </NavLink>
            </li>
            <li className="nav-item" title={t('askAi')}>
              <NavLink to="/ai-chat" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🤖</span> {!isCollapsed && t('askAi')}
              </NavLink>
            </li>
            <li className="nav-item" title={user.username || 'User'}>
              <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                <span>👤</span> {!isCollapsed && `${t('welcome')}, ${user.username || 'User'}`}
              </NavLink>
            </li>
            {(user.role === 'admin' || user.is_staff) && (
              <li className="nav-item" title="Admin Portal">
                <NavLink to="/admin-portal" className={({ isActive }) => isActive ? "active" : ""}>
                  <span>⚙️</span> {!isCollapsed && 'Admin Portal'}
                </NavLink>
              </li>
            )}
            <li className="nav-item" style={{ marginTop: 'auto' }}>
              <button 
                className="btn btn-danger" 
                onClick={handleLogout} 
                style={{ 
                  width: '100%', 
                  padding: isCollapsed ? '10px 0' : '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                title="Logout"
              >
                {isCollapsed ? '🚪' : 'Logout'}
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item" title={t('login')} style={{ marginTop: 'auto' }}>
              <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>
                <span>🔑</span> {!isCollapsed && t('login')}
              </NavLink>
            </li>
            <li className="nav-item" title={t('register')}>
              <NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>
                <span>📝</span> {!isCollapsed && t('register')}
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Theme and Language Controls */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
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

        {/* Language select */}
        {isCollapsed ? (
          <span style={{ fontSize: '1.2rem', cursor: 'pointer' }} title={lang.toUpperCase()}>🌐</span>
        ) : (
          <div className="lang-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>🌐</span>
            <select
              className="lang-select"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
