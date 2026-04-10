import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and ALL their tasks? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success(`User "${name}" deleted`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggle = async (id, name, isActive) => {
    try {
      await api.put(`/admin/users/${id}/toggle-status`);
      toast.success(`User "${name}" ${isActive ? 'deactivated' : 'activated'}`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Users Management</h1>
          <p className="text-slate-400 mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <Spinner text="Loading users…" />
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-400">No users found</p>
        </div>
      ) : (
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  {['User', 'Role', 'Status', 'Tasks', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">
                            {user.name}
                            {user._id === me?._id && <span className="ml-1.5 text-xs text-indigo-400">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.role === 'admin' ? 'bg-rose-900/40 text-rose-400' : 'bg-indigo-900/30 text-indigo-400'}`}>
                        {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.isActive ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {user.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-300">
                        <span className="font-semibold">{user.totalTasks}</span>
                        <span className="text-slate-500 text-xs ml-1">({user.completedTasks} done)</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {user._id !== me?._id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(user._id, user.name, user.isActive)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                              user.isActive
                                ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50'
                                : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                            }`}>
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 font-medium transition-colors">
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
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
