import React from 'react';
import { Shield, Droplets, Brain, Thermometer, HandHeart, Clock, AlertCircle } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';

const careRoutines = [
  {
    icon: Shield,
    title: 'Cuidado de piel (prevenir escaras)',
    frequency: 'Cada 2 horas',
    urgency: 'critical',
    steps: [
      'Cambio de posición cada 2 horas (alternar: espalda → lado derecho → espalda → lado izquierdo)',
      'Revisar sacro, talones y codos cada turno — buscar enrojecimiento que no desaparece al presionar',
      'Crema barrera (óxido de zinc) en sacro y pliegues después de cada cambio de pañal',
      'Crema hidratante sin perfume en brazos, piernas, manos',
      'Almohada entre las piernas cuando está de lado',
      'Sábanas sin arrugas (causan presión)',
      'Si aparece lesión: foto y avisar a enfermería inmediatamente',
    ],
  },
  {
    icon: Droplets,
    title: 'Cuidado de boca (prevenir mucositis)',
    frequency: '4-6 veces al día',
    urgency: 'critical',
    steps: [
      'Enjuague bicarbonato + sal después de cada comida y antes de dormir (ver recetas en Nutrición)',
      'Cepillo ultra-suave, sin fuerza, movimientos circulares suaves',
      'Revisar toda la boca (lengua, encías, paladar, interior de mejillas) buscando placas blancas, úlceras, sangrado',
      'Labios lubricados con vaselina o protector labial cada 2-3 horas',
      'Si usa prótesis dental: limpiarla y remojar en bicarbonato cada noche',
      'Nunca usar enjuagues con alcohol',
    ],
  },
  {
    icon: Brain,
    title: 'Prevención de delirium',
    frequency: 'Todo el día, especialmente noches',
    urgency: 'warn',
    steps: [
      'Orientación: decirle la fecha, la hora, dónde está, quién está con él — "Roro, es martes 15 de abril, estás en la Clínica del Country, soy [nombre]"',
      'Gafas puestas durante el día, audífonos si los usa',
      'Reloj visible y calendario con la fecha marcada',
      'Luz natural durante el día, cortinas abiertas',
      'Minimizar ruido y luz en la noche — nada de TV alta, luces bajas',
      'Música suave conocida (boleros, música de su época) durante visitas',
      'Fotos familiares cerca de su cama',
      'Respetar el ciclo de sueño: no despertarlo innecesariamente en la noche',
      'Si empieza confusión o agitación: NO contradecirlo, redirigir suavemente, avisar a enfermería',
    ],
  },
  {
    icon: Thermometer,
    title: 'Monitoreo de signos vitales básicos',
    frequency: 'Cada turno (3 veces al día)',
    urgency: 'warn',
    steps: [
      'Temperatura: avisar INMEDIATO si >38°C — especialmente después de quimio esto es EMERGENCIA',
      'Oximetría de pulso: normal >92%. Avisar si <90%',
      'Presión arterial: la enfermería la toma, pedir los números y anotarlos',
      'Evaluar dolor: preguntarle del 0 al 10, y si no puede hablar, observar gestos (ceño fruncido, agitación)',
      'Contar respiraciones por 30 segundos × 2: normal 12-20/min. Si >24 avisar',
      'Evaluar orina: color, cantidad aproximada, si huele mal o hay sangre',
    ],
  },
  {
    icon: HandHeart,
    title: 'Presencia afectuosa',
    frequency: 'Siempre',
    urgency: 'safe',
    steps: [
      'Lavado de manos ANTES y DESPUÉS de tocar a Roro — gel no es suficiente si las manos están sucias, usar agua y jabón primero',
      'Tomar su mano, hablarle aunque parezca dormido — el oído es lo último que se apaga',
      'Contarle cosas de la familia, de su vida, de sus nietos',
      'No hablar de él como si no estuviera presente — siempre incluirlo',
      'Si está angustiado: presencia silenciosa, mano en la mano, es más potente que mil palabras',
      'Rezar con él si es parte de su espiritualidad',
      'Traer olores familiares: su jabón de la casa, su colonia (si no hay restricción)',
    ],
  },
];

const urgencyColors = {
  critical: 'bg-rose-100 text-rose-800',
  warn: 'bg-amber-100 text-amber-800',
  safe: 'bg-emerald-100 text-emerald-800',
};

export default function DailyCare() {
  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Guía paso a paso para cada turno de acompañante. Estas son las cosas más importantes que USTEDES pueden hacer por Roro — mucho de esto no lo hace la enfermería.">
        Cuidados diarios
      </SectionTitle>

      <Card tone="info">
        <p className="text-sm text-sky-900 leading-relaxed">
          <strong>Cada persona que entra al cuarto es un cuidador.</strong> No necesitan ser enfermeros. Con esta guía, 
          cualquier familiar puede hacer una diferencia enorme en su recuperación, prevención de complicaciones, y bienestar emocional.
        </p>
      </Card>

      {careRoutines.map((routine, i) => {
        const Icon = routine.icon;
        return (
          <Card key={i} className="!p-0 overflow-hidden">
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-sky-600" />
                  {routine.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${urgencyColors[routine.urgency]}`}>
                    {routine.urgency === 'critical' ? 'PRIORIDAD ALTA' : routine.urgency === 'warn' ? 'IMPORTANTE' : 'SIEMPRE'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-4">
                <Clock className="w-3 h-3 text-stone-400" />
                <span className="text-xs text-stone-500">{routine.frequency}</span>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {routine.steps.map((step, j) => (
                <div key={j} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors">
                  <span className="flex-none w-5 h-5 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {j + 1}
                  </span>
                  <p className="text-sm text-stone-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Emergency box */}
      <Card tone="critical">
        <h3 className="text-sm font-bold text-rose-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Llamar al equipo médico INMEDIATO si:
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            'Fiebre >38°C (especialmente post-quimio)',
            'Confusión nueva, no reconoce a nadie',
            'Dificultad respiratoria que empeora',
            'Sangrado que no para (nariz, boca, orina)',
            'Dolor nuevo e intenso que no cede',
            'No orina en 6+ horas',
            'Vómito con sangre o muy oscuro',
            'Convulsión',
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
