import React from 'react';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SectionTitle, Card, Pill, ScenarioCard } from '../../components/ui';

export default function Scenarios() {
  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle subtitle="Estos son los escenarios reales que puede enfrentar Roro. No son para asustar — son para preparar. Pregúntale al equipo por cada uno.">
        Escenarios y pronóstico
      </SectionTitle>

      <Card tone="info">
        <p className="text-sm text-sky-900 leading-relaxed">
          <strong>Contexto:</strong> DLBCL Estadio IV en paciente de 78 años. SUVmax 26.7, LDH 2,010, albúmina 2.5. 
          IPI alto. Estos factores implican que el tratamiento será más difícil, pero DLBCL ES un linfoma potencialmente curable 
          incluso en estadio avanzado. La respuesta al primer ciclo es el dato más importante.
        </p>
      </Card>

      <div className="space-y-4">
        <ScenarioCard
          tone="safe"
          pct="~25-35%"
          title="Escenario A — Respuesta completa"
          sub="El mejor caso realista"
          desc="Roro tolera R-mini-CHOP, el PET intermedio muestra Deauville 1-3, completa 4-6 ciclos y entra en remisión completa."
          signs="LDH baja a normal tras ciclo 2. SUVmax <4 en PET intermedio. Tolera comida. Gana peso. Recupera movilidad."
          outcome="Remisión sostenida. Seguimiento cada 3-6 meses con imágenes. Puede durar años. Calidad de vida buena."
        />
        <ScenarioCard
          tone="warn"
          pct="~30-40%"
          title="Escenario B — Respuesta parcial"
          sub="Lo más probable"
          desc="Roro responde pero no completamente. PET muestra Deauville 4. Se ajusta tratamiento. Puede necesitar más ciclos o cambio de régimen."
          signs="LDH baja pero no normaliza. Masas reducen pero no desaparecen. Necesita soporte transfusional o nutricional entre ciclos."
          outcome="Enfermedad controlada. Posible cronicidad. Calidad de vida aceptable con soporte. Meses a años de vida adicional."
        />
        <ScenarioCard
          tone="critical"
          pct="~15-25%"
          title="Escenario C — Complicaciones graves del tratamiento"
          sub="Escenario de riesgo"
          desc="El tratamiento produce toxicidad severa: neutropenia febril prolongada, infección grave, falla renal por lisis tumoral, o cardiotoxicidad."
          signs="Fiebre >38°C en nadir. Infección documentada. Creatinina que sube. Caída de función cardiaca. Ingreso a UCI."
          outcome="Si se supera la complicación, puede continuar tratamiento. Si no, se ajusta a esquema más suave o se cambia objetivo."
        />
        <ScenarioCard
          tone="critical"
          pct="~10-15%"
          title="Escenario D — Enfermedad refractaria"
          sub="No responde al tratamiento"
          desc="El linfoma no responde al R-CHOP/R-mini-CHOP. PET muestra progresión. Se discuten líneas alternativas o transición a cuidados de confort."
          signs="LDH sigue alta o sube. Masas crecen. Síntomas B persisten. Estado funcional se deteriora."
          outcome="Se discute con la familia: segunda línea vs. cuidados paliativos de confort. Priorizar calidad de vida y dignidad."
        />
      </div>

      <Card tone="muted">
        <p className="text-sm text-stone-700 leading-relaxed text-center">
          <strong>Pregunta clave para oncología:</strong> "¿El objetivo es curativo, de control de enfermedad, o paliativo? 
          Queremos una respuesta honesta para preparar a la familia."
        </p>
      </Card>
    </div>
  );
}
