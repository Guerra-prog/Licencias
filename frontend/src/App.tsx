import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Public pages
import Home from './pages/Home';
import Licenses from './pages/Licenses';
import LicenseDetail from './pages/LicenseDetail';
import Verify from './pages/Verify';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// User pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLicenses from './pages/admin/AdminLicenses';
import AdminGrades from './pages/admin/AdminGrades';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminConversations from './pages/admin/AdminConversations';

// Protected route wrappers
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/licenses" element={<Licenses />} />
        <Route path="/licenses/:id" element={<LicenseDetail />} />
        <Route path="/verify/:code?" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* USER ROUTES */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
      </Route>

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="licenses" element={<AdminLicenses />} />
        <Route path="grades" element={<AdminGrades />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="conversations" element={<AdminConversations />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
