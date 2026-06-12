import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { planAPI } from '../services/api';

const DietPlan = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activePlan, setActivePlan] = useState(null);
  const [groceryList, setGroceryList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Plan generation parameters
  const [weight, setWeight] = useState(user?.weight_kg || '');
  const [height, setHeight] = useState(user?.height_cm || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [activity, setActivity] = useState(user?.activity_level || 'moderate');
  const [goal, setGoal] = useState(user?.goal || 'maintain');
  const [name, setName] = useState('My Personalized Plan');

  const fetchActivePlan = async () => {
    try {
      const res = await planAPI.getPlans();
      const active = res.data.find(p => p.is_active);
      if (active) {
        setActivePlan(active);
        const grocRes = await planAPI.getGroceryList(active.id);
        setGroceryList(grocRes.data);
      } else {
        setActivePlan(null);
        setGroceryList(null);
      }
    } catch (err) {
      console.error('Error fetching diet plan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        weight_kg: parseFloat(weight),
        height_cm: parseFloat(height),
        age: parseInt(age),
        gender,
        activity_level: activity,
        goal,
        name
      };
      const res = await planAPI.generatePlan(payload);
      setActivePlan(res.data.plan);
      
      // Refresh grocery list
      const grocRes = await planAPI.getGroceryList(res.data.plan.id);
      setGroceryList(grocRes.data);
    } catch (err) {
      setError('Could not generate plan. Please verify stats inputs.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    try {
      await planAPI.deletePlan(id);
      setActivePlan(null);
      setGroceryList(null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Diet Plans... 🍲</div>;
  }

  return (
    <div>
      <div className="app-header">
        <div>
          <h2>📋 {t('dietPlan')}</h2>
          <p style={{ fontSize: '0.9rem' }}>Generate specialized diet schedules tailored to your lifestyle.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left: Active Diet Plan */}
        <div>
          {activePlan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: 'var(--accent)' }}>{activePlan.name}</h3>
                    <p style={{ fontSize: '0.85rem' }}>Goal: {t(activePlan.goal + 'Weight')} | Target: {activePlan.target_calories} kcal</p>
                  </div>
                  <button className="btn btn-danger" onClick={() => handleDelete(activePlan.id)}>
                    Delete Plan
                  </button>
                </div>

                <div className="grid-cols-4" style={{ display: 'grid', gap: '12px', marginTop: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calories</span>
                    <h3>{activePlan.target_calories} kcal</h3>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Protein</span>
                    <h3>{activePlan.protein_g}g</h3>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Carbs</span>
                    <h3>{activePlan.carbs_g}g</h3>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fats</span>
                    <h3>{activePlan.fat_g}g</h3>
                  </div>
                </div>

                <h4 style={{ marginBottom: '12px' }}>Meal Schedule</h4>
                <div className="meal-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activePlan.meal_slots.map((slot) => (
                    <div key={slot.id} className="meal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {slot.meal_type === 'breakfast' ? '🌅' : slot.meal_type === 'lunch' ? '☀️' : slot.meal_type === 'dinner' ? '🌙' : '🍎'}
                          </span>
                          <h4 style={{ textTransform: 'capitalize' }}>{slot.meal_type}</h4>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{slot.time_suggestion}</span>
                        <ul style={{ paddingLeft: '16px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {slot.foods.map((food, idx) => <li key={idx}>{food}</li>)}
                        </ul>
                      </div>
                      <div style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {slot.target_calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grocery List Card */}
              {groceryList && (
                <div className="card">
                  <h3>🛒 {t('groceryList')}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Auto-compiled ingredients needed for this plan (Total items: {groceryList.total_items})
                  </p>

                  <div className="grid-cols-2" style={{ display: 'grid', gap: '20px' }}>
                    {groceryList.grocery_list.map((cat, i) => (
                      <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ color: 'var(--accent)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                          {cat.category}
                        </h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {cat.items.map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.875rem' }}>
                              <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ marginBottom: '16px' }}>{t('noPlanYet')}</p>
            </div>
          )}
        </div>

        {/* Right: Plan Parameters Form */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3>⚡ {t('generatePlan')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Customize your calorie budgets and target weight plan.
          </p>

          {error && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>}

          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">{t('planName')}</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Mass Phase Plan"
                required
              />
            </div>

            <div className="grid-cols-2" style={{ display: 'grid', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-cols-2" style={{ display: 'grid', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('goal')}</label>
              <select className="form-select" value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="lose">{t('loseWeight')}</option>
                <option value="maintain">{t('maintainWeight')}</option>
                <option value="gain">{t('gainMuscle')}</option>
                <option value="healthy">{t('healthyEating')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('activityLevel')}</label>
              <select className="form-select" value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="sedentary">Sedentary (Office job)</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Very Active</option>
                <option value="very_active">Extra Active</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">{t('dietPreference')}</label>
              <select className="form-select" value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="none">{t('none')}</option>
                <option value="vegetarian">{t('vegetarian')}</option>
                <option value="vegan">{t('vegan')}</option>
                <option value="gluten_free">{t('glutenFree')}</option>
                <option value="diabetic">{t('diabetic')}</option>
                <option value="keto">{t('keto')}</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Generating...' : t('createPlanBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;
