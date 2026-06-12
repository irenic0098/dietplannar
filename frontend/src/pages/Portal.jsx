import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Portal = () => {
  const { t, lang, changeLanguage } = useLanguage();
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Slider State (0: Option Portal, 1: Login/Dashboard, 2: Register/DietPlan, 3: Language)
  const [activeSlide, setActiveSlide] = useState(0);

  // Embedded Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Embedded Register states
  const [regData, setRegData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    activity_level: 'moderate',
    goal: 'maintain',
    diet_preference: 'none',
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Language Option Grid data
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
    { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  ];

  const handleSlideChange = (index) => {
    setActiveSlide(index);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? 3 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === 3 ? 0 : prev + 1));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields.');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.password2) {
      setRegError('Passwords do not match.');
      return;
    }
    setRegError('');
    setRegLoading(true);
    try {
      const payload = {
        ...regData,
        age: parseInt(regData.age),
        height_cm: parseFloat(regData.height_cm),
        weight_kg: parseFloat(regData.weight_kg),
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setRegError(err.message || 'Registration failed. Check your inputs.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px 0', position: 'relative' }}>
      {/* Floating Home Action Button */}
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/')} 
        style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        🏠 Home
      </button>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡ Interactive Quick Action Portal</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Welcome to the center actions hub. Click on any option card below to slide directly into its interface.
        </p>
      </div>

      <div className="slider-wrapper">

        {/* Chevron Arrows */}
        <button className="slider-nav-btn prev" onClick={handlePrev}>
          ‹
        </button>
        <button className="slider-nav-btn next" onClick={handleNext}>
          ›
        </button>

        {/* Slides Track */}
        <div className="slider-container">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${(activeSlide * 100) / 4}%)` }}
          >
            {/* Slide 0: Option Portal Menu */}
            <div className="slide-item">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⚡ Choose an Action</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Click on any option below to slide into its interface.</p>
              </div>
              <div className="grid-cols-3" style={{ gap: '24px' }}>
                {user ? (
                  <>
                    <div className="portal-option-card" style={{
                      '--card-glow-color': 'rgba(16, 185, 129, 0.25)',
                      '--card-hover-border': 'rgba(16, 185, 129, 0.4)',
                      '--card-glow-shadow': 'rgba(16, 185, 129, 0.15)',
                      '--card-btn-bg': 'var(--accent)',
                      '--card-btn-border': 'var(--accent)',
                      textAlign: 'center'
                    }} onClick={() => handleSlideChange(1)}>
                      <div className="stats-icon" style={{ margin: '0 auto', fontSize: '1.8rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)' }}>📊</div>
                      <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>My Dashboard</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>View your tracked food, daily calorie targets, and hydration logs.</p>
                      <button className="portal-card-btn">Go to Dashboard →</button>
                    </div>
                    <div className="portal-option-card" style={{
                      '--card-glow-color': 'rgba(59, 130, 246, 0.25)',
                      '--card-hover-border': 'rgba(59, 130, 246, 0.4)',
                      '--card-glow-shadow': 'rgba(59, 130, 246, 0.15)',
                      '--card-btn-bg': 'var(--info)',
                      '--card-btn-border': 'var(--info)',
                      textAlign: 'center'
                    }} onClick={() => handleSlideChange(2)}>
                      <div className="stats-icon" style={{ margin: '0 auto', fontSize: '1.8rem', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>🥗</div>
                      <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Diet Planner</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Configure target weights and generate customized meal slots.</p>
                      <button className="portal-card-btn">Generate Plan →</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="portal-option-card" style={{
                      '--card-glow-color': 'rgba(16, 185, 129, 0.25)',
                      '--card-hover-border': 'rgba(16, 185, 129, 0.4)',
                      '--card-glow-shadow': 'rgba(16, 185, 129, 0.15)',
                      '--card-btn-bg': 'var(--accent)',
                      '--card-btn-border': 'var(--accent)',
                      textAlign: 'center'
                    }} onClick={() => handleSlideChange(1)}>
                      <div className="stats-icon" style={{ margin: '0 auto', fontSize: '1.8rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)' }}>🔑</div>
                      <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Sign In Profile</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Access your personalized dashboard and save progress logs.</p>
                      <button className="portal-card-btn">Open Form →</button>
                    </div>
                    <div className="portal-option-card" style={{
                      '--card-glow-color': 'rgba(59, 130, 246, 0.25)',
                      '--card-hover-border': 'rgba(59, 130, 246, 0.4)',
                      '--card-glow-shadow': 'rgba(59, 130, 246, 0.15)',
                      '--card-btn-bg': 'var(--info)',
                      '--card-btn-border': 'var(--info)',
                      textAlign: 'center'
                    }} onClick={() => handleSlideChange(2)}>
                      <div className="stats-icon" style={{ margin: '0 auto', fontSize: '1.8rem', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>📝</div>
                      <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Create Account</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Build a custom metabolic profile and receive custom diet plans.</p>
                      <button className="portal-card-btn">Open Signup →</button>
                    </div>
                  </>
                )}
                <div className="portal-option-card" style={{
                  '--card-glow-color': 'rgba(167, 139, 250, 0.25)',
                  '--card-hover-border': 'rgba(167, 139, 250, 0.4)',
                  '--card-glow-shadow': 'rgba(167, 139, 250, 0.15)',
                  '--card-btn-bg': '#a78bfa',
                  '--card-btn-border': '#a78bfa',
                  textAlign: 'center'
                }} onClick={() => handleSlideChange(3)}>
                  <div className="stats-icon" style={{ margin: '0 auto', fontSize: '1.8rem', background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }}>🌍</div>
                  <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Language Settings</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Choose between English, Hindi, Spanish, French, and German.</p>
                  <button className="portal-card-btn">Choose Language →</button>
                </div>
              </div>
            </div>

            {/* Slide 1: Login / Go to Dashboard */}
            <div className="slide-item">
              <div style={{ marginBottom: '16px' }}>
                <button className="btn btn-secondary" onClick={() => handleSlideChange(0)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  ← Back to Portal Menu
                </button>
              </div>
              {user ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <h2 style={{ marginBottom: '16px' }}>🚀 Welcome back, {user.username || 'User'}!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                    You are currently logged in. Access your metrics tracker, calorie needs, hydration log, and personalized meals.
                  </p>
                  <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                    Go to My Dashboard 📊
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                  <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>🔑 {t('login')}</h3>
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Access your personalized account profile
                  </p>

                  {loginError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px', color: 'var(--danger)', marginBottom: '20px', fontSize: '0.9rem' }}>
                      ⚠️ {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loginLoading}>
                      {loginLoading ? 'Logging in...' : 'Sign In 🚀'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Slide 2: Register / Go to Diet Planner */}
            <div className="slide-item">
              <div style={{ marginBottom: '16px' }}>
                <button className="btn btn-secondary" onClick={() => handleSlideChange(0)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  ← Back to Portal Menu
                </button>
              </div>
              {user ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <h2 style={{ marginBottom: '16px' }}>🥗 Need a New Meal Plan?</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                    Generate dynamic breakfast, lunch, and dinner options scaled dynamically in grams for your current target calories.
                  </p>
                  <button className="btn btn-primary" onClick={() => navigate('/diet-plan')}>
                    Generate Custom Diet Plan 🥗
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                  <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>📝 {t('register')}</h3>
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Build your custom stats page and active meals
                  </p>

                  {regError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px', color: 'var(--danger)', marginBottom: '20px', fontSize: '0.9rem' }}>
                      ⚠️ {regError}
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit}>
                    <div className="grid-cols-2" style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          name="username"
                          className="form-input"
                          value={regData.username}
                          onChange={handleRegChange}
                          placeholder="john_doe"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-input"
                          value={regData.email}
                          onChange={handleRegChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          name="password"
                          className="form-input"
                          value={regData.password}
                          onChange={handleRegChange}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          name="password2"
                          className="form-input"
                          value={regData.password2}
                          onChange={handleRegChange}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-cols-3" style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Age</label>
                        <input
                          type="number"
                          name="age"
                          className="form-input"
                          value={regData.age}
                          onChange={handleRegChange}
                          placeholder="e.g. 25"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Height (cm)</label>
                        <input
                          type="number"
                          name="height_cm"
                          className="form-input"
                          value={regData.height_cm}
                          onChange={handleRegChange}
                          placeholder="e.g. 175"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Weight (kg)</label>
                        <input
                          type="number"
                          name="weight_kg"
                          className="form-input"
                          value={regData.weight_kg}
                          onChange={handleRegChange}
                          placeholder="e.g. 70"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-cols-3" style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select name="gender" className="form-select" value={regData.gender} onChange={handleRegChange}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Activity</label>
                        <select name="activity_level" className="form-select" value={regData.activity_level} onChange={handleRegChange}>
                          <option value="sedentary">Sedentary</option>
                          <option value="light">Lightly Active</option>
                          <option value="moderate">Moderately Active</option>
                          <option value="active">Very Active</option>
                          <option value="very_active">Extra Active</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Goal</label>
                        <select name="goal" className="form-select" value={regData.goal} onChange={handleRegChange}>
                          <option value="lose">Lose Weight</option>
                          <option value="maintain">Maintain</option>
                          <option value="gain">Gain Muscle</option>
                          <option value="healthy">Healthy Eating</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label className="form-label">Dietary Preference</label>
                      <select name="diet_preference" className="form-select" value={regData.diet_preference} onChange={handleRegChange}>
                        <option value="none">No Restrictions</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="gluten_free">Gluten-Free</option>
                        <option value="diabetic">Diabetic-Friendly</option>
                        <option value="keto">Keto</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={regLoading}>
                      {regLoading ? 'Registering...' : 'Create Account & Start Journey 🎯'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Slide 3: Language Selector */}
            <div className="slide-item">
              <div style={{ marginBottom: '16px' }}>
                <button className="btn btn-secondary" onClick={() => handleSlideChange(0)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  ← Back to Portal Menu
                </button>
              </div>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>🌍 Select System Language</h3>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                  Choose your preferred language context. Real-time updates will apply instantly to all views.
                </p>

                <div className="lang-grid-container">
                  {languages.map((l) => (
                    <div
                      key={l.code}
                      className={`lang-card-item ${lang === l.code ? 'active' : ''}`}
                      onClick={() => changeLanguage(l.code)}
                    >
                      <span className="lang-flag-icon">{l.flag}</span>
                      <span className="lang-name-text">{l.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicators Dots */}
        <div className="slider-dots">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              className={`slider-dot ${activeSlide === idx ? 'active' : ''}`}
              onClick={() => handleSlideChange(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portal;
