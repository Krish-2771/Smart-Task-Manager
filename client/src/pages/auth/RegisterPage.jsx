import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      errs.password = 'Must contain uppercase, lowercase, and a number';

    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    const res = await register(form);
    if (res.success) {
      toast.success(res.message || 'Registered! Please login.');
      navigate('/login');
    } else {
      toast.error(res.message);
    }
  };

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const strengthScore = () => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z\d]/.test(p)) s++;
    return s;
  };
  const score = strengthScore();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'][score];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-primary-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <button onClick={toggle} className="fixed top-5 right-5 p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:scale-105">
        {dark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30 mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join Smart Task Manager today</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <input name="name" value={form.name} onChange={onChange} placeholder="Name Surname"
                className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com"
                className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="label">Role</label>
              <select name="role" value={form.role} onChange={onChange} className="input">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                  placeholder="Min 6 chars, A-Z, a-z, 0-9"
                  className={`input pr-12 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? strengthColor : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strengthLabel}</p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input type={showCpw ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={onChange}
                  placeholder="Repeat your password"
                  className={`input pr-12 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`} />
                <button type="button" onClick={() => setShowCpw(!showCpw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCpw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="mt-1 text-xs text-emerald-500">✓ Passwords match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
