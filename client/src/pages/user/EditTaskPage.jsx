import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import TaskForm from '../../components/user/TaskForm';
import Spinner from '../../components/common/Spinner';

export default function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await api.get(`/tasks/${id}`);
        setTask(data.task);
      } catch (err) {
        toast.error('Task not found');
        navigate('/dashboard/tasks');
      } finally {
        setFetching(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await api.put(`/tasks/${id}`, formData);
      toast.success('Task updated successfully! ✅');
      navigate('/dashboard/tasks');
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? errors.map((e) => e.message).join(', ')
        : err.response?.data?.message || 'Failed to update task';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Spinner text="Loading task…" />;

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-primary-600 mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Edit Task</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Update the details for this task</p>
      </div>

      <div className="card p-6">
        <TaskForm initial={task} onSubmit={handleSubmit} loading={loading} submitLabel="💾 Save Changes" />
      </div>
    </div>
  );
}
