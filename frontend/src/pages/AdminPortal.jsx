import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Users, 
  FileText, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { adminAPI } from '../services/api';

const getActionClass = (action) => {
  const lower = (action || '').toLowerCase();
  if (lower.includes('login') || lower.includes('register')) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (lower.includes('update') || lower.includes('change') || lower.includes('edit')) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  if (lower.includes('delete') || lower.includes('logout')) return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  return 'bg-slate-800 text-slate-400 border border-slate-700/50';
};

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [userRoleUpdates, setUserRoleUpdates] = useState({});
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  // Fetch Stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await adminAPI.getStats();
      return response.data;
    },
    enabled: activeTab === 'stats' && !!token,
  });

  // Fetch Users
  const { data: users = {}, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await adminAPI.getUsers();
      return response.data;
    },
    enabled: activeTab === 'users' && !!token,
  });

  // Fetch Audit Logs
  const { data: auditLogs = {}, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const response = await adminAPI.getAuditLogs();
      return response.data;
    },
    enabled: activeTab === 'logs' && !!token,
  });

  // Change User Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      await adminAPI.updateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      alert('User role updated successfully.');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to update user role.');
    }
  });

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3 bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              <Shield className="w-8 h-8 text-violet-400 animate-pulse" />
              Administrative Command Center
            </h1>
            <p className="text-slate-400 mt-2">
              Oversee users, examine real-time security logs, and monitor platform performance metrics.
            </p>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-800 gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`pb-4 px-2 font-semibold text-sm transition-all relative ${activeTab === 'stats' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Platform Overview
            </div>
            {activeTab === 'stats' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-400 rounded-full" />}
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-semibold text-sm transition-all relative ${activeTab === 'users' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Role Configuration
            </div>
            {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-400 rounded-full" />}
          </button>

          <button 
            onClick={() => setActiveTab('logs')}
            className={`pb-4 px-2 font-semibold text-sm transition-all relative ${activeTab === 'logs' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Audit Logs
            </div>
            {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-400 rounded-full" />}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'stats' && (
          <div>
            {statsLoading ? (
              <div className="py-20 text-center text-slate-400">Compiling statistics...</div>
            ) : statsError ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                Failed to load statistics. You may not have administrative privileges.
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Accounts Registered</span>
                  <h3 className="text-4xl font-extrabold text-violet-400 mt-2">{stats.total_users || 0}</h3>
                  <p className="text-xs text-slate-500 mt-2">Active database nodes</p>
                </div>

                <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Plan Creators & Dieticians</span>
                  <h3 className="text-4xl font-extrabold text-emerald-400 mt-2">
                    {stats.users_by_role?.dietician || stats.total_dieticians || 0}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">Verified diet consultants</p>
                </div>

                <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Platform Staff Admins</span>
                  <h3 className="text-4xl font-extrabold text-amber-400 mt-2">
                    {((stats.users_by_role?.admin || 0) + (stats.users_by_role?.super_admin || 0)) || stats.total_admins || 0}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">With system permissions</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
            {usersLoading ? (
              <div className="py-20 text-center text-slate-400">Loading user registry...</div>
            ) : usersError ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl m-6">
                Failed to load user database. Administrative authorization missing.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-extrabold">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Current Role</th>
                      <th className="p-4 text-right">Modify Permission</th>
                    </tr>
                  </thead>
                  <tbody>
                     {(users.results || (Array.isArray(users) ? users : [])).map((u) => (
                      <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 font-semibold text-slate-200">{u.username}</td>
                        <td className="p-4 text-slate-400">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            u.role === 'dietician' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={updateRoleMutation.isPending}
                            className="bg-slate-850 border border-slate-700 text-slate-200 rounded-xl px-3 py-1 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                          >
                            <option value="user">User</option>
                            <option value="dietician">Dietician</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
            {logsLoading ? (
              <div className="py-20 text-center text-slate-400">Retrieving system security trail...</div>
            ) : logsError ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl m-6">
                Access Denied: Audit Logs are only viewable by system SuperAdmins.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-extrabold">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Operator</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Resource</th>
                      <th className="p-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                     {(auditLogs.logs || (Array.isArray(auditLogs) ? auditLogs : [])).map((log) => (
                      <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-900/10 transition-colors text-sm">
                        <td className="p-4 text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 font-semibold text-slate-300">
                          {log.user || 'System / Anonymous'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${getActionClass(log.action)}`}>
                            {log.action.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 truncate max-w-xs font-mono text-xs" title={`${log.method} ${log.endpoint}`}>
                          <span className="text-violet-400 mr-2">[{log.method}]</span>
                          {log.endpoint}
                          <span className="text-slate-500 ml-2">({log.status_code})</span>
                        </td>
                        <td className="p-4 text-slate-500 font-mono">{log.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPortal;
