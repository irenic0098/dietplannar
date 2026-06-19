import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Bell, 
  Check, 
  Trash2, 
  Inbox, 
  AlertCircle, 
  Apple, 
  Droplet, 
  Activity, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'diet_plan':
      return <Apple className="w-5 h-5 text-emerald-400" />;
    case 'water_reminder':
      return <Droplet className="w-5 h-5 text-blue-400" />;
    case 'workout':
      return <Activity className="w-5 h-5 text-orange-400" />;
    case 'support':
      return <MessageSquare className="w-5 h-5 text-purple-400" />;
    default:
      return <Bell className="w-5 h-5 text-amber-400" />;
  }
};

const getNotificationClass = (type) => {
  switch (type) {
    case 'diet_plan':
      return 'border-emerald-500/20 bg-emerald-500/5';
    case 'water_reminder':
      return 'border-blue-500/20 bg-blue-500/5';
    case 'workout':
      return 'border-orange-500/20 bg-orange-500/5';
    case 'support':
      return 'border-purple-500/20 bg-purple-500/5';
    default:
      return 'border-amber-500/20 bg-amber-500/5';
  }
};

const Notifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // Fetch notifications
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/notifications/`, { headers });
      return response.data;
    },
    enabled: !!token,
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`${API_URL}/api/v1/notifications/read-all/`, {}, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      await axios.post(`${API_URL}/api/v1/notifications/${id}/read/`, {}, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Clear all mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`${API_URL}/api/v1/notifications/clear/`, {}, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
              <Bell className="w-8 h-8 text-emerald-400 animate-pulse" />
              Notifications
            </h1>
            <p className="text-slate-400 mt-2">
              Stay updated with your personalized diet schedule, hydration logs, and advice from experts.
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-3">
              <button 
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-sm font-semibold rounded-xl border border-slate-700/50 transition-all duration-300 active:scale-95 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </button>
              <button 
                onClick={() => clearAllMutation.mutate()}
                disabled={clearAllMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl border border-rose-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* List Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Fetching notifications...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Failed to load notifications. Please try again later.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 border border-slate-800/50 bg-slate-900/20 rounded-3xl text-center backdrop-blur-xl">
            <div className="w-16 h-16 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-center mb-6">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">All caught up!</h3>
            <p className="text-slate-400 mt-2 max-w-sm">
              You don't have any unread notifications. We'll alert you when there is updates to your plan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 hover:border-slate-700 hover:shadow-lg hover:shadow-emerald-500/2 ${
                  notif.is_read ? 'bg-slate-900/30 border-slate-800/50 opacity-75' : `border-slate-800 backdrop-blur-lg ${getNotificationClass(notif.notif_type)}`
                }`}
              >
                {/* Icon wrapper */}
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                  {getNotificationIcon(notif.notif_type)}
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">
                      {notif.notif_type_display}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-200 mt-1">{notif.title}</h4>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{notif.message}</p>
                </div>

                {/* Actions */}
                {!notif.is_read && (
                  <button 
                    onClick={() => markReadMutation.mutate(notif.id)}
                    className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-all duration-200 active:scale-90"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
