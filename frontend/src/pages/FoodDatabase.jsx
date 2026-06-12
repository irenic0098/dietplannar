import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { foodAPI } from '../services/api';

const FoodDatabase = () => {
  const { t } = useLanguage();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom food state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    serving_size_g: 100,
    serving_description: '100g',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: 0,
    sugar_g: 0,
    cost_inr: 20,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_diabetic_friendly: false,
    is_keto: false
  });
  const [customError, setCustomError] = useState('');
  const [customSuccess, setCustomSuccess] = useState('');

  const fetchFoods = async () => {
    try {
      const res = await foodAPI.searchFoods('');
      setFoods(res.data.results);
      const catRes = await foodAPI.getFoodCategories();
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching food database', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      // Build query string manually for multiple parameters
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDiet) params.append('diet', selectedDiet);
      if (budgetLimit) params.append('budget', budgetLimit);

      const res = await foodAPI.searchFoods(params.toString());
      setFoods(res.data.results);
    } catch (err) {
      console.error('Search query failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setCustomError('');
    setCustomSuccess('');
    if (!customFood.name || !customFood.calories || !customFood.protein_g || !customFood.carbs_g || !customFood.fat_g) {
      setCustomError('Please fill in all core fields.');
      return;
    }

    try {
      const payload = {
        ...customFood,
        serving_size_g: parseFloat(customFood.serving_size_g),
        calories: parseFloat(customFood.calories),
        protein_g: parseFloat(customFood.protein_g),
        carbs_g: parseFloat(customFood.carbs_g),
        fat_g: parseFloat(customFood.fat_g),
        fiber_g: parseFloat(customFood.fiber_g),
        sugar_g: parseFloat(customFood.sugar_g),
        cost_inr: parseFloat(customFood.cost_inr)
      };

      await foodAPI.createCustomFood(payload);
      setCustomSuccess('Custom food added successfully!');
      setCustomFood({
        name: '',
        serving_size_g: 100,
        serving_description: '100g',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        fiber_g: 0,
        sugar_g: 0,
        cost_inr: 20,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        is_diabetic_friendly: false,
        is_keto: false
      });
      fetchFoods(); // Reload food list
    } catch (err) {
      setCustomError('Failed to create custom food item.');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="app-header">
        <div>
          <h2>🍎 {t('foodDb')}</h2>
          <p style={{ fontSize: '0.9rem' }}>Browse detailed macronutrient and micronutrient profiles for 200+ foods.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCustomForm(!showCustomForm)}>
          {showCustomForm ? 'View Database' : t('addCustomFood')} ➕
        </button>
      </div>

      {showCustomForm ? (
        /* Add Custom Food Form */
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h3>🎨 {t('addCustomFood')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Submit nutrition facts for custom ingredients.
          </p>

          {customError && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{customError}</p>}
          {customSuccess && <p style={{ color: 'var(--accent)', marginBottom: '16px' }}>{customSuccess}</p>}

          <form onSubmit={handleCustomSubmit}>
            <div className="form-group">
              <label className="form-label">{t('customFoodName')}</label>
              <input
                type="text"
                className="form-input"
                value={customFood.name}
                onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                placeholder="e.g. Grandma's Oats Blend"
                required
              />
            </div>

            <div className="grid-cols-3" style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Serving Size (g)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customFood.serving_size_g}
                  onChange={(e) => setCustomFood({ ...customFood, serving_size_g: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Serving Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={customFood.serving_description}
                  onChange={(e) => setCustomFood({ ...customFood, serving_description: e.target.value })}
                  placeholder="e.g. 1 cup"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Cost (INR)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customFood.cost_inr}
                  onChange={(e) => setCustomFood({ ...customFood, cost_inr: e.target.value })}
                />
              </div>
            </div>

            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '16px' }}>
              Macronutrients
            </h4>
            <div className="grid-cols-4" style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Calories</label>
                <input
                  type="number"
                  className="form-input"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                  placeholder="kcal"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Protein (g)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customFood.protein_g}
                  onChange={(e) => setCustomFood({ ...customFood, protein_g: e.target.value })}
                  placeholder="grams"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Carbs (g)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customFood.carbs_g}
                  onChange={(e) => setCustomFood({ ...customFood, carbs_g: e.target.value })}
                  placeholder="grams"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fat (g)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customFood.fat_g}
                  onChange={(e) => setCustomFood({ ...customFood, fat_g: e.target.value })}
                  placeholder="grams"
                  required
                />
              </div>
            </div>

            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '16px' }}>
              Dietary tags
            </h4>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <label style={{ display: 'flex', gap: '6px', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={customFood.is_vegetarian}
                  onChange={(e) => setCustomFood({ ...customFood, is_vegetarian: e.target.checked })}
                />
                Vegetarian
              </label>
              <label style={{ display: 'flex', gap: '6px', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={customFood.is_vegan}
                  onChange={(e) => setCustomFood({ ...customFood, is_vegan: e.target.checked })}
                />
                Vegan
              </label>
              <label style={{ display: 'flex', gap: '6px', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={customFood.is_gluten_free}
                  onChange={(e) => setCustomFood({ ...customFood, is_gluten_free: e.target.checked })}
                />
                Gluten-free
              </label>
              <label style={{ display: 'flex', gap: '6px', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={customFood.is_diabetic_friendly}
                  onChange={(e) => setCustomFood({ ...customFood, is_diabetic_friendly: e.target.checked })}
                />
                Diabetic-friendly
              </label>
              <label style={{ display: 'flex', gap: '6px', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={customFood.is_keto}
                  onChange={(e) => setCustomFood({ ...customFood, is_keto: e.target.checked })}
                />
                Ketogenic
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Submit Custom Food Facts 🍎
            </button>
          </form>
        </div>
      ) : (
        /* Database Catalog View */
        <div className="dashboard-grid">
          {/* Search/Filter bar and results */}
          <div>
            <div className="card" style={{ marginBottom: '24px' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: '200px' }}
                  placeholder={t('searchFood')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-select"
                  style={{ width: '180px' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <select
                  className="form-select"
                  style={{ width: '160px' }}
                  value={selectedDiet}
                  onChange={(e) => setSelectedDiet(e.target.value)}
                >
                  <option value="">Diet Preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten_free">Gluten-Free</option>
                  <option value="diabetic">Diabetic</option>
                  <option value="keto">Keto</option>
                </select>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </form>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Searching database... 🔍</div>
            ) : (
              <div className="grid-cols-2" style={{ display: 'grid', gap: '16px' }}>
                {foods.map((food) => (
                  <div
                    key={food.id}
                    className="card"
                    style={{ padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => setSelectedFood(food)}
                  >
                    <div>
                      <h4 style={{ color: 'var(--text-primary)' }}>{food.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Serving: {food.serving_description} | {food.category?.name || 'Food'}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {food.is_vegetarian && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(52,211,153,0.1)', color: '#34d399', borderRadius: '4px' }}>Veg</span>}
                        {food.is_vegan && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '4px' }}>Vegan</span>}
                        {food.is_gluten_free && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '4px' }}>GF</span>}
                        {food.is_keto && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '4px' }}>Keto</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{food.calories}</strong>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Nutrition Detail Panel */}
          <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: '20px' }}>
            {selectedFood ? (
              <div>
                <span style={{ fontSize: '2rem' }}>{selectedFood.category?.icon || '🍽️'}</span>
                <h3 style={{ margin: '8px 0' }}>{selectedFood.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Standard serving size: <strong>{selectedFood.serving_description} ({selectedFood.serving_size_g}g)</strong>
                </p>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '12px' }}>
                  Macro Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>Calories</span>
                    <strong>{selectedFood.calories} kcal</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>Protein</span>
                    <strong>{selectedFood.protein_g} g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>Carbohydrates</span>
                    <strong>{selectedFood.carbs_g} g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>Dietary Fats</span>
                    <strong>{selectedFood.fat_g} g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>Fiber</span>
                    <strong>{selectedFood.fiber_g} g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>Sugar</span>
                    <strong>{selectedFood.sugar_g} g</strong>
                  </div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '12px' }}>
                  Micronutrients
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div>Calcium: <strong>{selectedFood.calcium_mg} mg</strong></div>
                  <div>Iron: <strong>{selectedFood.iron_mg} mg</strong></div>
                  <div>Vitamin C: <strong>{selectedFood.vitamin_c_mg} mg</strong></div>
                  <div>Vitamin A: <strong>{selectedFood.vitamin_a_iu} IU</strong></div>
                  <div>Potassium: <strong>{selectedFood.potassium_mg} mg</strong></div>
                  <div>Sodium: <strong>{selectedFood.sodium_mg} mg</strong></div>
                </div>

                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Estimated Cost:</span>
                  <strong>₹{selectedFood.cost_inr} / serving</strong>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>Click on any food item to view detailed nutrition data.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDatabase;
