import { useEffect, useState } from 'react';
import api from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import Spinner from '../../components/common/Spinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';

const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
const STATUS_COLORS = { Completed: '#10b981', 'In Progress': '#3b82f6', Pending: '#94a3b8' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner text="Loading admin stats…" />;
  if (!stats) return <p className="text-slate-500">Failed to load stats.</p>;

  const priorityChartData = stats.priorityDist.map((d) => ({ name: d._id, value: d.count }));
  const statusChartData = stats.statusDist.map((d) => ({ name: d._id, value: d.count }));
  const usersChartData = stats.tasksPerUser.map((u) => ({ name: u.name.split(' ')[0], tasks: u.count }));

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Admin Dashboard 🛡️</h1>
        <p className="text-slate-400 mt-1">Full system overview and analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" color="blue" />
        <StatCard label="Total Tasks" value={stats.totalTasks} icon="📋" color="primary" />
        <StatCard label="Completed Today" value={stats.tasksCompletedToday} icon="✅" color="green" />
        <StatCard label="Active Users" value={stats.tasksPerUser.length} icon="⚡" color="violet" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority Pie */}
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="font-bold text-white mb-4">Priority Distribution</h3>
          {priorityChartData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={priorityChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {priorityChartData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie */}
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="font-bold text-white mb-4">Status Distribution</h3>
          {statusChartData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tasks per User Bar */}
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="font-bold text-white mb-4">Tasks per User (Top 10)</h3>
          {usersChartData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={usersChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Productivity Trend */}
      <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl border border-slate-700 p-5">
        <h3 className="font-bold text-white mb-4">System Productivity Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.productivityTrend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
            <Legend />
            <Line type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} name="Tasks Created" />
            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Tasks Completed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Most Active Users */}
      <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl border border-slate-700 p-5">
        <h3 className="font-bold text-white mb-4">Most Active Users</h3>
        {stats.tasksPerUser.length === 0 ? (
          <p className="text-slate-400 text-sm">No user activity yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.tasksPerUser.slice(0, 5).map((u, i) => (
              <div key={u._id} className="flex items-center gap-4">
                <span className="text-slate-500 text-sm w-5 text-right">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-indigo-500/30 overflow-hidden" style={{ width: '80px' }}>
                    <div className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${Math.min((u.count / (stats.tasksPerUser[0]?.count || 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-sm font-bold text-indigo-400 w-8 text-right">{u.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
