import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { planAPI, trackingAPI, calculatorAPI } from '../services/api';
import ChatBot from '../components/ChatBot';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activePlan, setActivePlan] = useState(null);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterTarget, setWaterTarget] = useState(8);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [dailyMacros, setDailyMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch plan and daily tracking logs on load
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch plans to find active
        const planRes = await planAPI.getPlans();
        const active = planRes.data.find(p => p.is_active);
        if (active) {
          setActivePlan(active);
          setWaterTarget(Math.ceil(active.water_liters * 4)); // ~4 glasses per liter
        }

        // Fetch today's food log
        const todayStr = new Date().toISOString().split('T')[0];
        const foodRes = await trackingAPI.getFoodLog(todayStr);
        setLoggedMeals(foodRes.data.logs || []);
        
        const totals = foodRes.data.totals || {};
        setDailyCalories(totals.total_calories || 0);
        setDailyMacros({
          protein: totals.total_protein || 0,
          carbs: totals.total_carbs || 0,
          fat: totals.total_fat || 0,
        });

        // Fetch today's water log
        const waterRes = await trackingAPI.getWaterLog(todayStr);
        // Look for today's entry
        const todayWater = waterRes.data.find(w => w.date === todayStr);
        if (todayWater) {
          setWaterGlasses(todayWater.glasses);
          setWaterTarget(todayWater.target_glasses || 8);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAddWater = async () => {
    const newGlasses = waterGlasses + 1;
    setWaterGlasses(newGlasses);
    try {
      await trackingAPI.updateWaterLog({
        glasses: newGlasses,
        target_glasses: waterTarget,
        ml_consumed: newGlasses * 250,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to update water log', err);
    }
  };

  const handleResetWater = async () => {
    setWaterGlasses(0);
    try {
      await trackingAPI.updateWaterLog({
        glasses: 0,
        target_glasses: waterTarget,
        ml_consumed: 0,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to reset water log', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your dashboard... 🥗</div>;
  }

  // BMI calculations
  const bmiVal = user ? user.bmi : 0;
  let bmiCategory = "Underweight";
  let bmiColor = "#60a5fa";
  let bmiAdvice = "";

  if (bmiVal >= 30) {
    bmiCategory = "Obese";
    bmiColor = "#f87171";
    bmiAdvice = "Consult a health practitioner for advice.";
  } else if (bmiVal >= 25) {
    bmiCategory = "Overweight";
    bmiColor = "#fbbf24";
    bmiAdvice = "Try a moderate calorie deficit plan.";
  } else if (bmiVal >= 18.5) {
    bmiCategory = "Normal Weight";
    bmiColor = "#34d399";
    bmiAdvice = "Awesome! Keep maintaining a balanced diet.";
  } else {
    bmiCategory = "Underweight";
    bmiColor = "#60a5fa";
    bmiAdvice = "Try a calorie surplus diet plan.";
  }

  const calorieTarget = activePlan ? activePlan.target_calories : 2000;
  const calPercent = Math.min((dailyCalories / calorieTarget) * 100, 100);
  const waterPercent = Math.min((waterGlasses / waterTarget) * 100, 100);

  return (
    <div>
      <div className="app-header">
        <div>
          <h2>{t('welcome')}, {user?.username}! 👋</h2>
          <p style={{ fontSize: '0.9rem' }}>Here is your nutrition summary for today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="card stats-card" style={{ padding: '8px 16px' }}>
            <span>Goal: <strong>{activePlan ? t(activePlan.goal + 'Weight') : t('none')}</strong></span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Daily summaries and plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Calorie Progress Card */}
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>🔥 {t('dailySummary')}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>Calories Logged</span>
              <strong>{Math.round(dailyCalories)} / {calorieTarget} kcal</strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${calPercent}%` }}></div>
            </div>

            <div className="grid-cols-3" style={{ marginTop: '24px', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('protein')}</span>
                <h4 style={{ margin: '4px 0' }}>{Math.round(dailyMacros.protein)}g</h4>
                <div className="progress-bar-container" style={{ height: '4px' }}>
                  <div className="progress-bar-fill" style={{ 
                    width: `${Math.min((dailyMacros.protein / (activePlan?.protein_g || 120)) * 100, 100)}%`,
                    backgroundColor: '#10b981'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {activePlan ? Math.round(activePlan.protein_g) : 120}g</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('carbs')}</span>
                <h4 style={{ margin: '4px 0' }}>{Math.round(dailyMacros.carbs)}g</h4>
                <div className="progress-bar-container" style={{ height: '4px' }}>
                  <div className="progress-bar-fill" style={{ 
                    width: `${Math.min((dailyMacros.carbs / (activePlan?.carbs_g || 220)) * 100, 100)}%`,
                    backgroundColor: '#fbbf24'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {activePlan ? Math.round(activePlan.carbs_g) : 220}g</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('fats')}</span>
                <h4 style={{ margin: '4px 0' }}>{Math.round(dailyMacros.fat)}g</h4>
                <div className="progress-bar-container" style={{ height: '4px' }}>
                  <div className="progress-bar-fill" style={{ 
                    width: `${Math.min((dailyMacros.fat / (activePlan?.fat_g || 65)) * 100, 100)}%`,
                    backgroundColor: '#ef4444'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {activePlan ? Math.round(activePlan.fat_g) : 65}g</span>
              </div>
            </div>
          </div>

          {/* Active Diet Plan Meals */}
          <div className="card">
            <h3>📅 {t('activePlan')}</h3>
            {activePlan ? (
              <div className="meal-grid">
                <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{activePlan.name}</p>
                {activePlan.meal_slots.map((slot) => (
                  <div key={slot.id} className="meal-card">
                    <div className="meal-info">
                      <span style={{ fontSize: '1.5rem' }}>
                        {slot.meal_type === 'breakfast' ? '🌅' : slot.meal_type === 'lunch' ? '☀️' : slot.meal_type === 'dinner' ? '🌙' : '🍎'}
                      </span>
                      <div>
                        <h4 style={{ textTransform: 'capitalize' }}>{slot.meal_type}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{slot.time_suggestion}</span>
                        <ul className="meal-foods">
                          {slot.foods.map((food, i) => <li key={i}>• {food}</li>)}
                        </ul>
                      </div>
                    </div>
                    <strong>{slot.target_calories} kcal</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <p style={{ marginBottom: '16px' }}>{t('noPlanYet')}</p>
              </div>
            )}
          </div>

          {/* Logged Meals For Today */}
          <div className="card">
            <h3>🍽️ {t('todayLog')}</h3>
            {loggedMeals.length > 0 ? (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loggedMeals.map((log) => (
                  <div key={log.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <h4 style={{ textTransform: 'capitalize' }}>{log.food_name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Quantity: {log.quantity_g}g | Type: {log.meal_type}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong>{log.calories} kcal</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        P: {log.protein_g}g | C: {log.carbs_g}g | F: {log.fat_g}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{t('noMealsLogged')}</p>
            )}
          </div>
        </div>

        {/* Right Side: Hydration tracker & BMI Gauge & AI Quick Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Water Ring UI */}
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>💧 {t('waterTracker')}</h3>
            <div className="water-ring-container">
              <div className="water-ring" style={{ '--percent': `${waterPercent}%` }}>
                <div className="water-ring-content">
                  <h2 style={{ color: 'var(--info)' }}>{waterGlasses}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ {waterTarget} {t('glasses')}</span>
                </div>
              </div>
              <p style={{ marginBottom: '16px', fontSize: '0.9rem' }}>Logged: {waterGlasses * 250} ml ({waterGlasses} Glasses)</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%' }}>
                <button className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--info)' }} onClick={handleAddWater}>
                  + Glass (250ml)
                </button>
                <button className="btn btn-secondary" onClick={handleResetWater}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* BMI Gauge */}
          <div className="card">
            <h3>📐 {t('bmiCalculator')}</h3>
            <div className="bmi-gauge-container">
              <div className="bmi-gauge">
                <div className="bmi-marker" style={{ left: `${Math.min(Math.max(((bmiVal - 15) / 20) * 100, 0), 100)}%` }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your BMI</span>
                  <h3>{bmiVal}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category</span>
                  <h3 style={{ color: bmiColor }}>{bmiCategory}</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                {bmiAdvice}
              </p>
            </div>
          </div>

          {/* AI Quick Assistant Chatbot */}
          <ChatBot />

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
