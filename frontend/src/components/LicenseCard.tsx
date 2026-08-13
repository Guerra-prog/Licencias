import { Link } from 'react-router-dom';
import { Award, Clock, CheckCircle, ArrowRight, ShoppingCart } from 'lucide-react';
import { License } from '../types';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface LicenseCardProps {
  license: License;
  showAddToCart?: boolean;
}

export default function LicenseCard({ license, showAddToCart = true }: LicenseCardProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(license.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(license);
    toast.success(`${license.name} agregada al carrito`);
  };

  const durationText =
    license.durationDays >= 365
      ? `${Math.round(license.durationDays / 365)} año${Math.round(license.durationDays / 365) > 1 ? 's' : ''}`
      : `${license.durationDays} días`;

  return (
    <div className="card card-hover flex flex-col overflow-hidden group">
      {/* Grade badge */}
      <div
        className="h-1.5 w-full"
        style={{ background: license.grade.color }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Grade + icon */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="badge text-xs"
            style={{
              background: `${license.grade.color}20`,
              color: license.grade.color,
              borderColor: `${license.grade.color}30`,
            }}
          >
            <Award className="w-3 h-3 mr-1" />
            {license.grade.name}
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock className="w-3 h-3" />
            {durationText}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-base mb-2 group-hover:text-primary-300 transition-colors leading-tight">
          {license.name}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2 flex-1">
          {license.description}
        </p>

        {/* Benefits preview */}
        <ul className="space-y-1 mb-5">
          {license.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold gradient-text">${license.price.toFixed(2)}</span>
            <span className="text-slate-600 text-xs ml-1">USD</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/licenses/${license.id}`}
            className="btn-secondary btn-sm flex-1 text-center text-xs"
          >
            Ver detalles
          </Link>
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              id={`add-to-cart-${license.id}`}
              className={`btn-sm px-3 rounded-xl transition-all ${
                inCart
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'btn-primary'
              }`}
              title={inCart ? 'Ya en carrito' : 'Agregar al carrito'}
            >
              {inCart ? <CheckCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Prerequisite warning */}
      {license.prerequisite && (
        <div className="px-5 py-2 bg-amber-500/5 border-t border-amber-500/20 flex items-center gap-2">
          <span className="text-amber-500 text-xs">
            Requiere: <strong>{license.prerequisite.name}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
