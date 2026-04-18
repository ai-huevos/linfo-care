// Questions for the medical team — extracted from LymphomaCare.jsx
export const questionGroups = [
  {
    id: 'dx',
    title: 'Diagnóstico y patología',
    questions: [
      { id: 'q1', text: '¿Ya salió el informe definitivo de patología de las biopsias del 8 de abril (duodeno, estómago)? ¿Podemos tener copia?' },
      { id: 'q2', text: '¿Qué biopsia confirmó el linfoma: duodeno, médula ósea, un ganglio? ¿Hace falta tomar más muestras?' },
      { id: 'q3', text: '¿Es DLBCL confirmado o podría ser otro tipo (manto, Burkitt, zona marginal, alto grado)?' },
      { id: 'q4', text: '¿Subtipo inmunohistoquímico: GCB (germinal center) o non-GCB / ABC?' },
      { id: 'q5', text: '¿Ki-67 (índice proliferativo)? ¿CD20 positivo? ¿CD5? ¿CD10? ¿BCL6? ¿MUM1?' },
      { id: 'q6', text: '¿Alteraciones de MYC, BCL2 o BCL6 (linfoma "doble hit" o "triple hit")?' },
      { id: 'q7', text: '¿Se hizo biopsia de médula ósea? ¿Resultado? ¿Hay infiltración medular?' },
      { id: 'q8', text: '¿Cuál es el puntaje IPI (International Prognostic Index)? ¿IPI ajustado por edad (aaIPI)?' },
    ]
  },
  {
    id: 'extent',
    title: 'Extensión y estadio',
    questions: [
      { id: 'q9', text: '¿Estadio Ann Arbor final? ¿IV-A o IV-B?' },
      { id: 'q10', text: '¿Consideran necesaria resonancia magnética o punción lumbar para descartar compromiso del sistema nervioso central?' },
      { id: 'q11', text: 'La lesión en segunda porción duodenal: ¿es linfoma extranodal o algo independiente?' },
      { id: 'q12', text: '¿Hay "enfermedad voluminosa" (bulky disease ≥7.5 cm)? ¿Dónde?' },
      { id: 'q13', text: '¿La fractura de la costilla 11 necesita estabilización o solo manejo conservador?' },
    ]
  },
  {
    id: 'prechemo',
    title: 'Preparación antes de quimioterapia',
    questions: [
      { id: 'q14', text: '¿Ya hay resultados de hepatitis B (HBsAg, anti-HBc, anti-HBs)? Es crítico antes de rituximab.' },
      { id: 'q15', text: '¿Ya hay resultado de hepatitis C?' },
      { id: 'q16', text: '¿Ya se hizo ecocardiograma? ¿Cuál es la fracción de eyección del ventrículo izquierdo (FEVI)?' },
      { id: 'q17', text: '¿Van a hacer pre-fase con prednisona sola antes del R-CHOP completo?' },
      { id: 'q18', text: '¿Profilaxis de síndrome de lisis tumoral: alopurinol, rasburicasa, ambos? ¿Volumen de hidratación IV?' },
      { id: 'q19', text: '¿Profilaxis de Pneumocystis jirovecii (trimetoprim-sulfametoxazol)? ¿Aciclovir para virus?' },
      { id: 'q20', text: '¿Factor estimulante de colonias (G-CSF / filgrastim) para prevenir neutropenia?' },
      { id: 'q21', text: '¿Beta-2 microglobulina? ¿Electroforesis de proteínas?' },
      { id: 'q22', text: '¿Evaluación dental previa? ¿Tiene caries, infecciones, abscesos que tratar antes?' },
    ]
  },
  {
    id: 'regimen',
    title: 'Régimen y objetivo del tratamiento',
    questions: [
      { id: 'q23', text: '¿R-CHOP a dosis completa, R-mini-CHOP, R-CEOP (sin doxorrubicina), R-bendamustina, o qué?' },
      { id: 'q24', text: 'Si es R-mini-CHOP, ¿qué dosis exactas de cada componente?' },
      { id: 'q25', text: '¿Cuántos ciclos planean? ¿Van a hacer PET intermedio (en ciclo 2 o 4) para evaluar respuesta?' },
      { id: 'q26', text: '¿Profilaxis de SNC (metotrexato sistémico o intratecal)? Tiene más de 2 sitios extranodales y LDH muy alta.' },
      { id: 'q27', text: '¿El objetivo es CURATIVO, de CONTROL DE ENFERMEDAD, o PALIATIVO? Queremos una respuesta honesta.' },
      { id: 'q28', text: 'En términos numéricos, ¿cuál es la probabilidad estimada de alcanzar remisión completa con este plan? ¿Y de vivir 2 años?' },
      { id: 'q29', text: '¿Cuándo exactamente planean dar la primera dosis? ¿Qué criterios de estabilidad están esperando?' },
      { id: 'q30', text: '¿Lo van a administrar en piso de oncología o en UCI? ¿Quién lo monitorea las primeras 24-72 horas?' },
    ]
  },
  {
    id: 'team',
    title: 'Equipo y soporte',
    questions: [
      { id: 'q31', text: '¿Ya lo vio oncogeriatría?' },
      { id: 'q32', text: '¿Ya lo vio cuidados paliativos (no es "rendirse" — ayuda con síntomas y decisiones)?' },
      { id: 'q33', text: '¿Está valorado por nutrición? ¿Recomendación calórica y proteica?' },
      { id: 'q34', text: '¿Necesita sonda nasogástrica o nasoenteral para soporte nutricional?' },
      { id: 'q35', text: '¿Rehabilitación / fisioterapia temprana en UCI para prevenir pérdida muscular?' },
      { id: 'q36', text: '¿Quién es el médico tratante principal: intensivista, oncólogo, o ambos?' },
      { id: 'q37', text: '¿Hay un coordinador de caso? ¿Horario de rondas para que la familia esté?' },
    ]
  },
  {
    id: 'symptoms',
    title: 'Manejo de síntomas',
    questions: [
      { id: 'q38', text: '¿Cómo están manejando el dolor óseo? ¿Acetaminofén + opioide + adyuvantes?' },
      { id: 'q39', text: '¿Ha recibido bisfosfonato (ácido zoledrónico) o denosumab para lesiones líticas?' },
      { id: 'q40', text: '¿El derrame pleural izquierdo es tumoral, paraneumónico, o por sobrecarga? ¿Se hizo citología del líquido?' },
      { id: 'q41', text: '¿Cuándo se retira el tubo de tórax? ¿Drenaje actual por día?' },
      { id: 'q42', text: '¿Requerimiento actual de oxígeno? ¿Sigue con soporte respiratorio?' },
      { id: 'q43', text: '¿Ha tenido episodios de confusión, agitación, desorientación (delirium)?' },
      { id: 'q44', text: '¿Profilaxis de tromboembolismo (enoxaparina)? ¿Con plaquetas bajas, qué plan?' },
    ]
  },
  {
    id: 'legal',
    title: 'Consentimiento y comunicación',
    questions: [
      { id: 'q45', text: '¿Roro puede firmar consentimiento por sí mismo, o necesitan subrogado legal? Si es subrogado, ¿quién?' },
      { id: 'q46', text: '¿Tiene documento de voluntades anticipadas? ¿Orden de no reanimación?' },
      { id: 'q47', text: '¿Si llega a empeorar, cuáles son los escenarios que necesitaríamos discutir anticipadamente?' },
      { id: 'q48', text: '¿Cómo y cuándo podemos tener reunión familiar formal con el equipo tratante?' },
    ]
  },
];
