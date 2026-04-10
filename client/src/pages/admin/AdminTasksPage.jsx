import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import { formatDate, priorityColor, statusColor, categoryColor, isOverdue } from '../../utils/helpers';

const PRIORITIES = ['', 'High', 'Medium', 'Low'];
const STATUSES = ['', 'Pending', 'In Progress', 'Completed'];
const CATEGORIES = ['', 'Work', 'Study', 'Personal', 'Other'];

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ userId: '', priority: '', status: '', category: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/admin/tasks', { params }),
        api.get('/admin/users'),
      ]);
      setTasks(tasksRes.data.tasks);
      setUsers(usersRes.data.users);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const clearFilters = () => setFilters({ userId: '', priority: '', status: '', category: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-white">All Tasks</h1>
        <p className="text-slate-400 mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* User filter */}
          <select
            value={filters.userId}
            onChange={(e) => onFilter('userId', e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Users</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>

          <select value={filters.priority} onChange={(e) => onFilter('priority', e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Priorities</option>
            {PRIORITIES.filter(Boolean).map((p) => <option key={p}>{p}</option>)}
          </select>

          <select value={filters.status} onChange={(e) => onFilter('status', e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
          </select>

          <select value={filters.category} onChange={(e) => onFilter('category', e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c}>{c}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors">
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner text="Loading tasks…" />
      ) : tasks.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400">No tasks found{hasFilters ? ' with these filters' : ''}</p>
        </div>
      ) : (
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  {['Task', 'User', 'Priority', 'Status', 'Category', 'Deadline', 'Est.'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}
                    className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${isOverdue(task) ? 'bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-semibold text-white truncate">{task.title}</p>
                      {task.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {task.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs bg-slate-700 text-slate-400 rounded px-1.5 py-0.5">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {task.userId?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-300 text-xs font-medium truncate">{task.userId?.name || 'Unknown'}</p>
                          <p className="text-slate-500 text-xs truncate">{task.userId?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${priorityColor(task.priority)}`}>{task.priority}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${statusColor(task.status)}`}>{task.status}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${categoryColor(task.category)}`}>{task.category}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${isOverdue(task) ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                        {isOverdue(task) ? '⚠ ' : ''}{formatDate(task.deadline)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {task.estimatedTime ? `${task.estimatedTime}h` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
            Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
