import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import TaskCard from '../../components/user/TaskCard';
import Spinner from '../../components/common/Spinner';
import { priorityColor, statusColor, categoryColor, formatDate, isOverdue } from '../../utils/helpers';

const PRIORITIES = ['', 'High', 'Medium', 'Low'];
const STATUSES = ['', 'Pending', 'In Progress', 'Completed'];
const CATEGORIES = ['', 'Work', 'Study', 'Personal', 'Other'];
const SORTS = [
  { value: '', label: 'Latest First' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'priority', label: 'Priority' },
];

export default function MyTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
  const [filters, setFilters] = useState({ priority: '', status: '', category: '', sort: '', search: '' });
  const [deleteId, setDeleteId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
      setStats(data.stats);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/tasks/${id}`, { status: 'Completed' });
      toast.success('Task marked as completed! 🎉');
      setTasks((prev) => prev.map((t) => t._id === id ? { ...t, status: 'Completed', completedAt: new Date() } : t));
    } catch {
      toast.error('Failed to update task');
    }
  };

  const onFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters({ priority: '', status: '', category: '', sort: '', search: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.total || 0} total · {stats.completed || 0} done · {stats.overdue || 0} overdue
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/add-task')} className="btn-primary">
          ➕ Add Task
        </button>
      </div>

      {/* Search + Filters */}
      <div className="card p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            value={filters.search}
            onChange={(e) => onFilter('search', e.target.value)}
            placeholder="Search by title, description, or tag…"
            className="input pl-10"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <select value={filters.priority} onChange={(e) => onFilter('priority', e.target.value)} className="input w-auto text-sm py-2">
            <option value="">All Priorities</option>
            {PRIORITIES.filter(Boolean).map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => onFilter('status', e.target.value)} className="input w-auto text-sm py-2">
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.category} onChange={(e) => onFilter('category', e.target.value)} className="input w-auto text-sm py-2">
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filters.sort} onChange={(e) => onFilter('sort', e.target.value)} className="input w-auto text-sm py-2">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              ✕ Clear
            </button>
          )}

          {/* View Toggle */}
          <div className="ml-auto flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {['card', 'list'].map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${viewMode === mode ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                {mode === 'card' ? '⊞' : '≡'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <Spinner text="Loading tasks…" />
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">📭</p>
          <p className="font-bold text-slate-700 dark:text-slate-200">No tasks found</p>
          <p className="text-slate-400 text-sm mt-1">
            {hasFilters ? 'Try adjusting your filters' : 'Create your first task to get started!'}
          </p>
          {!hasFilters && (
            <button onClick={() => navigate('/dashboard/add-task')} className="btn-primary mt-4">
              ➕ Add First Task
            </button>
          )}
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onDelete={handleDelete} onComplete={handleComplete} />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  {['Title', 'Priority', 'Status', 'Category', 'Deadline', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${isOverdue(task) ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{task.title}</p>
                      {task.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {task.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 rounded px-1.5 py-0.5">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${priorityColor(task.priority)}`}>{task.priority}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${statusColor(task.status)}`}>{task.status}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${categoryColor(task.category)}`}>{task.category}</span></td>
                    <td className="px-4 py-3">
                      <span className={isOverdue(task) ? 'text-red-500 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                        {formatDate(task.deadline)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {task.status !== 'Completed' && (
                          <button onClick={() => handleComplete(task._id)}
                            className="text-xs px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors font-medium">
                            ✓
                          </button>
                        )}
                        <button onClick={() => navigate(`/dashboard/tasks/edit/${task._id}`)}
                          className="text-xs px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors font-medium">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(task._id)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors font-medium">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
