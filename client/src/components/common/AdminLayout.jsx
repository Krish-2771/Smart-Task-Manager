import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/tasks', label: 'All Tasks', icon: '📋' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'flex flex-col h-full' : 'hidden lg:flex flex-col'} w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 p-5`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-md shadow-rose-600/30">
          <span className="text-xl">🛡️</span>
        </div>
        <div>
          <p className="font-extrabold text-white text-sm leading-tight">Smart Tasks</p>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-rose-600/20 text-rose-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            onClick={() => setSidebarOpen(false)}>
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-rose-900/50 flex items-center justify-center font-bold text-rose-400 text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">Admin</p>
          </div>
        </div>
        <button onClick={toggle}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-all w-full">
          <span>{dark ? '☀️' : '🌙'}</span>
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 font-medium transition-all w-full">
          <span>🚪</span><span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-50">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800">☰</button>
          <span className="font-bold text-white">🛡️ Admin Panel</span>
          <button onClick={toggle} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800">{dark ? '☀️' : '🌙'}</button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
