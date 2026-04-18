import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Check, MessageCircle, Share2, Loader2 } from 'lucide-react';
import { SectionTitle, Card } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { getPatientId } from '../../lib/useSupabase';
import { checklistItems } from '../../data/checklist';

export default function WhatsAppExport() {
  const { displayName } = useAuth();
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [checklistDone, setChecklistDone] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dateStr = today.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Pull data from Supabase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pid = await getPatientId();
      if (!pid || cancelled) { setLoading(false); return; }

      // Get today's journal entries
      const { data: journal } = await supabase
        .from('journal_entries')
        .select('*, profiles:author_id(display_name)')
        .eq('patient_id', pid)
        .gte('created_at', `${todayStr}T00:00:00`)
        .lte('created_at', `${todayStr}T23:59:59`)
        .order('created_at', { ascending: true });

      // Get today's checklist items
      const { data: checks } = await supabase
        .from('daily_checklist')
        .select('*')
        .eq('patient_id', pid)
        .eq('check_date', todayStr);

      if (!cancelled) {
        setJournalEntries(journal || []);
        setChecklistDone(checks?.length || 0);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const exportText = useMemo(() => {
    let text = `🏥 *LinfoCare — Reporte del día*\n📅 ${dateStr}\n\n`;
    text += `👤 *Paciente:* Rodrigo "Roro" Cardona\n`;
    text += `📍 *Hospital:* Clínica del Country\n`;
    text += `🩺 *Dx:* DLBCL Estadio IV\n\n`;

    if (journalEntries.length > 0) {
      text += `📝 *Notas del día:*\n`;
      journalEntries.forEach(e => {
        const authorName = e.profiles?.display_name || 'Familia';
        text += `• [${authorName}] ${e.content}\n`;
      });
      text += `\n`;
    }

    if (checklistDone > 0) {
      text += `✅ *Checklist:* ${checklistDone}/${checklistItems.length} items completados hoy\n\n`;
    }

    if (customNote.trim()) {
      text += `💬 *Nota adicional:*\n${customNote.trim()}\n\n`;
    }

    text += `---\n`;
    text += `_Enviado desde LinfoCare por ${displayName}_`;

    return text;
  }, [journalEntries, checklistDone, customNote, displayName, dateStr]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = exportText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: exportText });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(exportText)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Preparando resumen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Genera un resumen del día para enviar al grupo de WhatsApp de la familia. Se arma automáticamente con las notas y el checklist del día.">
        Exportar a WhatsApp
      </SectionTitle>

      {/* Add custom note */}
      <Card>
        <h3 className="text-sm font-semibold text-stone-900 mb-2">Agregar nota adicional al reporte</h3>
        <textarea
          value={customNote}
          onChange={e => setCustomNote(e.target.value)}
          placeholder="Ej: Hoy el oncólogo dijo que empezamos prednisona el lunes..."
          className="w-full p-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
          style={{ minHeight: '5rem' }}
        />
      </Card>

      {/* Preview */}
      <Card>
        <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          Vista previa del mensaje
        </h3>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          <pre className="text-sm text-stone-800 whitespace-pre-wrap font-sans leading-relaxed">{exportText}</pre>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            copied
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado ✓' : 'Copiar al portapapeles'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Enviar por WhatsApp
        </button>
      </div>
    </div>
  );
}
