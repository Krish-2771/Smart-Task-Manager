import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import TaskForm from '../../components/user/TaskForm';

export default function AddTaskPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await api.post('/tasks', formData);
      toast.success('Task created successfully! 🎉');
      navigate('/dashboard/tasks');
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors ? errors.map((e) => e.message).join(', ') : err.response?.data?.message || 'Failed to create task';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Add New Task</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Fill in the details to create a new task</p>
      </div>

      <div className="card p-6">
        <TaskForm onSubmit={handleSubmit} loading={loading} submitLabel="➕ Create Task" />
      </div>
    </div>
  );
}
