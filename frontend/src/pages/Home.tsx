import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Shield, Zap, Users, CheckCircle, Star } from 'lucide-react';
import api from '../services/api';
import { License, Grade } from '../types';
import LicenseCard from '../components/LicenseCard';

export default function Home() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    api.get('/licenses?active=true').then((r) => setLicenses(r.data.slice(0, 4)));
    api.get('/grades').then((r) => setGrades(r.data));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ========================= HERO ========================= */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative container-main section text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
            Plataforma líder en certificaciones profesionales
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up">
            Certifica tu
            <span className="gradient-text"> expertise </span>
            profesional
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Obtén licencias profesionales verificables con niveles de especialización. 
            Desde básico hasta experto, avanza en tu carrera con credenciales reconocidas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/licenses" className="btn-primary btn-lg">
              Explorar licencias
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/verify" className="btn-secondary btn-lg">
              <Shield className="w-5 h-5" />
              Verificar licencia
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '500+', label: 'Licencias emitidas' },
              { value: '4', label: 'Niveles de especialización' },
              { value: '99%', label: 'Satisfacción' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{value}</p>
                <p className="text-slate-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= GRADES ========================= */}
      <section className="section bg-dark-950">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="section-title">Niveles de <span className="gradient-text">especialización</span></h2>
            <p className="section-subtitle mx-auto">Progresa desde el nivel básico hasta convertirte en experto certificado</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {grades.map((grade, idx) => (
              <div
                key={grade.id}
                className="card p-6 text-center card-hover cursor-pointer group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ background: grade.color }}
                >
                  {grade.order}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{grade.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{grade.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= FEATURED LICENSES ========================= */}
      <section className="section">
        <div className="container-main">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Licencias <span className="gradient-text">disponibles</span></h2>
              <p className="section-subtitle">Selecciona la certificación que mejor se adapte a tu nivel</p>
            </div>
            <Link to="/licenses" className="btn-secondary hidden md:flex">
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {licenses.map((license) => (
              <LicenseCard key={license.id} license={license} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/licenses" className="btn-secondary">Ver todas las licencias</Link>
          </div>
        </div>
      </section>

      {/* ========================= FEATURES ========================= */}
      <section className="section bg-dark-950">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="section-title">¿Por qué <span className="gradient-text">elegirnos?</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Verificación pública',
                description: 'Cada licencia tiene un código único verificable públicamente. Comparte tu certificación con confianza.',
                color: 'text-primary-400',
                bg: 'bg-primary-500/10',
              },
              {
                icon: Zap,
                title: 'Emisión inmediata',
                description: 'Una vez completado el pago, tu licencia en PDF es generada y enviada automáticamente a tu correo.',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
              {
                icon: Award,
                title: 'Progresión estructurada',
                description: 'Sistema de niveles que valida tus competencias progresivamente. Cada licencia abre la puerta al siguiente nivel.',
                color: 'text-violet-400',
                bg: 'bg-violet-500/10',
              },
              {
                icon: Users,
                title: 'Red de profesionales',
                description: 'Únete a nuestra comunidad de certificados y accede a oportunidades exclusivas.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
              {
                icon: CheckCircle,
                title: 'Alertas de vencimiento',
                description: 'Te notificamos por correo y WhatsApp antes de que tu licencia expire para que puedas renovarla.',
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
              },
              {
                icon: Star,
                title: 'Soporte 24/7',
                description: 'Nuestro equipo está disponible para ayudarte a través de WhatsApp en cualquier momento.',
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
              },
            ].map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="card p-6 card-hover">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= CTA ========================= */}
      <section className="section">
        <div className="container-main">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                ¿Listo para certificarte?
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
                Únete a cientos de profesionales que ya tienen sus licencias y han avanzado en sus carreras.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-secondary bg-white text-primary-700 hover:bg-slate-100 border-transparent">
                  Crear cuenta gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/licenses" className="btn-ghost text-white hover:bg-white/10">
                  Ver licencias →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
