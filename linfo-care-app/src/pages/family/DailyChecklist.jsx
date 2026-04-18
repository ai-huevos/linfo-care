import React, { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Shield, Droplets, Brain, Thermometer, HandHeart } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { checklistItems, checklistCategories } from '../../data/checklist';
import { useAuth } from '../../lib/auth';

const iconMap = {
  Shield, Droplets, Brain, Thermometer, HandHeart,
  Soup: Thermometer, // fallback
};

export default function DailyChecklist() {
  const { displayName } = useAuth();
  const today = new Date().toISOString().slice(0, 10);

  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem('linfocare-checklist');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const toggleItem = (itemId) => {
    const key = `${today}:${itemId}`;
    const updated = {
      ...completed,
      [key]: completed[key]
        ? undefined
        : { by: displayName, at: new Date().toISOString() },
    };
    // Clean up undefined keys
    Object.keys(updated).forEach(k => { if (!updated[k]) delete updated[k]; });
    setCompleted(updated);
    localStorage.setItem('linfocare-checklist', JSON.stringify(updated));
  };

  const isChecked = (itemId) => Boolean(completed[`${today}:${itemId}`]);
  const getChecker = (itemId) => completed[`${today}:${itemId}`];

  // Group by category
  const grouped = useMemo(() => {
    const map = {};
    checklistItems.forEach(item => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return Object.entries(map);
  }, []);

  const totalDone = checklistItems.filter(i => isChecked(i.id)).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle={`Checklist diario para ${today}. Cada turno marca lo que hizo. Se reinicia cada día.`}>
        Checklist diario
      </SectionTitle>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-stone-900">Progreso del día</p>
          <Pill tone={totalDone === checklistItems.length ? 'safe' : totalDone > 0 ? 'warn' : 'default'}>
            {totalDone} / {checklistItems.length}
          </Pill>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(totalDone / checklistItems.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Categories */}
      {grouped.map(([cat, items]) => {
        const catConfig = checklistCategories[cat];
        const catDone = items.filter(i => isChecked(i.id)).length;
        const CatIcon = iconMap[catConfig?.icon] || Shield;

        return (
          <Card key={cat}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <CatIcon className="w-4 h-4 text-sky-600" />
                {catConfig?.label || cat}
              </h3>
              <Pill tone={catDone === items.length ? 'safe' : 'default'}>
                {catDone}/{items.length}
              </Pill>
            </div>
            <div className="space-y-1">
              {items.map(item => {
                const checked = isChecked(item.id);
                const checker = getChecker(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all duration-200 ${
                      checked ? 'bg-emerald-50/60' : 'hover:bg-stone-50'
                    }`}
                  >
                    {checked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 flex-none mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${checked ? 'text-emerald-800 line-through opacity-70' : 'text-stone-800'}`}>
                        {item.label}
                      </p>
                      {checker && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          ✓ {checker.by} · {new Date(checker.at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
