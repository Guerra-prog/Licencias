import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '573001234567';
  const message = encodeURIComponent(
    '¡Hola! 👋 Me interesa obtener información sobre sus licencias profesionales.'
  );
  const waUrl = `https://wa.me/${waNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="flex items-center gap-2 bg-dark-800 border border-slate-700 text-slate-200 text-sm px-4 py-2 rounded-xl shadow-lg animate-slide-up">
          <span>¿Necesitas ayuda?</span>
          <button onClick={() => setShowTooltip(false)} className="text-slate-500 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* WhatsApp button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Contactar por WhatsApp"
        className="group relative w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-400 hover:scale-110 transition-all duration-300"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 animate-ping" />
        <MessageCircle className="w-7 h-7 text-white fill-white" />
      </a>
    </div>
  );
}
