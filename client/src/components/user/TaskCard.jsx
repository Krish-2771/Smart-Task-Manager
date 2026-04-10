import { useNavigate } from 'react-router-dom';
import { formatDate, priorityColor, statusColor, categoryColor, isOverdue, daysUntil } from '../../utils/helpers';

export default function TaskCard({ task, onDelete, onComplete, compact = false }) {
  const navigate = useNavigate();
  const overdue = isOverdue(task);
  const days = daysUntil(task.deadline);

  return (
    <div className={`card p-5 animate-fade-in hover:shadow-md transition-all duration-200 ${overdue ? 'border-red-300 dark:border-red-800' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white truncate">{task.title}</h3>
          {task.description && !compact && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>
          )}
        </div>
        <span className={`badge ${priorityColor(task.priority)} shrink-0`}>{task.priority}</span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`badge ${statusColor(task.status)}`}>{task.status}</span>
        <span className={`badge ${categoryColor(task.category)}`}>{task.category}</span>
        {task.tags?.map((tag) => (
          <span key={tag} className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">#{tag}</span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-semibold' : days <= 3 && task.status !== 'Completed' ? 'text-amber-500 font-semibold' : ''}`}>
          📅 {overdue ? `Overdue: ${formatDate(task.deadline)}` : days === 0 ? 'Due today!' : `${formatDate(task.deadline)}`}
        </span>
        {task.estimatedTime && <span>⏱ {task.estimatedTime}h</span>}
        {task.reminder && <span>🔔 Reminder</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {task.status !== 'Completed' && (
          <button onClick={() => onComplete(task._id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
            ✓ Complete
          </button>
        )}
        <button onClick={() => navigate(`/dashboard/tasks/edit/${task._id}`)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors">
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(task._id)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 transition-colors ml-auto">
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
