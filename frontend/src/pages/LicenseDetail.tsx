import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Award, Clock, CheckCircle, ShoppingCart,
  AlertTriangle, BookOpen, Star
} from 'lucide-react';
import api from '../services/api';
import { License } from '../types';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function LicenseDetail() {
  const { id } = useParams<{ id: string }>();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    if (!id) return;
    api.get(`/licenses/${id}`)
      .then((r) => setLicense(r.data))
      .catch(() => setLicense(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!license) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-xl mb-4">Licencia no encontrada</p>
          <Link to="/licenses" className="btn-primary">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const inCart = isInCart(license.id);
  const durationText =
    license.durationDays >= 365
      ? `${Math.round(license.durationDays / 365)} año(s)`
      : `${license.durationDays} días`;

  const handleAddToCart = () => {
    addToCart(license);
    toast.success(`${license.name} agregada al carrito`);
  };

  return (
    <div className="min-h-screen">
      {/* Back */}
      <div className="bg-dark-950 border-b border-slate-800 px-4 py-4">
        <div className="container-main">
          <Link to="/licenses" className="btn-ghost text-slate-400">
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>
        </div>
      </div>

      <div className="container-main section">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <span
                className="badge mb-3"
                style={{
                  background: `${license.grade.color}20`,
                  color: license.grade.color,
                  borderColor: `${license.grade.color}30`,
                }}
              >
                <Award className="w-3 h-3 mr-1" />
                Nivel {license.grade.name}
              </span>
              <h1 className="text-4xl font-extrabold text-white mb-4">{license.name}</h1>
              <p className="text-slate-400 text-lg leading-relaxed">{license.description}</p>
            </div>

            {/* Requirements */}
            {license.requirements && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-medium text-sm">Requisito previo</p>
                  <p className="text-amber-400/80 text-sm mt-1">{license.requirements}</p>
                  {license.prerequisite && (
                    <Link
                      to={`/licenses/${license.prerequisite.id}`}
                      className="text-primary-400 text-sm hover:underline mt-1 inline-block"
                    >
                      Ver licencia requerida: {license.prerequisite.name} →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="card p-6">
              <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary-400" />
                Beneficios incluidos
              </h2>
              <ul className="space-y-3">
                {license.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Syllabus */}
            {license.syllabus && (
              <div className="card p-6">
                <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                  Contenido y competencias
                </h2>
                <div className="text-slate-400 leading-relaxed whitespace-pre-line text-sm">
                  {license.syllabus.replace(/^#+\s*/gm, '').replace(/\*\*/g, '')}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Purchase card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              {/* Price */}
              <div className="text-center mb-6">
                <p className="text-slate-500 text-sm mb-1">Precio</p>
                <p className="text-5xl font-extrabold gradient-text">${license.price.toFixed(2)}</p>
                <p className="text-slate-500 text-sm mt-1">USD · Un solo pago</p>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3 p-3 bg-dark-950 rounded-xl mb-4">
                <Clock className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-slate-500 text-xs">Vigencia</p>
                  <p className="text-white font-semibold">{durationText}</p>
                </div>
              </div>

              {/* CTA */}
              {inCart ? (
                <Link to="/cart" className="btn-primary w-full text-center">
                  <ShoppingCart className="w-5 h-5" />
                  Ver carrito
                </Link>
              ) : (
                <button
                  onClick={handleAddToCart}
                  id={`add-to-cart-detail-${license.id}`}
                  className="btn-primary w-full"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </button>
              )}

              <p className="text-slate-600 text-xs text-center mt-3">
                Pago seguro con Stripe · PDF inmediato
              </p>

              {/* Grade info */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-slate-500 text-xs mb-2">Nivel de especialización</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: license.grade.color }} />
                  <span className="text-slate-300 text-sm font-medium">{license.grade.name}</span>
                </div>
                {license.grade.description && (
                  <p className="text-slate-600 text-xs mt-1">{license.grade.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
