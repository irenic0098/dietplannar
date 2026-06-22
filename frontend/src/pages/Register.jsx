import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
      };
      await register(payload);
      navigate('/diet-plan');
    } catch (err) {
      setError(err.message || 'Registration failed. Check your input fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '40px 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>{t('register')}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Create your custom health profile and diet plan
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: 'var(--danger)',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
            🔒 Credentials
          </h3>
          <div className="grid-cols-2" style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
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
                value={formData.password2}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
            ⚖️ Body Stats & Goals
          </h3>
          <div className="grid-cols-3" style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                className="form-input"
                value={formData.age}
                onChange={handleChange}
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
                value={formData.height_cm}
                onChange={handleChange}
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
                value={formData.weight_kg}
                onChange={handleChange}
                placeholder="e.g. 70"
                required
              />
            </div>
          </div>

          <div className="grid-cols-3" style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Activity Level</label>
              <select name="activity_level" className="form-select" value={formData.activity_level} onChange={handleChange}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Very Active</option>
                <option value="very_active">Extra Active</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Goal</label>
              <select name="goal" className="form-select" value={formData.goal} onChange={handleChange}>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain Muscle</option>
                <option value="healthy">Healthy Eating</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '36px' }}>
            <label className="form-label">Dietary Preference</label>
            <select name="diet_preference" className="form-select" value={formData.diet_preference} onChange={handleChange}>
              <option value="none">No Restrictions</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten_free">Gluten-Free</option>
              <option value="diabetic">Diabetic-Friendly</option>
              <option value="keto">Keto</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Registering...' : 'Create Account & Start Journey 🎯'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
