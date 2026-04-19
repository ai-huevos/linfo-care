import React, { useState, useEffect } from 'react';
import { Gift, Heart, Send, Loader2, CheckCircle2, Wifi, Phone, User } from 'lucide-react';
import { SectionTitle, Card } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { getPatientId } from '../../lib/useSupabase';

const giftCategories = [
  { id: 'visit', emoji: '🙏', label: 'Visita / compañía', desc: 'Quiero visitarlo en la clínica' },
  { id: 'food', emoji: '🍲', label: 'Comida / snacks', desc: 'Gelatinas, caldos, frutas, etc.' },
  { id: 'comfort', emoji: '🧣', label: 'Comodidad', desc: 'Cobijas, medias, almohada, ropa cómoda' },
  { id: 'hygiene', emoji: '🧴', label: 'Higiene / cuidado', desc: 'Crema, labial, jabón suave' },
  { id: 'entertainment', emoji: '📚', label: 'Entretenimiento', desc: 'Libros, revistas, audífonos, tablet' },
  { id: 'spiritual', emoji: '🕊️', label: 'Espiritual / emocional', desc: 'Oraciones, cartas, mensajes de ánimo' },
  { id: 'supplies', emoji: '💊', label: 'Insumos médicos', desc: 'Algo que necesite de la farmacia' },
  { id: 'other', emoji: '💝', label: 'Otro', desc: 'Tengo otra idea para Roro' },
];

export default function GiftRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: localStorage.getItem('linfocare_guest_name') || '',
    phone: localStorage.getItem('linfocare_guest_phone') || '',
    category: '',
    message: '',
  });

  // Load existing requests
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pid = await getPatientId();
      if (!pid || cancelled) { setLoading(false); return; }
      const { data } = await supabase
        .from('gift_requests')
        .select('*')
        .eq('patient_id', pid)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!cancelled) { setRequests(data || []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) return;

    setSending(true);
    const pid = await getPatientId();

    // Save guest info to localStorage for future visits
    localStorage.setItem('linfocare_guest_name', form.name.trim());
    if (form.phone.trim()) {
      localStorage.setItem('linfocare_guest_phone', form.phone.trim());
    }

    const { data } = await supabase
      .from('gift_requests')
      .insert({
        patient_id: pid,
        sender_name: form.name.trim(),
        sender_phone: form.phone.trim() || null,
        category: form.category,
        message: form.message.trim() || null,
      })
      .select()
      .single();

    if (data) {
      setRequests(prev => [data, ...prev]);
      setSent(true);
      setForm(prev => ({ ...prev, category: '', message: '' }));
      setTimeout(() => setSent(false), 4000);
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Envía un mensaje de cariño, ofrece algo que necesite, o simplemente dile que estás pensando en él.">
        Regalos y cariños para Roro
      </SectionTitle>

      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600">
        <Wifi className="w-3 h-3" />
        <span>Daniel y la familia pueden ver los ofrecimientos</span>
      </div>

      {/* Thank you message */}
      {sent && (
        <Card className="!bg-emerald-50 !border-emerald-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-none" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">¡Gracias por tu cariño! 💙</p>
              <p className="text-xs text-emerald-700">Daniel y la familia ya pueden ver tu ofrecimiento.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Send form */}
      <Card>
        <h3 className="text-base font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-sky-600" />
          ¿Qué te gustaría ofrecer?
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Phone */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1.5">Tu nombre *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Tía Martha"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1.5">Celular (opcional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="300 123 4567"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>
          </div>

          {/* Category grid */}
          <div>
            <label className="text-xs text-stone-500 block mb-2">¿Qué quieres ofrecer? *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {giftCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.id })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 ${
                    form.category === cat.id
                      ? 'bg-sky-50 border-sky-300 shadow-md shadow-sky-200/30'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className={`text-xs font-medium ${form.category === cat.id ? 'text-sky-800' : 'text-stone-700'}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          {form.category && (
            <div className="animate-fade-in">
              <label className="text-xs text-stone-500 block mb-1.5">
                Mensaje (opcional) — cuéntanos más
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder={giftCategories.find(c => c.id === form.category)?.desc || 'Escribe aquí...'}
                className="w-full p-3 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
                style={{ minHeight: '5rem' }}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!form.name.trim() || !form.category || sending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-semibold px-4 py-3.5 rounded-xl hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Enviar ofrecimiento
              </>
            )}
          </button>
        </form>
      </Card>

      {/* Recent requests */}
      {!loading && requests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            Ofrecimientos recientes
          </h3>
          <div className="space-y-2">
            {requests.map(req => {
              const cat = giftCategories.find(c => c.id === req.category);
              return (
                <Card key={req.id} className="!py-3 !px-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-none">{cat?.emoji || '💝'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-stone-900">{req.sender_name}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(req.created_at).toLocaleString('es-CO', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        {cat?.label}
                        {req.message && <> — {req.message}</>}
                      </p>
                      {req.sender_phone && (
                        <p className="text-[10px] text-stone-400 mt-1">📱 {req.sender_phone}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
