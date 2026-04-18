import React, { useState, useMemo } from 'react';
import { Calendar, Sun, Sunset, Moon, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { useAuth } from '../../lib/auth';

const slots = [
  { id: 'morning', label: 'Mañana', time: '7am - 1pm', icon: Sun, color: 'text-amber-500' },
  { id: 'afternoon', label: 'Tarde', time: '1pm - 7pm', icon: Sunset, color: 'text-orange-500' },
  { id: 'night', label: 'Noche', time: '7pm - 7am', icon: Moon, color: 'text-indigo-500' },
];

function getWeekDays(startDate) {
  const days = [];
  const d = new Date(startDate);
  d.setDate(d.getDate() - d.getDay()); // Start from Sunday
  for (let i = 0; i < 7; i++) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function CareShifts() {
  const { displayName } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts] = useState(() => {
    try {
      const saved = localStorage.getItem('linfocare-shifts');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = useMemo(() => getWeekDays(baseDate), [weekOffset]);

  const today = new Date().toISOString().slice(0, 10);

  const save = (updated) => {
    setShifts(updated);
    localStorage.setItem('linfocare-shifts', JSON.stringify(updated));
  };

  const toggleShift = (dateStr, slotId) => {
    const key = `${dateStr}:${slotId}`;
    if (shifts[key]?.name === displayName) {
      // Remove yourself
      const updated = { ...shifts };
      delete updated[key];
      save(updated);
    } else if (!shifts[key]) {
      // Sign up
      save({
        ...shifts,
        [key]: { name: displayName, at: new Date().toISOString() },
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <SectionTitle subtitle="Organiza quién acompaña a Roro cada turno. Haz clic en un turno libre para anotarte. Clic de nuevo para quitarte.">
        Turnos de acompañamiento
      </SectionTitle>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-stone-900">
            {weekDays[0].toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} — {weekDays[6].toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium mt-0.5"
            >
              Volver a esta semana
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-xs font-medium text-stone-400 py-2">Turno</div>
            {weekDays.map(day => {
              const dateStr = day.toISOString().slice(0, 10);
              const isToday = dateStr === today;
              const dayName = day.toLocaleDateString('es-CO', { weekday: 'short' });
              const dayNum = day.getDate();
              return (
                <div
                  key={dateStr}
                  className={`text-center py-2 rounded-lg ${isToday ? 'bg-sky-100 border border-sky-200' : ''}`}
                >
                  <p className={`text-[10px] uppercase tracking-wider ${isToday ? 'text-sky-700 font-bold' : 'text-stone-400'}`}>{dayName}</p>
                  <p className={`text-lg font-semibold ${isToday ? 'text-sky-800' : 'text-stone-800'}`}>{dayNum}</p>
                </div>
              );
            })}
          </div>

          {/* Slot rows */}
          {slots.map(slot => {
            const SlotIcon = slot.icon;
            return (
              <div key={slot.id} className="grid grid-cols-8 gap-2 mb-2">
                {/* Slot label */}
                <div className="flex items-center gap-1.5 py-2">
                  <SlotIcon className={`w-4 h-4 ${slot.color}`} />
                  <div>
                    <p className="text-xs font-medium text-stone-700">{slot.label}</p>
                    <p className="text-[10px] text-stone-400">{slot.time}</p>
                  </div>
                </div>

                {/* Day cells */}
                {weekDays.map(day => {
                  const dateStr = day.toISOString().slice(0, 10);
                  const key = `${dateStr}:${slot.id}`;
                  const shift = shifts[key];
                  const isToday = dateStr === today;
                  const isPast = dateStr < today;

                  return (
                    <button
                      key={key}
                      onClick={() => !isPast && toggleShift(dateStr, slot.id)}
                      disabled={isPast}
                      className={`flex items-center justify-center p-2 rounded-lg border text-center min-h-[56px] transition-all duration-200 ${
                        shift
                          ? 'bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200 hover:shadow-md'
                          : isPast
                            ? 'bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed'
                            : isToday
                              ? 'bg-white border-sky-200 border-dashed hover:bg-sky-50 hover:border-sky-300'
                              : 'bg-white border-stone-200 border-dashed hover:bg-stone-50 hover:border-stone-300'
                      }`}
                    >
                      {shift ? (
                        <div>
                          <div className="w-6 h-6 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold mb-0.5">
                            {shift.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <p className="text-[10px] text-stone-700 font-medium truncate max-w-[60px]">{shift.name}</p>
                        </div>
                      ) : !isPast ? (
                        <Plus className="w-4 h-4 text-stone-300" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <Card tone="info">
        <p className="text-sm text-sky-900">
          <strong>Cómo funciona:</strong> Haz clic en un turno libre (el <Plus className="w-3 h-3 inline" />) para anotarte con tu nombre. 
          Si necesitas cancelar, haz clic de nuevo en tu turno. Los turnos pasados quedan bloqueados.
        </p>
      </Card>

      {/* Today's shifts */}
      <Card>
        <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          Hoy ({new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })})
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {slots.map(slot => {
            const key = `${today}:${slot.id}`;
            const shift = shifts[key];
            const SlotIcon = slot.icon;
            return (
              <div key={slot.id} className={`border rounded-lg p-3 ${shift ? 'border-sky-200 bg-sky-50' : 'border-stone-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <SlotIcon className={`w-4 h-4 ${slot.color}`} />
                  <span className="text-xs font-medium text-stone-700">{slot.label} ({slot.time})</span>
                </div>
                {shift ? (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {shift.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-stone-900">{shift.name}</span>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 mt-2 italic">Sin asignar</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
