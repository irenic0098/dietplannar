import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Guest Calculator States
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateQuickStats = async (e) => {
    e.preventDefault();
    if (!weight || !height || !age) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/calculate/diet-plan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight_kg: parseFloat(weight),
          height_cm: parseFloat(height),
          age: parseInt(age),
          gender,
          activity_level: activity,
          goal: 'maintain'
        }),
      });

      if (!res.ok) {
        throw new Error('Calculation failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Could not calculate. Make sure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        padding: '60px 40px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px', lineHeight: '1.2' }}>
          {t('heroTitle')}
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 32px', color: 'var(--text-secondary)' }}>
          {t('heroSubtitle')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              {t('dashboard')} 📊
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                {t('getStarted')} 🚀
              </button>
              <button className="btn btn-secondary" onClick={() => {
                const el = document.getElementById('quick-calculator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {t('tryCalcs')} 🧮
              </button>
            </>
          )}
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

      {/* Free Quick Calculator Section */}
      <div id="quick-calculator" className="card" style={{ maxWidth: '800px', margin: '0 auto 40px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>⚡ Free Interactive Health Calculator</h2>
        <p style={{ textAlign: 'center', marginBottom: '32px' }}>Check your BMI, calories and hydration status instantly!</p>

        <form onSubmit={calculateQuickStats} className="grid-cols-2" style={{ gap: '20px', display: 'grid' }}>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input
              type="number"
              className="form-input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 70"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Height (cm)</label>
            <input
              type="number"
              className="form-input"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 175"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Age (years)</label>
            <input
              type="number"
              className="form-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 25"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Activity Level</label>
            <select className="form-select" value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="sedentary">Sedentary (No Exercise)</option>
              <option value="light">Lightly Active (1-3 days/week)</option>
              <option value="moderate">Moderately Active (3-5 days/week)</option>
              <option value="active">Very Active (6-7 days/week)</option>
              <option value="very_active">Extra Active (Hard Workouts 2x/day)</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate Health Metrics 🧮'}
            </button>
          </div>
        </form>

        {error && <p style={{ color: 'var(--danger)', marginTop: '16px', textAlign: 'center' }}>{error}</p>}

        {result && (
          <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>📊 Your Personal Results</h3>
            
            <div className="grid-cols-3" style={{ gap: '16px' }}>
              <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px' }}>
                <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>BMI Score</p>
                <h2 style={{ color: result.bmi.color, margin: '8px 0' }}>{result.bmi.bmi}</h2>
                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{result.bmi.category}</p>
              </div>

              <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px' }}>
                <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Daily Calories Needed</p>
                <h2 style={{ color: 'var(--accent)', margin: '8px 0' }}>{result.calories.calories} kcal</h2>
                <p style={{ fontSize: '0.8rem' }}>BMR: {result.bmr} kcal</p>
              </div>

              <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px' }}>
                <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Daily Water Needed</p>
                <h2 style={{ color: 'var(--info)', margin: '8px 0' }}>{result.water.liters} L</h2>
                <p style={{ fontSize: '0.8rem' }}>~ {result.water.glasses} Glasses (250ml)</p>
              </div>
            </div>

            {/* Custom gauge visualization */}
            <div className="bmi-gauge-container" style={{ marginTop: '24px' }}>
              <div className="bmi-gauge">
                <div
                  className="bmi-marker"
                  style={{
                    left: `${Math.min(Math.max(((result.bmi.bmi - 15) / 20) * 100, 0), 100)}%`
                  }}
                />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                {result.bmi.advice}
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/register')}>
                Save My Results & Create Diet Plan 🎯
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
