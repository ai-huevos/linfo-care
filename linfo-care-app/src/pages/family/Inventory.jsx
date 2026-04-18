import React, { useState } from 'react';
import { Package, Check, ShoppingCart, AlertCircle, Search } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { inventoryCatalog } from '../../data/inventory';

const statusConfig = {
  have: { label: 'Tenemos', icon: Check, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  buying: { label: 'Comprando', icon: ShoppingCart, color: 'bg-sky-100 text-sky-800 border-sky-200' },
  missing: { label: 'Falta', icon: AlertCircle, color: 'bg-rose-100 text-rose-800 border-rose-200' },
  pending: { label: 'Pendiente', icon: Package, color: 'bg-stone-100 text-stone-600 border-stone-200' },
};

export default function Inventory() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('linfocare-inventory');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [search, setSearch] = useState('');
  const [assignInput, setAssignInput] = useState({});

  const save = (updated) => {
    setData(updated);
    localStorage.setItem('linfocare-inventory', JSON.stringify(updated));
  };

  const setStatus = (key, status) => {
    save({ ...data, [key]: { ...data[key], status } });
  };

  const setAssigned = (key, assigned) => {
    save({ ...data, [key]: { ...data[key], assigned } });
  };

  // Stats
  const allItems = inventoryCatalog.flatMap(cat => cat.items);
  const total = allItems.length;
  const have = allItems.filter(item => data[item]?.status === 'have').length;
  const missing = allItems.filter(item => data[item]?.status === 'missing').length;

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle subtitle="Todo lo que necesitamos tener listo para el cuidado de Roro. Marquen lo que ya tienen, lo que falta, y quién se encarga.">
        Inventario de insumos
      </SectionTitle>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{have}</p>
          <p className="text-xs text-emerald-600">Tenemos</p>
        </div>
        <div className="border border-rose-200 bg-rose-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-rose-700">{missing}</p>
          <p className="text-xs text-rose-600">Faltan</p>
        </div>
        <div className="border border-stone-200 bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-stone-700">{total - have}</p>
          <p className="text-xs text-stone-600">Por revisar</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Buscar insumo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all"
        />
      </div>

      {/* Categories */}
      {inventoryCatalog.map(cat => {
        const filteredItems = cat.items.filter(item =>
          item.toLowerCase().includes(search.toLowerCase()) ||
          cat.category.toLowerCase().includes(search.toLowerCase())
        );
        if (filteredItems.length === 0) return null;

        return (
          <Card key={cat.category}>
            <h3 className="text-base font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-600" />
              {cat.category}
              <Pill tone="default">{filteredItems.length} items</Pill>
            </h3>
            <div className="space-y-2">
              {filteredItems.map(item => {
                const key = item;
                const itemData = data[key] || {};
                const status = itemData.status || 'pending';
                const cfg = statusConfig[status];
                const StatusIcon = cfg.icon;

                return (
                  <div key={item} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors group">
                    {/* Status button */}
                    <button
                      onClick={() => {
                        const cycle = ['pending', 'have', 'buying', 'missing'];
                        const next = cycle[(cycle.indexOf(status) + 1) % cycle.length];
                        setStatus(key, next);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${cfg.color}`}
                      title="Clic para cambiar estado"
                    >
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </button>

                    {/* Item name */}
                    <span className="text-sm text-stone-800 flex-1">{item}</span>

                    {/* Assigned */}
                    <input
                      type="text"
                      placeholder="¿Quién?"
                      value={assignInput[key] ?? itemData.assigned ?? ''}
                      onChange={e => setAssignInput({ ...assignInput, [key]: e.target.value })}
                      onBlur={e => { setAssigned(key, e.target.value); setAssignInput({ ...assignInput, [key]: undefined }); }}
                      className="w-24 text-xs px-2 py-1 border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    />
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
