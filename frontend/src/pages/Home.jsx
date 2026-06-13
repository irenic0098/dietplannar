import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      {/* Animated Graphic Designer Hero Fold */}
      <div className="hero-designer-bg">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>

        <div className="hero-badge-tag">
          ✨ {t('aiConsult')}
        </div>

        <h1 className="hero-title-gradient">{t('heroTitle')}</h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto 40px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {t('heroSubtitle')}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              {t('dashboard')} 📊
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/portal')}>
              {t('getStarted')} 🚀
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/portal')}>
            🌍 Login / Settings
          </button>
        </div>
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{t('whyChooseUs')}</h2>
      <div className="grid-cols-3" style={{ marginBottom: '60px' }}>
        <div className="card">
          <div className="stats-icon" style={{ marginBottom: '16px', fontSize: '2rem' }}>📋</div>
          <h3 style={{ marginBottom: '8px' }}>{t('personalPlans')}</h3>
          <p>{t('personalPlansDesc')}</p>
        </div>
        <div className="card">
          <div className="stats-icon" style={{ marginBottom: '16px', fontSize: '2rem' }}>💧</div>
          <h3 style={{ marginBottom: '8px' }}>{t('smartTrack')}</h3>
          <p>{t('smartTrackDesc')}</p>
        </div>
        <div className="card">
          <div className="stats-icon" style={{ marginBottom: '16px', fontSize: '2rem' }}>🤖</div>
          <h3 style={{ marginBottom: '8px' }}>{t('aiConsult')}</h3>
          <p>{t('aiConsultDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
