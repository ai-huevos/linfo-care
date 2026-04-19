import React from 'react';
import {
  Activity, Calendar, FileText, NotebookPen, AlertCircle,
  TrendingUp, Clock, Users, Stethoscope, Bot, ChevronRight,
  Heart, Shield, FlaskConical, ArrowRight, Thermometer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Pill } from '../components/ui';
import { useAuth } from '../lib/auth';

const treatmentPhases = [
  { name: 'Ingreso UCI', status: 'completed', date: 'Abr 6' },
  { name: 'Diagnóstico', status: 'completed', date: 'Abr 7-13' },
  { name: 'Oncología', status: 'completed', date: 'Abr 14-17' },
  { name: 'UCI Hemato', status: 'active', date: 'Abr 18+' },
  { name: 'Protocolo', status: 'upcoming', date: 'Pendiente' },
  { name: 'Quimio C1', status: 'upcoming', date: 'Por definir' },
  { name: 'Nadir', status: 'upcoming', date: 'Día 7-14' },
  { name: 'PET', status: 'upcoming', date: 'Post C2-4' },
];

const quickStats = [
  { label: 'LDH', value: '2,010', unit: 'U/L', trend: 'critical', normal: '< 225' },
  { label: 'Plaquetas', value: '64,000', unit: '/µL', trend: 'critical', normal: '150-400K' },
  { label: 'Hemoglobina', value: '8.1', unit: 'g/dL', trend: 'warn', normal: '13-17' },
  { label: 'SUVmax', value: '26.7', unit: '', trend: 'critical', normal: '< 2' },
];

const trendColors = {
  critical: 'text-rose-600 bg-rose-50 border-rose-200',
  warn: 'text-amber-600 bg-amber-50 border-amber-200',
  safe: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

export default function Dashboard() {
  const { displayName } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Hero greeting */}
      <div>
        <h1 className="text-3xl font-serif font-normal text-stone-900 tracking-tight">
          {greeting}, {displayName}
        </h1>
        <p className="text-stone-500 mt-1">Centro de cuidado de Rodrigo "Roro" Cardona</p>
      </div>

      {/* Treatment Timeline */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              Línea de tiempo del tratamiento
            </h2>
            <Pill tone="info">DLBCL Estadio IV</Pill>
          </div>
        </div>
        <div className="px-5 pb-5 overflow-x-auto">
          <div className="flex items-center gap-0 min-w-[700px]">
            {treatmentPhases.map((phase, i) => {
              const isActive = phase.status === 'active';
              const isCompleted = phase.status === 'completed';
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 ring-4 ring-sky-100' :
                      isCompleted ? 'bg-emerald-500 text-white' :
                      'bg-stone-200 text-stone-500'
                    }`}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <p className={`text-[11px] mt-1.5 font-medium leading-tight ${isActive ? 'text-sky-700' : isCompleted ? 'text-emerald-700' : 'text-stone-400'}`}>
                      {phase.name}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{phase.date}</p>
                  </div>
                  {i < treatmentPhases.length - 1 && (
                    <div className={`h-0.5 flex-1 min-w-[20px] ${isCompleted ? 'bg-emerald-400' : 'bg-stone-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div>
        <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-sky-600" />
          Laboratorios clave
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickStats.map(stat => (
            <div key={stat.label} className={`border rounded-xl p-4 ${trendColors[stat.trend]}`}>
              <p className="text-xs font-medium opacity-70 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-[10px] opacity-60 mt-0.5">Normal: {stat.normal}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickLink
          to="/chat"
          icon={Bot}
          title="Hablar con Doctora Lío"
          desc="Pregunta lo que sea sobre el cuidado de Roro"
          gradient="from-violet-500 to-fuchsia-600"
          badge="AI"
        />
        <QuickLink
          to="/family/journal"
          icon={NotebookPen}
          title="Escribir en el diario"
          desc="Registra cómo amaneció hoy, qué comió, qué dijo el médico"
          gradient="from-sky-500 to-blue-600"
        />
        <QuickLink
          to="/family/shifts"
          icon={Calendar}
          title="Ver turnos"
          desc="¿Quién está hoy? ¿Quién va mañana?"
          gradient="from-emerald-500 to-teal-600"
        />
        <QuickLink
          to="/medical/documents"
          icon={FileText}
          title="Documentos médicos"
          desc="Biopsias, labs, PET-CT, radiografías"
          gradient="from-amber-500 to-orange-600"
        />
        <QuickLink
          to="/medical/labs"
          icon={FlaskConical}
          title="Laboratorios"
          desc="Seguimiento de valores con gráficas"
          gradient="from-rose-500 to-pink-600"
        />
        <QuickLink
          to="/family/export"
          icon={Users}
          title="Resumen WhatsApp"
          desc="Genera el broadcast del día para la familia"
          gradient="from-green-500 to-emerald-600"
        />
      </div>

      {/* UCI Status */}
      <Card className="!bg-gradient-to-br !from-amber-50/60 !to-orange-50/40 !border-amber-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-none">
            <Shield className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900 mb-1">UCI Hemato-Oncología — Abril 18</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              Roro fue admitido a la UCI de hemato-oncología. 4 medicamentos autorizados: 
              <strong> Vincristina, Ondansetrón, Piperacilina, Rosuvastatina</strong>. 
              Protocolo de quimioterapia pendiente de confirmación.
            </p>
          </div>
        </div>
      </Card>

      {/* Infection watch */}
      <Card tone="warn" className="!border-amber-300">
        <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
          <Thermometer className="w-4 h-4" />
          🔬 Vigilancia de infección activa
        </h3>
        <p className="text-sm text-amber-800 leading-relaxed">
          Roro está recibiendo <strong>Piperacilina (antibiótico IV)</strong> — hay riesgo o sospecha de infección. 
          Vigilar: fiebre, escalofríos, cambios en frecuencia cardíaca, tos nueva, cambio en drenaje del tubo de tórax.
        </p>
      </Card>

      {/* Emergency Alerts */}
      <Card tone="critical" className="!border-rose-300">
        <h3 className="text-sm font-bold text-rose-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Alertar al equipo URGENTE si ven:
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            'Fiebre >38°C (especialmente post-quimio)',
            'Confusión nueva, no reconoce familiares',
            'Dificultad respiratoria que empeora',
            'Dolor en pecho nuevo, palpitaciones',
            'Sangrado o hematomas nuevos',
            'Caída de orina, orina muy oscura',
          ].map((alert, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-rose-800">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-none mt-0.5" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc, gradient, badge }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 p-4 rounded-xl border border-stone-200 bg-white hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-none`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-stone-900 group-hover:text-sky-700 transition-colors">{title}</p>
          {badge && (
            <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold">{badge}</span>
          )}
        </div>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-sky-500 flex-none mt-1 transition-colors" />
    </Link>
  );
}
