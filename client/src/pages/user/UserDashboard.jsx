import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import AISuggestionsPanel from '../../components/user/AISuggestionsPanel';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/helpers';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';

const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
const CAT_COLORS = ['#6366f1', '#0ea5e9', '#ec4899', '#94a3b8'];
const STATUS_COLORS = { Completed: '#10b981', 'In Progress': '#3b82f6', Pending: '#94a3b8' };

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data: res } = await api.get('/tasks');
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <Spinner text="Loading your dashboard…" />;

  const { tasks = [], stats = {} } = data || {};

  // Chart data
  const priorityData = Object.entries(
    tasks.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const categoryData = Object.entries(
    tasks.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Trend: tasks created/completed over last 7 days (by createdAt)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStr = d.toDateString();
    const created = tasks.filter((t) => new Date(t.createdAt).toDateString() === dayStr).length;
    const completed = tasks.filter((t) => t.completedAt && new Date(t.completedAt).toDateString() === dayStr).length;
    return { date: label, created, completed };
  });

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your task overview for today, {formatDate(new Date())}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.total || 0} icon="📋" color="primary" />
        <StatCard label="Completed" value={stats.completed || 0} icon="✅" color="green" />
        <StatCard label="Pending" value={stats.pending || 0} icon="⏳" color="amber" />
        <StatCard label="Overdue" value={stats.overdue || 0} icon="🚨" color="red" />
      </div>

      {/* Charts Row */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Priority Pie */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {priorityData.map((e) => (
                <div key={e.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PRIORITY_COLORS[e.name] }} />
                  {e.name} ({e.value})
                </div>
              ))}
            </div>
          </div>

          {/* Category Bar */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Tasks by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Trend Line */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">7-Day Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Row: AI + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AISuggestionsPanel tasks={tasks} />

        {/* Recent Tasks */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">No tasks yet. <a href="/dashboard/add-task" className="text-primary-600 font-semibold">Add one!</a></p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'Completed' ? 'bg-emerald-400' : task.priority === 'High' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1 truncate">{task.title}</span>
                  <span className="text-xs text-slate-400 shrink-0">{formatDate(task.deadline)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
