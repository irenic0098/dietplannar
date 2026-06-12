import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trackingAPI } from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const { t } = useLanguage();

  const [period, setPeriod] = useState('week'); // week, month
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await trackingAPI.getReport(period);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch report data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading nutrition analysis report... 📊</div>;
  }

  // Prepare Weight Chart Data
  const weightLabels = reportData?.weight_trend.map(w => w.date) || [];
  const weightValues = reportData?.weight_trend.map(w => w.weight_kg) || [];

  const weightChartConfig = {
    labels: weightLabels.length > 0 ? weightLabels : ['No Data'],
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightValues.length > 0 ? weightValues : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  // Prepare Calorie Chart Data
  const calorieLabels = reportData?.daily_nutrition.map(n => n.date) || [];
  const calorieValues = reportData?.daily_nutrition.map(n => n.calories) || [];

  const calorieChartConfig = {
    labels: calorieLabels.length > 0 ? calorieLabels : ['No Data'],
    datasets: [
      {
        label: 'Logged Calories (kcal)',
        data: calorieValues.length > 0 ? calorieValues : [0],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      }
    ]
  };

  return (
    <div>
      <div className="app-header">
        <div>
          <h2>📊 {t('weeklyReport')}</h2>
          <p style={{ fontSize: '0.9rem' }}>Detailed analysis of your calories, macro ratios, and biological gaps.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${period === 'week' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPeriod('week')}>
            Last 7 Days
          </button>
          <button className={`btn ${period === 'month' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPeriod('month')}>
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="reports-grid" style={{ marginBottom: '24px' }}>
        {/* Weight history Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>⚖️ Weight Progress over time</h3>
          <div style={{ height: '250px' }}>
            <Line
              data={weightChartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } },
                  x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                },
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        {/* Daily logged calories Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>🔥 Daily Calorie logs</h3>
          <div style={{ height: '250px' }}>
            <Bar
              data={calorieChartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } },
                  x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                },
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Deficiency Alerts & Suggestions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>🩺 {t('deficiencyTitle')}</h3>
        {reportData?.deficiency_alerts && reportData.deficiency_alerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reportData.deficiency_alerts.map((def, idx) => (
              <div key={idx} style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <h4 style={{ color: 'var(--warning)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                  {t('deficiencyWarning')} {def.nutrient}
                </h4>
                <p style={{ fontSize: '0.95rem' }}>
                  Your average: <strong>{def.current}</strong> vs Recommended: <strong>{def.target}</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500', marginTop: '6px' }}>
                  💡 {t('suggestedFoods')} {def.suggestion}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '16px',
            borderRadius: '8px',
            color: 'var(--accent)',
            fontWeight: '600'
          }}>
            ✅ {t('noDeficiencies')}
          </div>
        )}
      </div>

      {/* Exercise summaries */}
      {reportData?.exercise_summary && (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>🏃 Exercise & Workout stats</h3>
          <div className="grid-cols-3" style={{ gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Workout Sessions</span>
              <h2>{reportData.exercise_summary.total_sessions}</h2>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Calories Burned</span>
              <h2 style={{ color: 'var(--accent)' }}>{reportData.exercise_summary.total_calories_burned} kcal</h2>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Workout Minutes</span>
              <h2>{reportData.exercise_summary.total_minutes} mins</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
