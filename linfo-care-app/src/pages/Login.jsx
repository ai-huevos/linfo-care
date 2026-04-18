import React, { useState } from 'react';
import { Stethoscope, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    const { error: authError } = await signInWithMagicLink(email.trim());
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (!isSupabaseConfigured()) {
    return null; // AuthProvider handles demo mode
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sky-50/30 to-indigo-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20 mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-serif font-normal text-stone-900 tracking-tight">LinfoCare</h1>
          <p className="text-sm text-stone-500 mt-1">Centro de cuidado familiar</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-stone-200/60 shadow-xl shadow-stone-200/30 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900 mb-2">Revisa tu correo</h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Enviamos un enlace mágico a <span className="font-medium text-stone-900">{email}</span>. 
                Haz clic en el enlace para entrar — no necesitas contraseña.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="mt-6 text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                ¿No llegó? Intentar de nuevo
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">Ingresar</h2>
              <p className="text-sm text-stone-500 mb-6">
                Escribe tu correo y te enviamos un enlace para entrar. Sin contraseñas.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all"
                  />
                </div>
                {error && (
                  <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-medium px-4 py-3 rounded-xl hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Enviar enlace mágico
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-[11px] text-stone-400 text-center mt-6">
          Solo miembros de la familia con correo autorizado pueden ingresar.
        </p>
      </div>
    </div>
  );
}
