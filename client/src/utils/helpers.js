// Format date for display
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// Format date for input[type=date]
export const toInputDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

// Check if task is overdue
export const isOverdue = (task) =>
  task.status !== 'Completed' && new Date(task.deadline) < new Date();

// Days until deadline
export const daysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Priority color classes
export const priorityColor = (priority) => ({
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}[priority] || 'bg-slate-100 text-slate-600');

// Status color classes
export const statusColor = (status) => ({
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}[status] || 'bg-slate-100 text-slate-600');

// Category color classes
export const categoryColor = (category) => ({
  Work: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Study: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Personal: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}[category] || 'bg-slate-100 text-slate-600');

// Generate AI suggestions from task data
export const generateAISuggestions = (tasks) => {
  const suggestions = [];
  if (!tasks || tasks.length === 0) {
    return ['Add your first task to get personalized AI insights!'];
  }

  const now = new Date();
  const overdue = tasks.filter((t) => t.status !== 'Completed' && new Date(t.deadline) < now);
  const highPriority = tasks.filter((t) => t.priority === 'High' && t.status !== 'Completed');
  const dueSoon = tasks.filter((t) => {
    const days = daysUntil(t.deadline);
    return days >= 0 && days <= 3 && t.status !== 'Completed';
  });
  const completed = tasks.filter((t) => t.status === 'Completed');
  const pending = tasks.filter((t) => t.status === 'Pending');
  const inProgress = tasks.filter((t) => t.status === 'In Progress');
  const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

  if (overdue.length > 0) {
    suggestions.push(`🚨 You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} — tackle them first today!`);
  }
  if (highPriority.length > 3) {
    suggestions.push(`⚡ ${highPriority.length} high-priority tasks are pending. Consider delegating or breaking them down.`);
  }
  if (dueSoon.length > 0) {
    suggestions.push(`⏰ ${dueSoon.length} task${dueSoon.length > 1 ? 's are' : ' is'} due within 3 days — stay focused!`);
  }
  if (completionRate >= 70) {
    suggestions.push(`🎉 Amazing! You've completed ${Math.round(completionRate)}% of your tasks. Keep the momentum going!`);
  } else if (completionRate > 0 && completionRate < 30) {
    suggestions.push(`💡 Your completion rate is ${Math.round(completionRate)}%. Try completing small tasks first to build momentum.`);
  }
  if (inProgress.length > 5) {
    suggestions.push(`🔄 You have ${inProgress.length} tasks in progress. Focus on finishing before starting new ones.`);
  }
  if (pending.length > 10) {
    suggestions.push(`📋 ${pending.length} pending tasks detected. Try the 2-minute rule: if it takes < 2 min, do it now!`);
  }
  const workTasks = tasks.filter((t) => t.category === 'Work');
  const personalTasks = tasks.filter((t) => t.category === 'Personal');
  if (workTasks.length > personalTasks.length * 3) {
    suggestions.push(`🧘 Work tasks dominate your list. Remember to schedule personal time for balance!`);
  }
  if (tasks.some((t) => t.estimatedTime > 8 && t.status !== 'Completed')) {
    suggestions.push(`🔪 You have large tasks (8+ hrs). Try breaking them into smaller subtasks for better progress.`);
  }
  if (suggestions.length === 0) {
    suggestions.push(`✅ Everything looks balanced! Keep up your consistent work habits.`);
    suggestions.push(`🎯 Set deadlines for all tasks to improve your scheduling accuracy.`);
  }

  return suggestions.slice(0, 4);
};

export const truncate = (str, n = 60) =>
  str?.length > n ? str.slice(0, n) + '…' : str;
