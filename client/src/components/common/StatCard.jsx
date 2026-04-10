export default function StatCard({ label, value, icon, color = 'primary', sub }) {
  const colors = {
    primary: 'from-primary-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    blue: 'from-blue-500 to-cyan-600',
    violet: 'from-violet-500 to-purple-600',
  };

  return (
    <div className="card p-5 animate-fade-in hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
