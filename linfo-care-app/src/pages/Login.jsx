import React, { useState } from 'react';
import { Stethoscope, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
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
      if (authError.message?.includes('rate limit')) {
        setError('Demasiados intentos. Espera un minuto e intenta de nuevo.');
      } else if (authError.message?.includes('Database error')) {
        setSent(true);
      } else {
        setError(authError.message || 'Error al enviar. Intenta de nuevo.');
      }
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (!isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sky-50/30 to-indigo-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20 mb-5">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-normal text-stone-900 tracking-tight">LinfoCare</h1>
          <p className="text-base text-stone-500 mt-1">Centro de cuidado de Roro</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-stone-200/60 shadow-xl shadow-stone-200/30 p-8 sm:p-10">
          {sent ? (
            /* ── SUCCESS SCREEN ── */
            <div className="text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900">¡Listo! Revisa tu correo</h2>
              <p className="text-base text-stone-600 leading-relaxed">
                Enviamos un enlace a <span className="font-semibold text-stone-900">{email}</span>
              </p>

              {/* Step by step instructions */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-left space-y-4">
                <p className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Sigue estos pasos:</p>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold flex-none">1</div>
                  <div>
                    <p className="text-base font-medium text-stone-900">Abre tu correo</p>
                    <p className="text-sm text-stone-500">Gmail, Outlook, o el que uses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold flex-none">2</div>
                  <div>
                    <p className="text-base font-medium text-stone-900">Busca el correo de LinfoCare</p>
                    <p className="text-sm text-stone-500">Puede tardar 1-2 minutos. Revisa spam si no llega.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold flex-none">3</div>
                  <div>
                    <p className="text-base font-medium text-stone-900">Haz clic en "Entrar"</p>
                    <p className="text-sm text-stone-500">El enlace te trae de vuelta a la app automáticamente</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-base text-sky-600 hover:text-sky-700 font-medium py-2"
              >
                ¿No llegó? Intentar de nuevo →
              </button>
            </div>
          ) : (
            /* ── LOGIN FORM ── */
            <>
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Bienvenido 👋</h2>
              <p className="text-base text-stone-600 mb-6 leading-relaxed">
                Escribe tu correo electrónico. Te llegará un enlace para entrar — <strong>no necesitas contraseña</strong>.
              </p>

              {/* How it works */}
              <div className="flex items-center gap-3 mb-6 text-sm text-stone-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Correo</span>
                </div>
                <div className="h-px flex-1 bg-stone-200" />
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Enlace</span>
                </div>
                <div className="h-px flex-1 bg-stone-200" />
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-xs font-bold">3</span>
                  <span>¡Entrar!</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-4 text-base border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all placeholder:text-stone-400"
                  />
                </div>
                {error && (
                  <p className="text-base text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-base font-semibold px-4 py-4 rounded-xl hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Entrar con mi correo
                      <Mail className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-sm text-stone-400 text-center mt-6 leading-relaxed">
          Solo miembros de la familia con correo autorizado pueden ingresar.
        </p>

        {/* Help link */}
        <div className="text-center mt-3">
          <a
            href="https://wa.me/573001234567?text=Hola%20Daniel%2C%20necesito%20ayuda%20para%20entrar%20a%20LinfoCare"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ¿Necesitas ayuda? Escríbele a Daniel 💬
          </a>
        </div>
      </div>
    </div>
  );
}
