import React, { useState } from 'react';
import { Search, BookOpenCheck } from 'lucide-react';
import { SectionTitle, Card } from '../../components/ui';
import { glossaryTerms } from '../../data/glossary';

export default function Glossary() {
  const [search, setSearch] = useState('');

  const filtered = glossaryTerms.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle subtitle="Términos médicos que vas a escuchar, en palabras claras. Guárdenlo para consulta rápida.">
        Glosario
      </SectionTitle>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Buscar término (ej. rituximab, LDH, neutropenia...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all"
        />
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map(t => (
          <div key={t.term} className="border border-stone-200 rounded-xl p-4 bg-white hover:shadow-md hover:shadow-stone-100 transition-all duration-200">
            <div className="flex items-start gap-2.5">
              <BookOpenCheck className="w-4 h-4 text-sky-500 flex-none mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-stone-900 mb-1">{t.term}</p>
                <p className="text-xs text-stone-600 leading-relaxed">{t.def}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card tone="muted">
          <p className="text-sm text-stone-500 text-center py-4">
            No se encontró "{search}". Prueba con otro término.
          </p>
        </Card>
      )}
    </div>
  );
}
