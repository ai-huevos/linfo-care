import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// --- Card ---
const toneMap = {
  default: 'bg-white border-stone-200',
  warn: 'bg-amber-50/60 border-amber-200',
  critical: 'bg-rose-50/60 border-rose-200',
  safe: 'bg-emerald-50/60 border-emerald-200',
  info: 'bg-sky-50/60 border-sky-200',
  muted: 'bg-stone-50 border-stone-200',
};

export function Card({ children, tone = 'default', className = '' }) {
  return (
    <div className={`${toneMap[tone] || toneMap.default} border rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

// --- Pill ---
const pillTones = {
  default: 'bg-stone-100 text-stone-700',
  warn: 'bg-amber-100 text-amber-900',
  critical: 'bg-rose-100 text-rose-900',
  safe: 'bg-emerald-100 text-emerald-900',
  info: 'bg-sky-100 text-sky-900',
};

export function Pill({ children, tone = 'default' }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${pillTones[tone] || pillTones.default}`}>
      {children}
    </span>
  );
}

// --- SectionTitle ---
export function SectionTitle({ children, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-serif font-normal text-stone-900 tracking-tight">{children}</h2>
      {subtitle && <p className="text-sm text-stone-500 mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

// --- SaveIndicator ---
export function SaveIndicator({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
}

// --- DrugRow ---
export function DrugRow({ letter, name, role, admin }) {
  return (
    <div className="flex gap-3 border-l-2 border-stone-200 pl-3">
      <div className="flex-none w-8 h-8 rounded bg-stone-900 text-white flex items-center justify-center text-sm font-medium">
        {letter}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-stone-900">{name}</p>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">{role}</p>
        <p className="text-xs text-stone-500 mt-1 italic">{admin}</p>
      </div>
    </div>
  );
}

// --- TimelineStep ---
export function TimelineStep({ num, title, detail, days, last }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex-none w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-medium">
          {num}
        </div>
        {!last && <div className="flex-1 w-px bg-stone-200 mt-1"></div>}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <p className="text-sm font-medium text-stone-900">{title}</p>
          <p className="text-xs text-stone-500 flex-none">{days}</p>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

// --- ScenarioCard ---
export function ScenarioCard({ tone, pct, title, sub, desc, signs, outcome }) {
  const tones = {
    safe: 'bg-emerald-50/60 border-emerald-200',
    warn: 'bg-amber-50/60 border-amber-200',
    critical: 'bg-rose-50/60 border-rose-200',
  };
  const textTones = {
    safe: 'text-emerald-950',
    warn: 'text-amber-950',
    critical: 'text-rose-950',
  };
  return (
    <div className={`border rounded-xl p-5 ${tones[tone]}`}>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div>
          <h3 className={`text-base font-medium ${textTones[tone]}`}>{title}</h3>
          <p className="text-xs text-stone-600 italic">{sub}</p>
        </div>
        <span className={`text-lg font-serif ${textTones[tone]}`}>{pct}</span>
      </div>
      <p className="text-sm text-stone-800 leading-relaxed mb-3">{desc}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">Qué veríamos</p>
          <pre className="text-xs text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">{signs}</pre>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">Pronóstico</p>
          <p className="text-xs text-stone-700 leading-relaxed">{outcome}</p>
        </div>
      </div>
    </div>
  );
}

// --- LabChart ---
export function LabChart({ series }) {
  const { name, unit, normalMax, normalMin, severity, meaning, data } = series;
  const width = 340;
  const height = 170;
  const padding = { top: 20, right: 50, bottom: 30, left: 45 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const allValues = [...values, normalMin, normalMax];
  const yMin = Math.min(...allValues) * 0.9;
  const yMax = Math.max(...allValues) * 1.1;
  const yRange = yMax - yMin || 1;

  const xForIndex = (i) => {
    if (data.length === 1) return padding.left + plotW / 2;
    return padding.left + (plotW * i) / (data.length - 1);
  };
  const yForValue = (v) => padding.top + plotH - ((v - yMin) / yRange) * plotH;

  const normalTop = yForValue(normalMax);
  const normalBottom = yForValue(normalMin);
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xForIndex(i)} ${yForValue(d.value)}`).join(' ');

  const lineColors = { safe: '#059669', warn: '#d97706', critical: '#e11d48', default: '#525252' };
  const color = lineColors[severity] || lineColors.default;
  const toneStyles = { safe: 'border-emerald-200', warn: 'border-amber-200', critical: 'border-rose-200' };

  const last = data[data.length - 1];
  const isOutOfRange = last.value > normalMax || last.value < normalMin;

  return (
    <div className={`bg-white border ${toneStyles[severity] || 'border-stone-200'} rounded-xl p-4`}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h4 className="text-sm font-medium text-stone-900">{name}</h4>
        <span className="text-xs text-stone-500">Normal: {normalMin}-{normalMax} {unit}</span>
      </div>
      <p className="text-xs text-stone-600 mb-3 leading-relaxed">{meaning}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <rect x={padding.left} y={normalTop} width={plotW} height={Math.max(normalBottom - normalTop, 2)} fill="#10b981" opacity="0.08" />
        <line x1={padding.left} y1={normalTop} x2={padding.left + plotW} y2={normalTop} stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
        <line x1={padding.left} y1={normalBottom} x2={padding.left + plotW} y2={normalBottom} stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
        <text x={padding.left + plotW + 3} y={normalTop + 3} fontSize="9" fill="#047857">{normalMax}</text>
        <text x={padding.left + plotW + 3} y={normalBottom + 3} fontSize="9" fill="#047857">{normalMin}</text>
        <text x={padding.left - 4} y={padding.top + 4} fontSize="9" fill="#78716c" textAnchor="end">{Math.round(yMax)}</text>
        <text x={padding.left - 4} y={padding.top + plotH + 4} fontSize="9" fill="#78716c" textAnchor="end">{Math.round(yMin)}</text>
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} stroke="#d6d3d1" strokeWidth="0.5" />
        <line x1={padding.left} y1={padding.top + plotH} x2={padding.left + plotW} y2={padding.top + plotH} stroke="#d6d3d1" strokeWidth="0.5" />
        {data.length > 1 && <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xForIndex(i)} cy={yForValue(d.value)} r="4" fill="white" stroke={color} strokeWidth="2" />
            <text x={xForIndex(i)} y={yForValue(d.value) - 10} fontSize="10" fill={color} textAnchor="middle" fontWeight="500">{d.value}</text>
            <text x={xForIndex(i)} y={padding.top + plotH + 14} fontSize="9" fill="#78716c" textAnchor="middle">{d.date}</text>
          </g>
        ))}
      </svg>
      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-100">
        <span className="text-xs text-stone-500">Último valor</span>
        <span className={`text-sm font-medium ${severity === 'critical' ? 'text-rose-700' : severity === 'warn' ? 'text-amber-700' : 'text-emerald-700'}`}>
          {last.value} {unit} {isOutOfRange && '·'} {isOutOfRange && (last.value > normalMax ? 'arriba de normal' : 'debajo de normal')}
        </span>
      </div>
    </div>
  );
}
