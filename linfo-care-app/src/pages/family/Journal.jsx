import React, { useState } from 'react';
import { Plus, Trash2, Save, NotebookPen } from 'lucide-react';
import { SectionTitle, Card } from '../../components/ui';
import { useAuth } from '../../lib/auth';

export default function Journal() {
  const { displayName } = useAuth();
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('linfocare-journal');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newNote, setNewNote] = useState('');

  const saveEntries = (updated) => {
    setEntries(updated);
    localStorage.setItem('linfocare-journal', JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!newNote.trim()) return;
    const entry = {
      id: Date.now(),
      content: newNote.trim(),
      author: displayName,
      type: 'note',
      created_at: new Date().toISOString(),
    };
    saveEntries([entry, ...entries]);
    setNewNote('');
  };

  const deleteEntry = (id) => {
    saveEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Espacio para notas diarias de la familia: cómo amaneció, qué comió, qué le preocupó, qué dijo el médico, cualquier cosa relevante.">
        Diario de la familia
      </SectionTitle>

      {/* New entry */}
      <Card>
        <h3 className="text-base font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-sky-600" />
          Agregar nueva nota
        </h3>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribí lo que pasó hoy, cómo se veía, qué comió, qué preguntaron, cualquier cosa…"
          className="w-full p-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
          style={{ minHeight: '7rem' }}
        />
        <button
          onClick={addEntry}
          disabled={!newNote.trim()}
          className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" /> Guardar con fecha y hora
        </button>
      </Card>

      {/* Entries */}
      {entries.length === 0 ? (
        <Card tone="muted">
          <p className="text-sm text-stone-500 text-center py-6">
            Sin notas todavía. Empieza registrando cómo amaneció Roro hoy.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <Card key={entry.id} className="animate-fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {entry.author?.charAt(0)?.toUpperCase() || 'F'}
                    </div>
                    <span className="text-xs font-medium text-stone-700">{entry.author || 'Familia'}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(entry.created_at).toLocaleString('es-CO', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-1.5 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
