import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'El email es requerido';
    if (!form.password) errs.password = 'La contraseña es requerida';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Iniciar sesión</h1>
          <p className="text-slate-500 mt-2">Accede a tu cuenta de LicenciasPro</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {/* Email */}
          <div>
            <label className="label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="label" htmlFor="login-password">Contraseña</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="login-submit"
            className="btn-primary w-full"
          >
            {loading ? <div className="spinner w-5 h-5" /> : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Regístrate gratis
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="card p-4 mt-4 border-dashed border-slate-600">
          <p className="text-slate-500 text-xs text-center mb-2">Credenciales de demo</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setForm({ email: 'usuario@licencias.com', password: 'User123!' })}
              className="p-2 bg-dark-950 rounded-lg text-slate-400 hover:text-primary-300 hover:bg-primary-500/10 transition-colors text-left"
            >
              <strong>Usuario</strong><br />usuario@licencias.com
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@licencias.com', password: 'Admin123!' })}
              className="p-2 bg-dark-950 rounded-lg text-slate-400 hover:text-primary-300 hover:bg-primary-500/10 transition-colors text-left"
            >
              <strong>Admin</strong><br />admin@licencias.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
