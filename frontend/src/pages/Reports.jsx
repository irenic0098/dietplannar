import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { trackingAPI } from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  Activity,
  AlertTriangle,
  FileCheck,
  Plus,
  RefreshCw,
  LineChart,
  ClipboardList,
  Sparkles
} from 'lucide-react';
import API_URL from '../config';
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
  const [activeSubTab, setActiveSubTab] = useState('analytics'); // analytics, medical
  const [period, setPeriod] = useState('week'); // week, month
  const [reportData, setReportData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  // Medical Reports State
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportType, setReportType] = useState('blood_test');
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReport = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await trackingAPI.getReport(period);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch report data', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  // Fetch medical reports list
  const { data: medicalReports = [], isLoading: medicalLoading } = useQuery({
    queryKey: ['medicalReports'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/reports/`, { headers });
      return response.data;
    },
    enabled: activeSubTab === 'medical' && !!token,
  });

  // Fetch detected deficiencies
  const { data: detectedDeficiencies = [] } = useQuery({
    queryKey: ['detectedDeficiencies'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/reports/deficiencies/`, { headers });
      return response.data;
    },
    enabled: activeSubTab === 'medical' && !!token,
  });

  // Upload Medical Report Mutation
  const uploadReportMutation = useMutation({
    mutationFn: async (formData) => {
      const config = {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      };
      const response = await axios.post(`${API_URL}/api/v1/reports/`, formData, config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicalReports']);
      setSelectedFile(null);
      alert('Medical report uploaded successfully! AI is analyzing details in background.');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to upload medical report.');
    }
  });

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('report_type', reportType);
    uploadReportMutation.mutate(formData);
  };

  // Prepare Weight Chart Data
  const weightLabels = reportData?.weight_trend?.map(w => w.date) || [];
  const weightValues = reportData?.weight_trend?.map(w => w.weight_kg) || [];

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
  const calorieLabels = reportData?.daily_nutrition?.map(n => n.date) || [];
  const calorieValues = reportData?.daily_nutrition?.map(n => n.calories) || [];

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
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
              <ClipboardList className="w-8 h-8 text-emerald-400" />
              Health Analytics & Reports
            </h1>
            <p className="text-slate-400 mt-2">
              Track caloric intake trends, weight updates, and upload blood work for automated AI deficiency mapping.
            </p>
          </div>

          {/* Sub tabs */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-350 ${
                activeSubTab === 'analytics' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-450 hover:text-white'
              }`}
            >
              <LineChart className="w-4 h-4" />
              Weekly Progress
            </button>
            <button
              onClick={() => setActiveSubTab('medical')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-350 ${
                activeSubTab === 'medical' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-450 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Lab Report Vault
            </button>
          </div>
        </div>

        {/* Tab 1: Weekly Analytics */}
        {activeSubTab === 'analytics' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Caloric & Weight Patterns
              </h2>
              <div className="flex gap-2">
                <button 
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    period === 'week' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                  onClick={() => setPeriod('week')}
                >
                  Last 7 Days
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    period === 'month' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                  onClick={() => setPeriod('month')}
                >
                  Last 30 Days
                </button>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="py-20 text-center text-slate-400">Loading metrics...</div>
            ) : (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Weight Progress Chart */}
                  <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-xl">
                    <h3 className="text-base font-bold mb-4 text-slate-200">⚖️ Weight Progression</h3>
                    <div className="h-[250px]">
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

                  {/* Calories Progress Chart */}
                  <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-xl">
                    <h3 className="text-base font-bold mb-4 text-slate-200">🔥 Calorie Log Trend</h3>
                    <div className="h-[250px]">
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

                {/* Dietary gap alerts */}
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-xl mb-8">
                  <h3 className="text-base font-bold mb-4 text-slate-200">🩺 {t('deficiencyTitle')}</h3>
                  {reportData?.deficiency_alerts && reportData.deficiency_alerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportData.deficiency_alerts.map((def, idx) => (
                        <div key={idx} className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                          <h4 className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                            {t('deficiencyWarning')} {def.nutrient}
                          </h4>
                          <p className="text-sm mt-1 text-slate-350">
                            Your logged average: <strong className="text-white">{def.current}</strong> vs Target: <strong className="text-white">{def.target}</strong>
                          </p>
                          <p className="text-sm text-emerald-400 font-semibold mt-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {def.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl font-semibold">
                      ✅ {t('noDeficiencies')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Medical Reports */}
        {activeSubTab === 'medical' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Upload form & detected deficiencies */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Form card */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-xl">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  Add Lab Report
                </h3>
                <form onSubmit={handleFileUpload} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-bold">Report Type</label>
                    <select 
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="blood_test">Complete Blood Count (CBC)</option>
                      <option value="lipid_profile">Lipid Profile / Cholesterol</option>
                      <option value="urine_test">Urine Analysis</option>
                      <option value="thyroid_profile">Thyroid Profile</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-bold">Select File (PDF or Image)</label>
                    <input 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      accept=".pdf,image/*"
                      required
                      className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploadReportMutation.isPending}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadReportMutation.isPending ? 'Uploading...' : 'Scan Report & Upload'}
                  </button>
                </form>
              </div>

              {/* Deficiencies Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-xl">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  AI Mapped Deficiencies
                </h3>
                {detectedDeficiencies.length === 0 ? (
                  <p className="text-sm text-slate-500">No lab reports have mapped deficiencies yet. Upload blood work to run analysis.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {detectedDeficiencies.map((d) => (
                      <div key={d.id} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-rose-450">{d.nutrient_name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 uppercase font-mono">{d.severity}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Found in: {d.health_report?.title || 'Lab report'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* List and reports detailed */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-xl">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  Uploaded Lab Work ({medicalReports.length})
                </h3>

                {medicalLoading ? (
                  <div className="py-12 text-center text-slate-500">Fetching records...</div>
                ) : medicalReports.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">No medical files uploaded yet. Add your lab work above.</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {medicalReports.map((report) => (
                      <div key={report.id} className="p-5 border border-slate-800 bg-slate-900/20 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/50 pb-3 mb-3">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{report.report_type_display}</span>
                            <h4 className="text-base font-bold mt-0.5 text-slate-200">{report.title}</h4>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-center ${
                            report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            report.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                            'bg-slate-850 text-slate-400'
                          }`}>
                            {report.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-400">
                          {report.status === 'completed' && report.ai_remarks ? (
                            <div>
                              <strong className="text-slate-350 block mb-1">AI Health Summary:</strong>
                              <p className="leading-relaxed whitespace-pre-line">{report.ai_remarks}</p>
                            </div>
                          ) : report.status === 'processing' ? (
                            <p className="italic text-slate-500">AI analysis running in background. Please refresh in a moment...</p>
                          ) : (
                            <p className="italic text-slate-500">Pending initial queue placement...</p>
                          )}
                        </div>

                        {report.file && (
                          <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-800/30 pt-3">
                            <span className="text-slate-500">File attached</span>
                            <a 
                              href={report.file} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-emerald-400 font-semibold hover:underline"
                            >
                              Open Document &rarr;
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
