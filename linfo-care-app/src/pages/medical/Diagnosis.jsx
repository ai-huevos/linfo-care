import React from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import { SectionTitle, Card, Pill, DrugRow, TimelineStep } from '../../components/ui';

export default function Diagnosis() {
  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Un resumen completo de qué tiene Roro, en palabras que toda la familia pueda entender.">
        Diagnóstico de Roro
      </SectionTitle>

      {/* Summary card */}
      <Card className="!bg-gradient-to-br !from-sky-50/60 !to-indigo-50/40 !border-sky-200">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-serif text-stone-900">Linfoma B difuso de células grandes (DLBCL)</h3>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            Un tipo de cáncer del sistema linfático — la red de defensas del cuerpo. 
            Los <strong>linfocitos B</strong> (glóbulos blancos que producen anticuerpos) empezaron a crecer 
            de forma descontrolada y se acumularon formando masas en varias partes del cuerpo.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Pill tone="critical">Estadio IV</Pill>
            <Pill tone="warn">IPI alto</Pill>
            <Pill tone="info">DLBCL</Pill>
            <Pill tone="default">78 años</Pill>
          </div>
        </div>
      </Card>

      {/* What does Stage IV mean */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="p-3 bg-sky-100 text-sky-700 rounded-xl font-bold text-xl leading-none">
            IV
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900 mb-1">¿Por qué es Estadio IV?</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              El estadio no mide gravedad absoluta, mide <strong>ubicación</strong>. Roro es Fase IV porque el linfoma salió de los ganglios y llegó a órganos sólidos:
            </p>
            
            <ul className="mt-3 space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle2 className="w-4 h-4 text-sky-600 mr-2 flex-none" />
                <span className="text-stone-800">Masa en <strong>duodeno</strong> (sistema digestivo)</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle2 className="w-4 h-4 text-sky-600 mr-2 flex-none" />
                <span className="text-stone-800">Lesiones líticas en <strong>huesos</strong> (pelvis, costilla)</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle2 className="w-4 h-4 text-sky-600 mr-2 flex-none" />
                <span className="text-stone-800">Posible invasión en <strong>médula ósea</strong> (causa de plaquetas bajas)</span>
              </li>
            </ul>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 font-medium">
                💡 Dato Crítico: Pese a ser Estadio IV, este tipo de linfoma (DLBCL) reacciona fuertemente a la quimioterapia y tiene potencial curativo.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key findings */}
      <Card>
        <h3 className="text-base font-semibold text-stone-900 mb-3">Hallazgos principales</h3>
        <div className="space-y-3">
          <Finding
            label="PET-CT (abril 7)"
            value="SUVmax 26.7"
            meaning="Actividad tumoral MUY alta. Normal <2. Indica enfermedad agresiva pero esto también significa que PUEDE responder bien a quimio."
            tone="critical"
          />
          <Finding
            label="LDH"
            value="2,010 U/L (normal <225)"
            meaning="Enzima que refleja cantidad de células rompiéndose. Muy alta = mucha carga tumoral. Se usa como marcador de seguimiento."
            tone="critical"
          />
          <Finding
            label="Albúmina"
            value="2.5 g/dL (normal >3.5)"
            meaning="Indicador de nutrición. Roro está desnutrido. Recuperar nutrición ES parte del tratamiento."
            tone="warn"
          />
          <Finding
            label="Plaquetas"
            value="64,000 /µL (normal 150-400K)"
            meaning="Células de coagulación. Bajas por la enfermedad invadiendo médula ósea. Riesgo de sangrado."
            tone="warn"
          />
          <Finding
            label="Hemoglobina"
            value="8.1 g/dL (normal 13-17)"
            meaning="Anemia moderada. Explica el cansancio. Puede necesitar transfusión."
            tone="warn"
          />
          <Finding
            label="Lesión duodenal"
            value="Masa en segunda porción del duodeno"
            meaning="Linfoma extranodal (fuera de un ganglio). Confirmado por biopsia. Afecta parte del sistema digestivo."
            tone="info"
          />
          <Finding
            label="Derrame pleural izquierdo"
            value="Líquido alrededor del pulmón izquierdo"
            meaning="Requirió tubo de tórax para drenar. Puede ser tumoral o inflamatorio."
            tone="info"
          />
          <Finding
            label="Lesiones líticas óseas"
            value="En pelvis y fractura costilla 11"
            meaning="El linfoma está debilitando algunos huesos. La fractura de costilla es por esto. Se trata con quimio + posiblemente bisfosfonatos."
            tone="warn"
          />
        </div>
      </Card>

      {/* Treatment plan preview */}
      <Card>
        <h3 className="text-base font-semibold text-stone-900 mb-3">¿Cuál es el plan?</h3>
        <p className="text-sm text-stone-700 leading-relaxed mb-4">
          El equipo de oncología está preparando un régimen de quimioterapia llamado <strong>R-CHOP</strong> o <strong>R-mini-CHOP</strong> 
          (versión con dosis reducidas, más segura para pacientes mayores). Son 5 medicamentos que trabajan juntos:
        </p>
        <div className="space-y-3">
          <DrugRow letter="R" name="Rituximab" role="Anticuerpo contra CD20 de las células tumorales. No es quimio pura — es inmunoterapia dirigida." admin="Infusión intravenosa lenta (4-6 horas la primera vez)" />
          <DrugRow letter="C" name="Ciclofosfamida" role="Destruye el ADN del tumor, impide que se reproduzca." admin="Infusión intravenosa" />
          <DrugRow letter="H" name="Doxorrubicina" role="Antibiótico antitumoral. Potente pero puede afectar el corazón — por eso hacen ecocardiograma antes." admin="Infusión intravenosa (es roja)" />
          <DrugRow letter="O" name="Vincristina" role="Frena la división celular. Puede causar hormigueo en manos/pies." admin="Infusión intravenosa" />
          <DrugRow letter="P" name="Prednisona" role="Esteroide que reduce inflamación y ayuda a matar el linfoma. También da hambre y energía." admin="Pastillas, 5 días cada ciclo" />
        </div>
      </Card>

      {/* What to expect */}
      <Card>
        <h3 className="text-base font-semibold text-stone-900 mb-3">¿Qué esperar semana a semana?</h3>
        <div className="space-y-1">
          <TimelineStep num={1} title="Pre-fase (5-7 días)" detail="Solo prednisona + protección de riñón (hidratación, alopurinol). Baja la carga tumoral suavemente. Labs frecuentes." days="Semana 0" />
          <TimelineStep num={2} title="Día 1 del Ciclo 1" detail="Se administran R-C-H-O juntos en el hospital. Monitoreo cercano por 24-72 horas por riesgo de reacción a rituximab y síndrome de lisis tumoral." days="Semana 1" />
          <TimelineStep num={3} title="Días 2-6: Prednisona" detail="Solo pastillas en casa/piso. Roro puede sentirse bien por la prednisona (da energía temporal)." days="Semana 1" />
          <TimelineStep num={4} title="Días 7-14: Nadir" detail="Las defensas bajan al mínimo. MAYOR riesgo de infección. Fiebre = emergencia. No visitas con gripe. Comida segura." days="Semana 2" />
          <TimelineStep num={5} title="Días 15-21: Recuperación" detail="Los glóbulos empiezan a subir. Puede tolerar más comida. Se hace lab de control." days="Semana 3" />
          <TimelineStep num={6} title="Día 21: Evaluar ciclo 2" detail="Si los labs están bien, se repite. Si no, se espera unos días. Se evalúa tolerancia general." days="Semana 3" last />
        </div>
      </Card>
    </div>
  );
}

function Finding({ label, value, meaning, tone }) {
  const tones = {
    critical: 'border-l-rose-500 bg-rose-50/30',
    warn: 'border-l-amber-500 bg-amber-50/30',
    info: 'border-l-sky-500 bg-sky-50/30',
  };

  return (
    <div className={`border-l-2 ${tones[tone]} rounded-r-lg p-3`}>
      <div className="flex items-baseline justify-between gap-2 mb-0.5">
        <p className="text-xs font-medium text-stone-500 uppercase">{label}</p>
        <p className="text-sm font-semibold text-stone-900">{value}</p>
      </div>
      <p className="text-xs text-stone-600 leading-relaxed">{meaning}</p>
    </div>
  );
}
