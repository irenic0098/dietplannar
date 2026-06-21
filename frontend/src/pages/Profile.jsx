import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';

const Profile = () => {
  const { user, updateProfile, updateAvatar } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    activity_level: 'moderate',
    goal: 'maintain',
    diet_preference: 'none',
    bio: '',
    target_weight_kg: '',
    budget_per_day: '',
  });

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        age: user.age || '',
        gender: user.gender || 'male',
        height_cm: user.height_cm || '',
        weight_kg: user.weight_kg || '',
        activity_level: user.activity_level || 'moderate',
        goal: user.goal || 'maintain',
        diet_preference: user.diet_preference || 'none',
        bio: user.bio || '',
        target_weight_kg: user.target_weight_kg || '',
        budget_per_day: user.budget_per_day || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
        budget_per_day: formData.budget_per_day ? parseFloat(formData.budget_per_day) : null,
      };

      await updateProfile(payload);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Profile update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileData = new FormData();
    fileData.append('avatar', file);

    setError('');
    setSuccess('');
    try {
      await updateAvatar(fileData);
      setSuccess('Avatar uploaded successfully!');
    } catch (err) {
      setError('Avatar upload failed.');
      console.error(err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    try {
      await API.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });

      setPwdSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.error || err.message || 'Password change failed');
    }
  };

  return (
    <div>
      <div className="app-header">
        <div>
          <h2>👤 User Profile Management</h2>
          <p style={{ fontSize: '0.9rem' }}>Configure nutritional parameters, bio details, and account security.</p>
        </div>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Profile Details Form */}
        <div className="card">
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '1px solid var(--border-color)',
                backgroundImage: user?.avatar_url ? `url(${user.avatar_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden'
              }}>
                {!user?.avatar_url && '👤'}
              </div>
              <div>
                <h4 style={{ marginBottom: '8px' }}>Profile Photo</h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                  id="avatar-upload-input"
                />
                <label htmlFor="avatar-upload-input" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  Upload Avatar Image 📸
                </label>
              </div>
            </div>

            <div className="grid-cols-2" style={{ display: 'grid', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Read Only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}
                />
              </div>
            </div>

            <div className="grid-cols-3" style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  className="form-input"
                  value={formData.age}
                  onChange={handleChange}
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
                  required
                />
              </div>
            </div>

            <div className="grid-cols-3" style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
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

            <div className="grid-cols-3" style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Target Weight (kg)</label>
                <input
                  type="number"
                  name="target_weight_kg"
                  className="form-input"
                  value={formData.target_weight_kg || ''}
                  onChange={handleChange}
                  placeholder="e.g. 68.0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Budget Limit (INR/day)</label>
                <input
                  type="number"
                  name="budget_per_day"
                  className="form-input"
                  value={formData.budget_per_day || ''}
                  onChange={handleChange}
                  placeholder="e.g. 200"
                />
              </div>
              <div className="form-group">
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
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Bio Details</label>
              <textarea
                name="bio"
                className="form-textarea"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                placeholder="About yourself, dietary goals..."
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Saving changes...' : 'Save Profile Changes 💾'}
            </button>
          </form>
        </div>

        {/* Right Security Forms */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3>🔒 Update Password</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Safeguard your authentication details.
          </p>

          {pwdError && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{pwdError}</p>}
          {pwdSuccess && <p style={{ color: 'var(--accent)', marginBottom: '16px' }}>{pwdSuccess}</p>}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Old Password</label>
              <input
                type="password"
                className="form-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Change Password 🔑
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
