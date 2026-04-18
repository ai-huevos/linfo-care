import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, HelpCircle } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { questionGroups } from '../../data/questions';

export default function Questions() {
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('linfocare-answers');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [openQuestion, setOpenQuestion] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  const saveAnswer = (qId, text) => {
    const updated = {
      ...answers,
      [qId]: { text, date: new Date().toISOString() },
    };
    setAnswers(updated);
    localStorage.setItem('linfocare-answers', JSON.stringify(updated));
    setSaveStatus('✓ Guardado');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Estas preguntas están organizadas por tema. Haz clic en cada una para escribir la respuesta que te dé el médico. Todo se guarda automáticamente.">
        Preguntas para el equipo médico
      </SectionTitle>

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
        const answered = group.questions.filter(q => answers[q.id]?.text).length;
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
                const hasAnswer = answers[q.id]?.text;
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
                          defaultValue={answers[q.id]?.text || ''}
                          onBlur={(e) => saveAnswer(q.id, e.target.value)}
                        />
                        {hasAnswer && (
                          <p className="text-xs text-stone-500 mt-2">
                            Guardado el {new Date(answers[q.id].date).toLocaleString('es-CO')}
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
