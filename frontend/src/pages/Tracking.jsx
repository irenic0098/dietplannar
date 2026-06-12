import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trackingAPI, foodAPI } from '../services/api';

const Tracking = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('food'); // food, exercise, weight
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Food log state
  const [foodLogs, setFoodLogs] = useState([]);
  const [foodTotals, setFoodTotals] = useState({});
  const [foodSearch, setFoodSearch] = useState('');
  const [matchingFoods, setMatchingFoods] = useState([]);
  const [chosenFood, setChosenFood] = useState(null);
  const [foodQty, setFoodQty] = useState(100);
  const [mealType, setMealType] = useState('lunch');

  // Exercise log state
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [exerciseType, setExerciseType] = useState('cardio');
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [exerciseNotes, setExerciseNotes] = useState('');

  // Weight log state
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightInput, setWeightInput] = useState('');
  const [weightNote, setWeightNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'food') {
        const res = await trackingAPI.getFoodLog(selectedDate);
        setFoodLogs(res.data.logs || []);
        setFoodTotals(res.data.totals || {});
      } else if (activeTab === 'exercise') {
        const res = await trackingAPI.getExerciseLog(selectedDate);
        setExerciseLogs(res.data || []);
      } else if (activeTab === 'weight') {
        const res = await trackingAPI.getWeightLog();
        setWeightLogs(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load tracking data', err);
      setError('Could not connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedDate]);

  // Food search helper
  const handleFoodSearchChange = async (e) => {
    const query = e.target.value;
    setFoodSearch(query);
    if (query.trim().length > 1) {
      try {
        const res = await foodAPI.searchFoods(`q=${query}`);
        setMatchingFoods(res.data.results || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setMatchingFoods([]);
    }
  };

  const handleAddFoodLog = async (e) => {
    e.preventDefault();
    if (!chosenFood) {
      setError('Please select a food from the list.');
      return;
    }
    setError('');

    try {
      const payload = {
        food: chosenFood.id,
        food_name: chosenFood.name,
        meal_type: mealType,
        quantity_g: parseFloat(foodQty),
        date: selectedDate
      };
      await trackingAPI.addFoodLog(payload);
      setChosenFood(null);
      setFoodSearch('');
      setMatchingFoods([]);
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to log food.');
    }
  };

  const handleDeleteFoodLog = async (id) => {
    try {
      await trackingAPI.deleteFoodLog(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExerciseLog = async (e) => {
    e.preventDefault();
    if (!exerciseName || !duration || !caloriesBurned) {
      setError('Please fill all exercise fields.');
      return;
    }
    setError('');

    try {
      const payload = {
        exercise_type: exerciseType,
        name: exerciseName,
        duration_minutes: parseInt(duration),
        calories_burned: parseFloat(caloriesBurned),
        date: selectedDate,
        notes: exerciseNotes
      };
      await trackingAPI.addExerciseLog(payload);
      setExerciseName('');
      setDuration('');
      setCaloriesBurned('');
      setExerciseNotes('');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to log exercise.');
    }
  };

  const handleDeleteExerciseLog = async (id) => {
    try {
      await trackingAPI.deleteExerciseLog(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWeightLog = async (e) => {
    e.preventDefault();
    if (!weightInput) {
      setError('Please input weight.');
      return;
    }
    setError('');

    try {
      const payload = {
        weight_kg: parseFloat(weightInput),
        date: selectedDate,
        note: weightNote
      };
      await trackingAPI.addWeightLog(payload);
      setWeightInput('');
      setWeightNote('');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to log weight. Weight logs must be unique per day.');
    }
  };

  return (
    <div>
      <div className="app-header">
        <div>
          <h2>⏱️ {t('tracking')}</h2>
          <p style={{ fontSize: '0.9rem' }}>Log meals, record calorie burns, and track weights daily.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem' }}>Select Date:</span>
          <input
            type="date"
            className="form-input"
            style={{ width: '160px', padding: '6px 12px' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'food' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('food')}
        >
          🍎 {t('foodLog')}
        </button>
        <button
          className={`btn ${activeTab === 'exercise' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('exercise')}
        >
          🏃 {t('exerciseLog')}
        </button>
        <button
          className={`btn ${activeTab === 'weight' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('weight')}
        >
          ⚖️ {t('weightLog')}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {activeTab === 'food' && (
        <div className="dashboard-grid">
          {/* Left: Log Food Form */}
          <div className="card">
            <h3>🍳 {t('addFood')}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Add a logged meal for {selectedDate}.
            </p>

            <form onSubmit={handleAddFoodLog}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Search Food Item</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type food name e.g. Banana, Oats..."
                  value={foodSearch}
                  onChange={handleFoodSearchChange}
                />
                
                {matchingFoods.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '74px',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10
                  }}>
                    {matchingFoods.map((food) => (
                      <div
                        key={food.id}
                        onClick={() => {
                          setChosenFood(food);
                          setFoodSearch(food.name);
                          setMatchingFoods([]);
                        }}
                        style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                      >
                        {food.name} ({food.calories} kcal / {food.serving_description})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {chosenFood && (
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  Selected: <strong>{chosenFood.name}</strong> ({chosenFood.calories} kcal per {chosenFood.serving_description})
                </div>
              )}

              <div className="grid-cols-2" style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">{t('quantity')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={foodQty}
                    onChange={(e) => setFoodQty(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('mealType')}</label>
                  <select className="form-select" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('save')} 🍎
              </button>
            </form>
          </div>

          {/* Right: Daily Food Log History */}
          <div className="card">
            <h3>📋 {t('history')} ({selectedDate})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calories</span>
                <h4>{foodTotals.total_calories || 0} kcal</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Protein</span>
                <h4>{foodTotals.total_protein || 0}g</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Carbs</span>
                <h4>{foodTotals.total_carbs || 0}g</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fat</span>
                <h4>{foodTotals.total_fat || 0}g</h4>
              </div>
            </div>

            {loading ? (
              <p>Loading log history...</p>
            ) : foodLogs.length > 0 ? (
              <div style={{ display: 'flex', flexParagraph: 'column', flexDirection: 'column', gap: '12px' }}>
                {foodLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <h4 style={{ textTransform: 'capitalize' }}>{log.food_name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Logged {log.quantity_g}g for {log.meal_type}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <strong>{log.calories} kcal</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>P: {log.protein_g}g | C: {log.carbs_g}g</div>
                      </div>
                      <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteFoodLog(log.id)}>
                        ✖
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>No foods logged on this date.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'exercise' && (
        <div className="dashboard-grid">
          {/* Left: Log Exercise Form */}
          <div className="card">
            <h3>🏃 {t('addExercise')}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Add a logged workout for {selectedDate}.
            </p>

            <form onSubmit={handleAddExerciseLog}>
              <div className="form-group">
                <label className="form-label">Exercise Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g. Morning Jog, Weight lifting..."
                  required
                />
              </div>

              <div className="grid-cols-3" style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Exercise Type</label>
                  <select className="form-select" value={exerciseType} onChange={(e) => setExerciseType(e.target.value)}>
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="yoga">Yoga</option>
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="swimming">Swimming</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('duration')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('caloriesBurned')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={exerciseNotes}
                  onChange={(e) => setExerciseNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('save')} 🏃
              </button>
            </form>
          </div>

          {/* Right: Exercise Log list */}
          <div className="card">
            <h3>📋 {t('history')} ({selectedDate})</h3>
            
            {loading ? (
              <p>Loading exercise history...</p>
            ) : exerciseLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {exerciseLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <h4>{log.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Type: {log.exercise_type} | Duration: {log.duration_minutes} mins
                      </p>
                      {log.notes && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Notes: {log.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <strong style={{ color: 'var(--accent)' }}>-{log.calories_burned} kcal</strong>
                      <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteExerciseLog(log.id)}>
                        ✖
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>No workouts logged on this date.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'weight' && (
        <div className="dashboard-grid">
          {/* Left: Log Weight Form */}
          <div className="card">
            <h3>⚖️ {t('addWeight')}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Record daily weight measurement.
            </p>

            <form onSubmit={handleAddWeightLog}>
              <div className="form-group">
                <label className="form-label">{t('weight')}</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 70.5"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Note</label>
                <input
                  type="text"
                  className="form-input"
                  value={weightNote}
                  onChange={(e) => setWeightNote(e.target.value)}
                  placeholder="e.g. Morning fasting weight"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {t('save')} ⚖️
              </button>
            </form>
          </div>

          {/* Right: Weight Log History */}
          <div className="card">
            <h3>📋 Weight History</h3>
            
            {loading ? (
              <p>Loading weight logs...</p>
            ) : weightLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {weightLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <h4>{log.weight_kg} kg</h4>
                      {log.note && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.note}</span>}
                    </div>
                    <strong>{log.date}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>No weight logs recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
