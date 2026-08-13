import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Shield, Award, Calendar } from 'lucide-react';
import api from '../services/api';
import { VerifyResult } from '../types';

export default function Verify() {
  const { code: paramCode } = useParams<{ code?: string }>();
  const [code, setCode] = useState(paramCode || '');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.get(`/verify/${code.trim().toUpperCase()}`);
      setResult(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Código no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-dark-950 border-b border-slate-800 py-12 px-4 text-center">
        <div className="container-main">
          <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="section-title">Verificar <span className="gradient-text">Licencia</span></h1>
          <p className="section-subtitle mx-auto">
            Ingresa el código único de tu licencia para verificar su autenticidad y vigencia
          </p>
        </div>
      </div>

      <div className="container-main section max-w-xl">
        {/* Search form */}
        <form onSubmit={handleVerify} className="card p-6 mb-6">
          <label className="label" htmlFor="verify-code">Código de verificación</label>
          <div className="flex gap-3">
            <input
              id="verify-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LIC-XXXXXXXX"
              className="input font-mono tracking-widest"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-primary px-5"
              id="verify-btn"
            >
              {loading ? <div className="spinner w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`card overflow-hidden animate-slide-up`}>
            {/* Status header */}
            <div
              className={`p-5 flex items-center gap-3 ${
                result.isActive
                  ? 'bg-emerald-500/10 border-b border-emerald-500/20'
                  : 'bg-red-500/10 border-b border-red-500/20'
              }`}
            >
              {result.isActive ? (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <p className={`text-xl font-bold ${result.isActive ? 'text-emerald-300' : 'text-red-300'}`}>
                  Licencia {result.status}
                </p>
                <p className="text-slate-500 text-sm">
                  {result.isActive
                    ? `Válida por ${result.daysUntilExpiry} días más`
                    : 'Esta licencia ha vencido'}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Code */}
              <div className="p-3 bg-dark-950 rounded-xl text-center">
                <p className="text-slate-500 text-xs mb-1">Código de verificación</p>
                <p className="font-mono text-primary-300 text-xl font-bold tracking-widest">{result.code}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-dark-950 rounded-xl">
                  <p className="text-slate-500 text-xs mb-1">Titular</p>
                  <p className="text-white font-semibold text-sm">{result.holder}</p>
                </div>
                <div className="p-3 bg-dark-950 rounded-xl">
                  <p className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Nivel
                  </p>
                  <p className="text-white font-semibold text-sm" style={{ color: result.license.gradeColor }}>
                    {result.license.grade}
                  </p>
                </div>
                <div className="p-3 bg-dark-950 rounded-xl col-span-2">
                  <p className="text-slate-500 text-xs mb-1">Licencia</p>
                  <p className="text-white font-semibold text-sm">{result.license.name}</p>
                </div>
                <div className="p-3 bg-dark-950 rounded-xl flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-slate-500 text-xs">Emitida</p>
                    <p className="text-slate-300 text-sm">{formatDate(result.issuedAt)}</p>
                  </div>
                </div>
                <div className="p-3 bg-dark-950 rounded-xl flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-slate-500 text-xs">Vence</p>
                    <p className={`text-sm font-semibold ${result.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatDate(result.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <p className="text-center text-slate-600 text-sm mt-6">
          El código de verificación se encuentra en el PDF de tu licencia
        </p>
      </div>
    </div>
  );
}
