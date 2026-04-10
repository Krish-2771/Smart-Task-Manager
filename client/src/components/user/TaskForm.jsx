import { useState } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High'];
const CATEGORIES = ['Work', 'Study', 'Personal', 'Other'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

export default function TaskForm({ initial = {}, onSubmit, loading, submitLabel = 'Save Task' }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    deadline: initial.deadline ? new Date(initial.deadline).toISOString().split('T')[0] : '',
    priority: initial.priority || 'Medium',
    category: initial.category || 'Work',
    status: initial.status || 'Pending',
    estimatedTime: initial.estimatedTime || '',
    tags: initial.tags?.join(', ') || '',
    reminder: initial.reminder || false,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    else if (form.title.trim().length > 100) errs.title = 'Title cannot exceed 100 characters';

    if (!form.deadline) errs.deadline = 'Deadline is required';

    if (form.description && form.description.length > 1000)
      errs.description = 'Description cannot exceed 1000 characters';

    if (form.estimatedTime && (isNaN(form.estimatedTime) || Number(form.estimatedTime) < 0.5))
      errs.estimatedTime = 'Estimated time must be at least 0.5 hours';

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});

    const payload = {
      ...form,
      title: form.title.trim(),
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : undefined,
    };
    onSubmit(payload);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Title */}
      <div>
        <label className="label">Task Title <span className="text-red-500">*</span></label>
        <input name="title" value={form.title} onChange={onChange}
          placeholder="Enter a clear, specific task title"
          className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`} />
        <div className="flex justify-between mt-1">
          {errors.title ? <p className="text-xs text-red-500">{errors.title}</p> : <span />}
          <span className={`text-xs ${form.title.length > 90 ? 'text-amber-500' : 'text-slate-400'}`}>{form.title.length}/100</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea name="description" value={form.description} onChange={onChange} rows={3}
          placeholder="Optional: describe what this task involves…"
          className={`input resize-none ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`} />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Row: Deadline + Estimated Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Deadline <span className="text-red-500">*</span></label>
          <input type="date" name="deadline" value={form.deadline} onChange={onChange}
            min={!initial.deadline ? today : undefined}
            className={`input ${errors.deadline ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>}
        </div>
        <div>
          <label className="label">Estimated Time (hours)</label>
          <input type="number" name="estimatedTime" value={form.estimatedTime} onChange={onChange}
            placeholder="e.g. 2.5" min="0.5" max="999" step="0.5"
            className={`input ${errors.estimatedTime ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {errors.estimatedTime && <p className="mt-1 text-xs text-red-500">{errors.estimatedTime}</p>}
        </div>
      </div>

      {/* Row: Priority + Category + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Priority</label>
          <select name="priority" value={form.priority} onChange={onChange} className="input">
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" value={form.category} onChange={onChange} className="input">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" value={form.status} onChange={onChange} className="input">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags <span className="text-slate-400 font-normal">(comma separated)</span></label>
        <input name="tags" value={form.tags} onChange={onChange}
          placeholder="e.g. urgent, client, report"
          className="input" />
        <p className="text-xs text-slate-400 mt-1">Press comma to separate tags</p>
      </div>

      {/* Reminder toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input type="checkbox" name="reminder" checked={form.reminder} onChange={onChange} className="sr-only peer" />
          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-primary-600 transition-colors" />
          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Reminder 🔔</span>
      </label>

      {/* Submit */}
      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}
