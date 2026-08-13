import { Outlet, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import WhatsAppButton from './WhatsAppButton';

export default function Layout() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { items } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="container-main flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Licencias<span className="gradient-text">Pro</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/licenses" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Catálogo
            </NavLink>
            <NavLink to="/verify" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Verificar
            </NavLink>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="btn-ghost text-primary-400">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link to="/cart" className="btn-ghost relative">
                  <ShoppingCart className="w-5 h-5" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard" className="btn-ghost">
                  <User className="w-4 h-4" />
                  {user?.name.split(' ')[0]}
                </Link>
                <button onClick={logout} className="btn-ghost text-slate-500 hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Iniciar sesión</Link>
                <Link to="/register" className="btn-primary btn-sm">Registrarse</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn-ghost"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-dark-900 px-4 py-4 space-y-3">
            <NavLink to="/licenses" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Catálogo</NavLink>
            <NavLink to="/verify" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Verificar</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Mi panel</NavLink>
                <NavLink to="/cart" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Carrito ({items.length})</NavLink>
                {isAdmin && <NavLink to="/admin" className="block nav-link py-2 text-primary-400" onClick={() => setMenuOpen(false)}>Panel Admin</NavLink>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block nav-link py-2 text-red-400 w-full text-left">Cerrar sesión</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Iniciar sesión</NavLink>
                <NavLink to="/register" className="block btn-primary text-center" onClick={() => setMenuOpen(false)}>Registrarse</NavLink>
              </>
            )}
          </div>
        )}
      </nav>

      {/* PAGE CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-dark-900 border-t border-slate-800 py-10 px-4">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">LicenciasPro</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Plataforma líder en certificaciones y licencias profesionales con niveles de especialización.
              </p>
            </div>
            <div>
              <h4 className="text-slate-300 font-semibold mb-3">Plataforma</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/licenses" className="hover:text-primary-400 transition-colors">Catálogo de licencias</Link></li>
                <li><Link to="/verify" className="hover:text-primary-400 transition-colors">Verificar licencia</Link></li>
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">Crear cuenta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-300 font-semibold mb-3">Contacto</h4>
              <p className="text-slate-500 text-sm">¿Tienes preguntas? Contáctanos por WhatsApp.</p>
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '573001234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow" />
                Abrir WhatsApp
              </a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-slate-600 text-sm">
            © {new Date().getFullYear()} LicenciasPro. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <WhatsAppButton />
    </div>
  );
}
