import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, ChevronDown, Loader2, Wifi } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { questionGroups } from '../../data/questions';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { getPatientId } from '../../lib/useSupabase';

export default function Questions() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});
  const [openQuestion, setOpenQuestion] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Load answers from Supabase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pid = await getPatientId();
      if (!pid || cancelled) { setLoading(false); return; }

      const { data } = await supabase
        .from('medical_questions')
        .select('*')
        .eq('patient_id', pid);

      if (!cancelled && data) {
        const map = {};
        data.forEach(row => {
          map[row.question_text] = {
            text: row.answer_text,
            date: row.answered_at,
            dbId: row.id,
          };
        });
        setAnswers(map);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const saveAnswer = useCallback(async (qId, qText, groupName, text) => {
    if (!text?.trim()) return;
    const pid = await getPatientId();

    if (answers[qText]?.dbId) {
      // Update existing
      await supabase
        .from('medical_questions')
        .update({
          answer_text: text,
          answered_by: user?.id,
          answered_at: new Date().toISOString(),
        })
        .eq('id', answers[qText].dbId);

      setAnswers(prev => ({
        ...prev,
        [qText]: { ...prev[qText], text, date: new Date().toISOString() },
      }));
    } else {
      // Insert new
      const { data } = await supabase
        .from('medical_questions')
        .insert({
          patient_id: pid,
          group_name: groupName,
          question_text: qText,
          answer_text: text,
          answered_by: user?.id,
          answered_at: new Date().toISOString(),
        })
        .select()
        .single();

      setAnswers(prev => ({
        ...prev,
        [qText]: { text, date: new Date().toISOString(), dbId: data?.id },
      }));
    }

    setSaveStatus('✓ Guardado y sincronizado');
    setTimeout(() => setSaveStatus(''), 2000);
  }, [answers, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Cargando preguntas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Estas preguntas están organizadas por tema. Haz clic en cada una para escribir la respuesta que te dé el médico. Todo se guarda automáticamente.">
        Preguntas para el equipo médico
      </SectionTitle>

      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600">
        <Wifi className="w-3 h-3" />
        <span>Las respuestas se sincronizan para toda la familia</span>
      </div>

      <Card tone="info">
        <p className="text-sm text-sky-900 leading-relaxed">
          <span className="font-medium">Sugerencia:</span> impriman o lleven abierta esta sección en la próxima reunión con oncología. Muchas preguntas tienen una sola respuesta de 5 palabras.
          Cuando tengan la respuesta, escríbanla aquí y quedará en el registro.
        </p>
      </Card>

      {saveStatus && (
        <div className="fixed bottom-4 right-4 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 animate-fade-in">
          {saveStatus}
        </div>
      )}

      {questionGroups.map(group => {
        const total = group.questions.length;
        const answered = group.questions.filter(q => answers[q.text]?.text).length;
        return (
          <Card key={group.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-stone-900">{group.title}</h3>
              <Pill tone={answered === total ? 'safe' : answered > 0 ? 'warn' : 'default'}>
                {answered} / {total} respondidas
              </Pill>
            </div>
            <div className="space-y-2">
              {group.questions.map(q => {
                const isOpen = openQuestion === q.id;
                const hasAnswer = answers[q.text]?.text;
                return (
                  <div key={q.id} className="border border-stone-200 rounded-lg overflow-hidden">
                    <div
                      onClick={() => setOpenQuestion(isOpen ? null : q.id)}
                      className="flex items-start gap-3 p-3 cursor-pointer hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex-none mt-1">
                        {hasAnswer ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-stone-300" />
                        )}
                      </div>
                      <p className="flex-1 text-sm text-stone-800">{q.text}</p>
                      <ChevronDown className={`w-4 h-4 text-stone-400 flex-none mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isOpen && (
                      <div className="p-3 pt-0 border-t border-stone-100 bg-stone-50/50 animate-fade-in">
                        <textarea
                          className="w-full mt-3 p-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
                          style={{ minHeight: '6rem' }}
                          placeholder="Escribe aquí la respuesta del médico…"
                          defaultValue={answers[q.text]?.text || ''}
                          onBlur={(e) => saveAnswer(q.id, q.text, group.title, e.target.value)}
                        />
                        {hasAnswer && (
                          <p className="text-xs text-stone-500 mt-2">
                            Guardado el {new Date(answers[q.text].date).toLocaleString('es-CO')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
