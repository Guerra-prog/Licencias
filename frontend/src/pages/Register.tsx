import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'El nombre es requerido';
    if (!form.email) errs.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';
    if (!form.password) errs.password = 'La contraseña es requerida';
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined });
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="text-slate-500 mt-2">Únete a LicenciasPro y comienza tu certificación</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-4">
          <div>
            <label className="label" htmlFor="reg-name">Nombre completo</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="Juan Pérez"
            />
            {errors.name && <p className="error-msg">{errors.name}</p>}
          </div>

          <div>
            <label className="label" htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>

          <div>
            <label className="label" htmlFor="reg-phone">
              Teléfono WhatsApp <span className="text-slate-600">(opcional)</span>
            </label>
            <input
              id="reg-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
              placeholder="+573001234567"
            />
            <p className="text-slate-600 text-xs mt-1">Para recibir notificaciones por WhatsApp</p>
          </div>

          <div>
            <label className="label" htmlFor="reg-password">Contraseña</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} id="register-submit" className="btn-primary w-full mt-2">
            {loading ? <div className="spinner w-5 h-5" /> : 'Crear cuenta gratis'}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
