import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitMerge, Activity, Key, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    workflows: 0,
    executions: 0,
    credentials: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data in parallel to build dashboard stats
      const [workflowsRes, executionsRes, credentialsRes, usersRes] = await Promise.allSettled([
        api.getWorkflows(),
        api.getExecutions(),
        api.getCredentials(),
        api.getUsers(),
      ]);

      setStats({
        workflows: workflowsRes.status === 'fulfilled' ? workflowsRes.value.data?.length || 0 : 0,
        executions: executionsRes.status === 'fulfilled' ? executionsRes.value.data?.length || 0 : 0,
        credentials: credentialsRes.status === 'fulfilled' ? credentialsRes.value.data?.length || 0 : 0,
        users: usersRes.status === 'fulfilled' ? usersRes.value.data?.length || 0 : 0,
      });

      // Check if all failed to show a general error (likely CORS or bad API key)
      if (workflowsRes.status === 'rejected' && executionsRes.status === 'rejected') {
        throw new Error(workflowsRes.reason?.message || 'Failed to connect to n8n API. Check API Key and CORS settings.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <button 
          onClick={fetchStats} 
          disabled={loading}
          className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-sm">Connection Error</h3>
            <p className="text-xs mt-1">{error}</p>
            <p className="text-xs mt-2 font-medium">Note: Ensure your n8n instance has CORS configured to allow this app's domain if you are using it from a browser.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <DashboardCard 
          title="Workflows" 
          value={loading ? "..." : stats.workflows} 
          icon={<GitMerge className="text-blue-500" size={24} />} 
          to="/workflows"
          color="bg-blue-50"
        />
        <DashboardCard 
          title="Executions" 
          value={loading ? "..." : stats.executions} 
          icon={<Activity className="text-green-500" size={24} />} 
          to="/executions"
          color="bg-green-50"
        />
        <DashboardCard 
          title="Credentials" 
          value={loading ? "..." : stats.credentials} 
          icon={<Key className="text-amber-500" size={24} />} 
          to="/credentials"
          color="bg-amber-50"
        />
        <DashboardCard 
          title="Users" 
          value={loading ? "..." : stats.users} 
          icon={<Users className="text-purple-500" size={24} />} 
          to="/users"
          color="bg-purple-50"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, to, color }: { title: string, value: number | string, icon: React.ReactNode, to: string, color: string }) {
  return (
    <Link to={to} className="block bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 active:scale-95 transition-transform">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className="text-neutral-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
    </Link>
  );
}
