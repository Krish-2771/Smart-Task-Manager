import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import AddTaskPage from './pages/user/AddTaskPage';
import MyTasksPage from './pages/user/MyTasksPage';
import EditTaskPage from './pages/user/EditTaskPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminTasksPage from './pages/admin/AdminTasksPage';

// Layouts
import UserLayout from './components/common/UserLayout';
import AdminLayout from './components/common/AdminLayout';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<UserDashboard />} />
        <Route path="add-task" element={<AddTaskPage />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="tasks/edit/:id" element={<EditTaskPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="tasks" element={<AdminTasksPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
