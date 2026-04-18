import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, Activity, Heart, Pill, AlertTriangle, HelpCircle,
  Utensils, Shield, BookOpen, NotebookPen, Map as MapIcon, FlaskConical,
  Save, Download, CheckCircle2, Clock, ChevronRight, ChevronDown,
  User, Calendar, Droplets, Brain, Bone, Scan, Menu, X,
  Copy, FileText, TrendingUp, TrendingDown, Minus,
  AlertCircle, Info, CheckCheck, Plus, Trash2, Stethoscope,
  Thermometer, HandHeart, Soup, Coffee,
  CalendarDays, Package, ShoppingCart, Users, Sun, Moon, Sunset,
  MessageCircle, Share2, Image
} from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Inicio', icon: Home, group: 'entender' },
  { id: 'diagnosis', label: 'Qué tiene Roro', icon: Activity, group: 'entender' },
  { id: 'bodymap', label: 'Mapa corporal', icon: MapIcon, group: 'entender' },
  { id: 'labs', label: 'Laboratorios', icon: FlaskConical, group: 'entender' },
  { id: 'treatment', label: 'Tratamiento', icon: Pill, group: 'entender' },
  { id: 'risks', label: 'Escenarios reales', icon: AlertTriangle, group: 'entender' },
  { id: 'questions', label: 'Preguntas médicos', icon: HelpCircle, group: 'actuar' },
  { id: 'calendar', label: 'Calendario visitas', icon: CalendarDays, group: 'actuar' },
  { id: 'inventory', label: 'Inventario', icon: Package, group: 'actuar' },
  { id: 'care', label: 'Cuidados diarios', icon: Shield, group: 'actuar' },
  { id: 'nutrition', label: 'Recetario soporte', icon: Utensils, group: 'actuar' },
  { id: 'medlog', label: 'Medicamentos', icon: Stethoscope, group: 'actuar' },
  { id: 'notes', label: 'Diario familia', icon: NotebookPen, group: 'actuar' },
  { id: 'glossary', label: 'Glosario', icon: BookOpen, group: 'referencia' },
  { id: 'export', label: 'Exportar a WhatsApp', icon: Download, group: 'referencia' },
];

const groupLabels = {
  entender: 'Entender',
  actuar: 'Actuar',
  referencia: 'Referencia',
};

// --- Data: Questions for doctors ---
const questionGroups = [
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

// --- Data: Daily checklist items ---
const checklistItems = [
  { id: 'c1', label: 'Cambio de posición cada 2 horas (prevención escaras)', category: 'piel' },
  { id: 'c2', label: 'Revisar sacro, talones y codos (lesiones por presión)', category: 'piel' },
  { id: 'c3', label: 'Crema barrera en sacro', category: 'piel' },
  { id: 'c4', label: 'Enjuague con agua + bicarbonato (4-6 veces al día)', category: 'boca' },
  { id: 'c5', label: 'Cepillo suave, sin alcohol', category: 'boca' },
  { id: 'c6', label: 'Revisar lengua y mucosas (buscar placas, úlceras, sangrado)', category: 'boca' },
  { id: 'c7', label: 'Labios lubricados (vaselina o cera natural)', category: 'boca' },
  { id: 'c8', label: 'Orientación: reloj, ventana, decirle fecha y lugar', category: 'mente' },
  { id: 'c9', label: 'Gafas / audífonos puestos si los usa', category: 'mente' },
  { id: 'c10', label: 'Música suave conocida / fotos familiares cerca', category: 'mente' },
  { id: 'c11', label: 'Respeto al ciclo sueño-vigilia (menos luz en noche)', category: 'mente' },
  { id: 'c12', label: 'Evaluación de dolor (escala de 0 a 10 o gestos)', category: 'dolor' },
  { id: 'c13', label: 'Analgesia administrada según escalera', category: 'dolor' },
  { id: 'c14', label: 'Hidratación controlada (balance)', category: 'nutricion' },
  { id: 'c15', label: 'Registro de ingesta por boca o sonda', category: 'nutricion' },
  { id: 'c16', label: 'Ofrecer líquidos/alimentos preparados en casa si autorizado', category: 'nutricion' },
  { id: 'c17', label: 'Tomar su mano, hablarle aunque parezca dormido', category: 'presencia' },
  { id: 'c18', label: 'Lavado de manos antes de entrar', category: 'presencia' },
];

// --- Data: Recipes ---
const mouthRinseRecipes = [
  {
    id: 'r1',
    name: 'Enjuague de bicarbonato y sal (el fundamental)',
    evidence: 'Evidencia nivel 1 — recomendado por guías MASCC/ISOO para prevención de mucositis',
    when: 'Desde antes de la quimio, 4-6 veces al día, especialmente después de cada comida',
    ingredients: [
      '250 ml de agua tibia (hervida previamente, no caliente)',
      '½ cucharadita de bicarbonato de sodio',
      '½ cucharadita de sal (no de mar si hay neutropenia, mejor sal refinada)',
    ],
    method: 'Disolver bien. Enjuagar boca 30 segundos, escupir. No tragar. Preparar fresco cada vez.',
    caution: 'Si siente quemazón, reducir sal a ¼ cucharadita.',
  },
  {
    id: 'r2',
    name: 'Enjuague de manzanilla',
    evidence: 'Evidencia moderada — antiinflamatorio suave, calma mucosa irritada',
    when: 'Como complemento, 2-3 veces al día. No reemplaza el bicarbonato.',
    ingredients: [
      '1 bolsita de manzanilla (Matricaria chamomilla)',
      '250 ml de agua hervida',
    ],
    method: 'Reposar la manzanilla 10 min, dejar enfriar completamente (temperatura ambiente o fría). Enjuagar 30 segundos.',
    caution: 'Si hay alergia a ambrosía o margaritas, evitar.',
  },
  {
    id: 'r3',
    name: 'Oil pulling con aceite de coco (antes de dormir)',
    evidence: 'Evidencia moderada — reduce carga bacteriana oral, alivia boca seca',
    when: 'Una vez al día, preferiblemente antes de dormir',
    ingredients: [
      '1 cucharada de aceite de coco virgen (grado alimenticio)',
    ],
    method: 'Poner en la boca, dejar que se derrita con el calor de la boca (30 seg), luego moverlo suavemente entre dientes durante 5-10 minutos. Escupir en bolsa (no en lavamanos — tapa cañerías). Enjuagar con agua.',
    caution: 'No hacer si tiene dificultad para tragar o está sedado. No hacer si hay mucositis severa con sangrado — podría estorbar.',
  },
  {
    id: 'r4',
    name: 'Miel de flor de abeja aplicada en lesiones',
    evidence: 'Evidencia creciente (Cochrane 2020) — reduce severidad de mucositis en quimio/radio',
    when: 'Si aparece mucositis, 3 veces al día sobre las zonas irritadas',
    ingredients: [
      '1 cucharadita de miel natural sin procesar',
    ],
    method: 'Aplicar directamente sobre las úlceras orales con un hisopo limpio. Dejar actuar 1-2 minutos. No enjuagar inmediatamente.',
    caution: 'EVITAR si hay diabetes mal controlada o si está en neutropenia profunda (usar miel pasteurizada en neutropenia). Nunca dar miel en forma casera a personas inmunosuprimidas sin verificar con el equipo.',
  },
  {
    id: 'r5',
    name: 'Enjuague frío de té verde débil',
    evidence: 'Evidencia moderada — antioxidantes (EGCG), reduce inflamación',
    when: 'Opcional, 1-2 veces al día',
    ingredients: [
      '1 bolsita de té verde',
      '300 ml de agua hervida',
    ],
    method: 'Infusionar 3 min (no más — queda amargo). Enfriar por completo. Enjuagar sin tragar.',
    caution: 'Tiene cafeína — no antes de dormir.',
  },
];

const avoidInMouth = [
  'Enjuagues con alcohol (Listerine clásico, etc.) — resecan y queman mucosa',
  'Clavos de olor masticados o en enjuague — son abrasivos e irritan mucosa dañada',
  'Jengibre directo en boca si hay mucositis — arde mucho',
  'Limón, naranja, piña directos en boca cuando hay mucositis — el ácido lastima',
  'Pasta de dientes con lauril sulfato de sodio (SLS) fuerte — preferir una suave sin SLS',
  'Cepillos duros o de cerdas medias',
];

const foodRecipes = [
  {
    id: 'f1',
    name: 'Caldo de huesos casero (base de casi todo)',
    phase: 'Siempre. Fundacional.',
    why: 'Aporta colágeno, aminoácidos (glicina, prolina), electrolitos, minerales. Es hidratante, fácil de tragar, denso en micronutrientes. Excelente para mucositis y desnutrición.',
    ingredients: [
      '1.5-2 kg de huesos (pollo con médula, huesos de res, costilla, cuello o combinación)',
      '2 zanahorias grandes',
      '2 tallos de apio',
      '1 cebolla con cáscara (la cáscara aporta quercetina)',
      '6 dientes de ajo aplastados',
      '2 cucharadas de vinagre de manzana (ayuda a extraer minerales)',
      '2 hojas de laurel',
      '1 cucharadita de sal',
      '1 ramita de tomillo o romero (opcional)',
      '4 L de agua',
    ],
    method: 'Rostizar los huesos en horno a 200°C por 30 min (da sabor). Pasar a olla grande con todos los ingredientes. Hervir, luego bajar a fuego muy suave. Cocinar 8-12 horas (olla lenta) o 3 horas (olla express). Retirar espuma superior. Colar bien. Porcionar en frascos o en cubetas de hielo. Dura 5 días en nevera, 3 meses congelado.',
    nutrition: '1 taza aporta ~10-15 g colágeno, ~6 g proteína, minerales',
  },
  {
    id: 'f2',
    name: 'Paletas de caldo de huesos con mango',
    phase: 'Pre-quimio y durante mucositis — calma, hidrata, aporta proteína',
    why: 'El frío anestesia la boca irritada, el caldo aporta proteína y minerales, el mango es suave y nutritivo sin acidez alta.',
    ingredients: [
      '2 tazas de caldo de huesos frío',
      '1 taza de pulpa de mango maduro triturada (o durazno, o papaya)',
      '1 cucharada de miel (omitir si diabetes o neutropenia severa)',
      'Pizca de sal',
    ],
    method: 'Mezclar todo bien. Vertir en moldes de paletas. Congelar 6 horas. Idealmente hacer una tanda de 10-12 y tener listas siempre.',
    nutrition: 'Cada paleta: ~60-80 kcal, 3-4 g proteína, vitamina A, potasio',
  },
  {
    id: 'f3',
    name: 'Smoothie alto en calorías (aguacate-plátano-avena)',
    phase: 'Para recuperar peso. Pre-quimio. Días que tolera líquidos más densos.',
    why: 'Aguacate y mantequilla de maní son grasas saludables densas en calorías. Plátano maduro aporta potasio y es suave. Avena da carbohidrato complejo y fibra soluble.',
    ingredients: [
      '½ aguacate maduro',
      '1 plátano maduro bien amarillo',
      '1 cucharada de mantequilla de maní natural (sin aceite añadido)',
      '3 cucharadas de avena instantánea',
      '250 ml de leche entera o bebida de avena enriquecida',
      '1 cucharadita de miel',
      'Pizca de canela',
      'Pizca de sal',
    ],
    method: 'Cocinar brevemente la avena en la leche (2 min) para que no quede cruda. Dejar enfriar. Licuar todo con el aguacate, plátano, mantequilla de maní, miel, canela y sal hasta textura completamente suave. Servir recién hecho.',
    nutrition: '~500-550 kcal, 15-18 g proteína, 25 g grasa saludable',
  },
  {
    id: 'f4',
    name: 'Puré de papa enriquecido (comida hospitalaria mejorada)',
    phase: 'Cuando pueda comer blando. Alta densidad calórica.',
    why: 'La papa es suave, tolerada casi siempre. Enriquecida con grasas y proteína se vuelve un vehículo calórico potente.',
    ingredients: [
      '2 papas blancas medianas peladas y cortadas',
      '3 cucharadas de mantequilla',
      '¼ taza de leche entera tibia',
      '1 cucharada de aceite de oliva extra virgen',
      '1 yema de huevo bien cocida desmenuzada',
      '2 cucharadas de queso crema o ricotta (hervir/pasteurizar si neutropenia)',
      'Sal y pimienta blanca',
      'Perejil picado fino (solo si NO hay neutropenia)',
    ],
    method: 'Hervir las papas en agua con sal hasta muy blandas (20 min). Escurrir. Aplastar con tenedor o pasapurés (no licuadora — queda chicloso). Añadir mantequilla, leche tibia, aceite, yema, y queso crema. Mezclar hasta cremoso.',
    nutrition: '~400-450 kcal por porción, 10 g proteína',
  },
  {
    id: 'f5',
    name: 'Caldo de pollo con fideos finos y huevo batido (sopa terapéutica)',
    phase: 'Siempre, especialmente cuando hay poco apetito.',
    why: 'Combina caldo hidratante + carbohidrato suave + proteína completa del huevo. Temperatura tibia reconforta. Versión "estilo griego".',
    ingredients: [
      '3 tazas de caldo de pollo casero',
      '¼ taza de fideos de cabello de ángel o pasta fina',
      '2 huevos muy bien batidos',
      '1 cucharada de jugo de limón (OMITIR si hay mucositis)',
      '1 cucharada de perejil finamente picado (OMITIR si neutropenia)',
      'Sal al gusto',
    ],
    method: 'Hervir el caldo. Añadir los fideos, cocinar hasta blandos (5 min). Bajar el fuego casi apagado. En un bol aparte, batir los huevos con el limón (si aplica). Verter los huevos MUY lentamente sobre el caldo mientras se revuelve con cuchara en un solo sentido — forma "nubes" finas. Apagar inmediatamente. Servir.',
    nutrition: '~300 kcal, 18 g proteína (proteína biodisponible del huevo)',
  },
  {
    id: 'f6',
    name: 'Arroz con leche enriquecido',
    phase: 'Postre terapéutico. Suave, blando, consuela.',
    why: 'Arroz bien cocido es de los alimentos mejor tolerados. La leche y el huevo al final aportan proteína de alta calidad.',
    ingredients: [
      '½ taza de arroz blanco',
      '1 L de leche entera',
      '½ taza de azúcar (o menos)',
      '1 rama de canela',
      '1 cáscara de limón (solo la parte amarilla)',
      '2 yemas de huevo batidas',
      '1 cucharadita de extracto de vainilla',
      'Canela en polvo para servir',
    ],
    method: 'Hervir el arroz en la leche con canela y cáscara de limón a fuego muy suave, revolviendo frecuente, por 35-40 minutos hasta cremoso. Añadir azúcar. Retirar del fuego. Templar las yemas con un poco del arroz caliente (para no cocerlas de golpe), luego incorporarlas a la olla revolviendo. Añadir vainilla. Retirar canela y cáscara. Servir tibio con canela espolvoreada.',
    nutrition: '~280 kcal por porción, 9 g proteína',
  },
  {
    id: 'f7',
    name: 'Compota de manzana y pera con canela',
    phase: 'Suave, siempre. Aporta fibra soluble y potasio.',
    why: 'Fácil de digerir, bajo riesgo microbiológico (está cocida), reconforta.',
    ingredients: [
      '3 manzanas rojas peladas y picadas',
      '2 peras peladas y picadas',
      '1 cucharada de mantequilla',
      '1 rama de canela',
      '1 pizca de sal',
      '1 cucharadita de miel (opcional, si no diabetes)',
      '½ taza de agua',
    ],
    method: 'Cocinar todo junto en olla tapada a fuego medio 20 min hasta que las frutas estén completamente blandas. Retirar canela. Triturar con tenedor o procesador a la textura deseada. Se puede servir tibia o fría.',
    nutrition: '~130 kcal, 3 g fibra, vitamina C, potasio',
  },
  {
    id: 'f8',
    name: 'Pudín de chía (para hidratación + fibra + proteína)',
    phase: 'Pre-quimio. NO en neutropenia severa.',
    why: 'Las chías se hinchan en líquido formando un gel que hidrata, aporta omega-3 vegetal y fibra soluble. Textura suave tipo tapioca.',
    ingredients: [
      '3 cucharadas de semillas de chía',
      '1 taza de leche entera o bebida de coco',
      '1 cucharada de miel o jarabe de arce',
      '½ cucharadita de vainilla',
      'Fruta madura blanda para topping (plátano, mango, durazno)',
    ],
    method: 'Mezclar chía con leche, miel y vainilla. Dejar reposar 15 min, remover bien para evitar grumos. Refrigerar mínimo 4 horas o toda la noche. Servir con fruta blanda encima.',
    nutrition: '~320 kcal, 10 g proteína, 12 g fibra, omega-3',
  },
];

const neutropeniaRules = [
  { rule: 'Todo bien cocido', ok: 'Carnes al punto bien hecho, huevos duros, vegetales hervidos', avoid: 'Sushi, carpaccio, huevo tibio, carne término medio' },
  { rule: 'Frutas peladas gruesas solamente', ok: 'Plátano, mango (pelado), papaya (pelada), aguacate', avoid: 'Fresas, frambuesas, uvas, manzana con cáscara, ensaladas de frutas' },
  { rule: 'Vegetales SOLO cocidos', ok: 'Zanahoria, papa, calabaza, espinaca hervidas', avoid: 'Lechuga, tomate crudo, pepino, zanahoria rallada, ensaladas' },
  { rule: 'Lácteos pasteurizados únicamente', ok: 'Leche UHT, yogurt industrial, quesos madurados amarillos', avoid: 'Queso fresco de mercado, leche cruda, queso de cabra artesanal, mozzarella fresca' },
  { rule: 'Nada fermentado sin control', ok: 'Yogurt industrial sellado', avoid: 'Kombucha, kimchi artesanal, kéfir casero, quesos con moho' },
  { rule: 'Nueces y semillas: solo envasadas industrialmente', ok: 'Almendras tostadas en paquete sellado', avoid: 'Nueces al granel, frutos secos del mercado abierto' },
  { rule: 'Miel: pasteurizada en esta fase', ok: 'Miel industrial de marca con sello', avoid: 'Miel cruda artesanal de apicultor (riesgo clostridium)' },
  { rule: 'Agua: siempre hervida o embotellada sellada', ok: 'Agua embotellada, agua hervida, agua filtrada con hervor', avoid: 'Agua del grifo sin hervir, hielo casero de agua no hervida' },
];

const hydrationIdeas = [
  { name: 'Agua de coco natural', why: 'Electrolitos naturales, potasio, suave', caution: 'Si diuresis alta o hipercalemia, limitar' },
  { name: 'Cubitos de caldo de huesos', why: 'Hidratan + proteína + minerales', caution: 'Revisar sodio si hipertensión' },
  { name: 'Agua con rodajas de pepino y menta', why: 'Refrescante, estimula a beber', caution: 'En neutropenia, usar pepino pelado y menta lavada con agua hervida' },
  { name: 'Té de jengibre suave', why: 'Alivia náusea', caution: 'NO si anticoagulado, por interacción con warfarina/enoxaparina' },
  { name: 'Agua con unas gotas de limón y pizca de sal', why: 'Balance hidroelectrolítico sencillo', caution: 'Omitir limón si mucositis' },
  { name: 'Paletas de té de manzanilla', why: 'Hidratan + calman náusea + suaves para boca', caution: 'Asegurar temperatura ambiente antes de congelar' },
];

// --- Inventario base ---
const inventoryCatalog = [
  {
    category: 'Cuidado de piel y aseo',
    items: [
      'Pañales adulto (talla M/L)',
      'Pañales absorbentes de cama (chux)',
      'Toallitas húmedas sin alcohol',
      'Crema barrera (óxido de zinc)',
      'Crema hidratante sin perfume',
      'Vaselina / protector labial',
      'Aceite de coco virgen',
      'Jabón neutro (Dove, Cetaphil)',
      'Shampoo sin sulfatos',
      'Toalla personal (2-3)',
    ],
  },
  {
    category: 'Cuidado bucal',
    items: [
      'Cepillo dental ultra-suave (3 repuestos)',
      'Bicarbonato de sodio',
      'Sal',
      'Manzanilla en bolsitas',
      'Miel natural',
      'Té verde en bolsitas',
      'Hisopos bucales desechables',
      'Pasta dental sin SLS',
      'Vasos desechables pequeños (para enjuagues)',
    ],
  },
  {
    category: 'Cocina casera para Roro',
    items: [
      'Huesos para caldo (pollo, res)',
      'Moldes para paletas (10-12)',
      'Termo térmico para caldo',
      'Containers herméticos para transporte',
      'Licuadora portable / mini',
      'Aguacates maduros',
      'Plátanos maduros',
      'Mantequilla de maní natural',
      'Avena en hojuelas',
      'Leche entera o bebida de avena',
      'Mango / durazno maduro',
      'Semillas de chía',
      'Huevos frescos',
      'Papa blanca',
      'Mantequilla',
      'Ensure / suplemento proteico',
    ],
  },
  {
    category: 'Suministros médicos',
    items: [
      'Guantes desechables (caja)',
      'Gel antibacterial',
      'Alcohol antiséptico',
      'Tapabocas N95 (5-10)',
      'Tapabocas quirúrgicos',
      'Termómetro digital',
      'Oxímetro de pulso',
      'Tensiómetro digital',
      'Pañuelos desechables',
    ],
  },
  {
    category: 'Ropa y textiles',
    items: [
      'Piyamas abiertas delante (3-4)',
      'Calcetines antideslizantes',
      'Cobija de casa (olor familiar)',
      'Toallas propias',
      'Almohada adicional',
      'Gorro de algodón (si pierde pelo)',
    ],
  },
  {
    category: 'Emocional y ambiente',
    items: [
      'Foto-collage de la familia (enmarcada)',
      'Reloj de pared grande analógico',
      'Calendario mensual visible',
      'Audífonos cómodos',
      'Parlante bluetooth pequeño',
      'Tablet con música/videos pre-descargados',
      'Libros o revistas favoritas',
      'Rosario / objeto espiritual personal',
    ],
  },
  {
    category: 'Logística cuidadores',
    items: [
      'Lista de contactos médicos (impresa)',
      'Cargadores de teléfono (2)',
      'Termo de café',
      'Snacks saludables',
      'Agua embotellada',
      'Cambio de ropa cuidador',
      'Almohadilla / cojín para silla',
    ],
  },
];

// --- Component ---
export default function LymphomaCareApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const [checklist, setChecklist] = useState({});
  const [medLog, setMedLog] = useState([]);
  const [newMed, setNewMed] = useState({ date: '', name: '', dose: '', notes: '' });
  const [calendarData, setCalendarData] = useState({});
  const [inventoryData, setInventoryData] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(null);
  const [exportText, setExportText] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const a = await window.storage.get('care-answers');
        if (a && a.value) setAnswers(JSON.parse(a.value));
      } catch (e) { /* nothing stored yet */ }
      try {
        const n = await window.storage.get('care-notes');
        if (n && n.value) setNotes(n.value);
      } catch (e) {}
      try {
        const c = await window.storage.get('care-checklist');
        if (c && c.value) setChecklist(JSON.parse(c.value));
      } catch (e) {}
      try {
        const m = await window.storage.get('care-medlog');
        if (m && m.value) setMedLog(JSON.parse(m.value));
      } catch (e) {}
      try {
        const cal = await window.storage.get('care-calendar');
        if (cal && cal.value) setCalendarData(JSON.parse(cal.value));
      } catch (e) {}
      try {
        const inv = await window.storage.get('care-inventory');
        if (inv && inv.value) setInventoryData(JSON.parse(inv.value));
      } catch (e) {}
      try {
        const act = await window.storage.get('care-activity-log');
        if (act && act.value) setActivityLog(JSON.parse(act.value));
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, []);

  const logActivity = async (actor, action, detail) => {
    const entry = {
      id: Date.now(),
      time: new Date().toISOString(),
      actor: actor || 'Familia',
      action,
      detail: detail || '',
    };
    const updated = [entry, ...activityLog].slice(0, 200); // keep last 200
    setActivityLog(updated);
    try {
      await window.storage.set('care-activity-log', JSON.stringify(updated));
    } catch (e) {}
  };

  const flashSave = (msg = 'Guardado') => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(''), 1800);
  };

  const saveAnswer = async (id, text) => {
    const updated = { ...answers, [id]: { text, date: new Date().toISOString() } };
    setAnswers(updated);
    try {
      await window.storage.set('care-answers', JSON.stringify(updated));
      if (text && text.trim()) {
        const q = questionGroups.flatMap(g => g.questions).find(q => q.id === id);
        if (q) await logActivity('Familia', 'Respuesta médica registrada', q.text.slice(0, 80));
      }
      flashSave();
    } catch (e) {
      flashSave('Error al guardar');
    }
  };

  const saveNotes = async (v) => {
    setNotes(v);
    try {
      await window.storage.set('care-notes', v);
    } catch (e) {}
  };

  const appendNote = async () => {
    if (!newNote.trim()) return;
    const timestamp = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    const entry = `[${timestamp}] ${newNote.trim()}\n\n`;
    const updated = entry + notes;
    setNotes(updated);
    const noteText = newNote.trim();
    setNewNote('');
    try {
      await window.storage.set('care-notes', updated);
      await logActivity('Familia', 'Nota en el diario', noteText.slice(0, 100));
      flashSave('Nota agregada · el broadcast ya se puede actualizar');
    } catch (e) {}
  };

  const toggleCheck = async (id) => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${today}_${id}`;
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      await window.storage.set('care-checklist', JSON.stringify(updated));
    } catch (e) {}
  };

  const addMed = async () => {
    if (!newMed.name.trim()) return;
    const entry = {
      id: Date.now(),
      date: newMed.date || new Date().toLocaleDateString('es-CO'),
      name: newMed.name.trim(),
      dose: newMed.dose.trim(),
      notes: newMed.notes.trim(),
    };
    const updated = [entry, ...medLog];
    setMedLog(updated);
    setNewMed({ date: '', name: '', dose: '', notes: '' });
    try {
      await window.storage.set('care-medlog', JSON.stringify(updated));
      await logActivity('Familia', 'Medicamento registrado', `${entry.name} ${entry.dose}`);
      flashSave('Medicamento registrado');
    } catch (e) {}
  };

  const deleteMed = async (id) => {
    const updated = medLog.filter(m => m.id !== id);
    setMedLog(updated);
    try {
      await window.storage.set('care-medlog', JSON.stringify(updated));
    } catch (e) {}
  };

  // --- Calendar helpers ---
  const saveCalendarSlot = async (dateKey, slot, data) => {
    const updated = {
      ...calendarData,
      [dateKey]: {
        ...(calendarData[dateKey] || {}),
        [slot]: data,
      },
    };
    setCalendarData(updated);
    try {
      await window.storage.set('care-calendar', JSON.stringify(updated));
      if (data.who && data.who.trim()) {
        await logActivity(data.who, 'Acompañamiento programado', `${dateKey} · ${slot}${data.notes ? ' · ' + data.notes : ''}`);
      }
      flashSave('Turno guardado');
    } catch (e) {}
  };

  const clearCalendarSlot = async (dateKey, slot) => {
    const updated = { ...calendarData };
    if (updated[dateKey]) {
      delete updated[dateKey][slot];
      if (Object.keys(updated[dateKey]).length === 0) delete updated[dateKey];
    }
    setCalendarData(updated);
    try {
      await window.storage.set('care-calendar', JSON.stringify(updated));
    } catch (e) {}
  };

  // --- Inventory helpers ---
  const saveInventoryItem = async (itemId, data) => {
    const updated = { ...inventoryData, [itemId]: data };
    setInventoryData(updated);
    try {
      await window.storage.set('care-inventory', JSON.stringify(updated));
      if (data.status === 'falta') {
        await logActivity(data.responsable || 'Familia', 'Insumo en lista de compras', data.name || itemId);
      } else if (data.status === 'tengo') {
        await logActivity(data.responsable || 'Familia', 'Insumo disponible', data.name || itemId);
      }
    } catch (e) {}
  };

  const generateExport = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    let txt = '';
    txt += `*ACTUALIZACIÓN RORO — ${dateStr} · ${timeStr}*\n`;
    txt += `_Rodrigo Cardona · Clínica del Country_\n\n`;
    txt += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Activity reciente
    const recentActivity = activityLog.slice(0, 10);
    if (recentActivity.length > 0) {
      txt += `*📋 NOVEDADES ÚLTIMAS HORAS*\n\n`;
      recentActivity.forEach(a => {
        const t = new Date(a.time).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        txt += `• ${t} — ${a.actor}: ${a.action}`;
        if (a.detail) txt += ` (${a.detail.slice(0, 80)})`;
        txt += `\n`;
      });
      txt += `\n`;
    }

    // Preguntas respondidas
    let hasAnswers = false;
    questionGroups.forEach(group => {
      const answered = group.questions.filter(q => answers[q.id] && answers[q.id].text);
      if (answered.length === 0) return;
      if (!hasAnswers) {
        txt += `*💬 RESPUESTAS DE LOS MÉDICOS*\n\n`;
        hasAnswers = true;
      }
      txt += `▸ _${group.title}_\n`;
      answered.forEach(q => {
        txt += `\n*P:* ${q.text}\n`;
        txt += `*R:* ${answers[q.id].text}\n`;
      });
      txt += `\n`;
    });

    // Calendario próximos 7 días
    const days7 = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days7.push(d);
    }
    const formatDk = (d) => d.toISOString().slice(0, 10);
    const hasSlots = days7.some(d => {
      const dk = formatDk(d);
      return calendarData[dk] && Object.keys(calendarData[dk]).some(s => calendarData[dk][s].who);
    });
    if (hasSlots) {
      txt += `*📅 TURNOS PRÓXIMOS 7 DÍAS*\n\n`;
      const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      days7.forEach(d => {
        const dk = formatDk(d);
        const dayData = calendarData[dk];
        if (!dayData) return;
        const slots = [];
        if (dayData.manana && dayData.manana.who) slots.push(`mañana: ${dayData.manana.who}${dayData.manana.notes ? ' (' + dayData.manana.notes + ')' : ''}`);
        if (dayData.tarde && dayData.tarde.who) slots.push(`tarde: ${dayData.tarde.who}${dayData.tarde.notes ? ' (' + dayData.tarde.notes + ')' : ''}`);
        if (dayData.noche && dayData.noche.who) slots.push(`noche: ${dayData.noche.who}${dayData.noche.notes ? ' (' + dayData.noche.notes + ')' : ''}`);
        if (slots.length > 0) {
          txt += `• *${weekdays[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}* — ${slots.join(' · ')}\n`;
        }
      });
      txt += `\n`;
    }

    // Turnos sin cubrir próximos 3 días
    const uncovered = [];
    days7.slice(0, 3).forEach(d => {
      const dk = formatDk(d);
      const dayData = calendarData[dk] || {};
      ['manana', 'tarde', 'noche'].forEach(slot => {
        if (!dayData[slot] || !dayData[slot].who) {
          const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          uncovered.push(`${weekdays[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} ${slot}`);
        }
      });
    });
    if (uncovered.length > 0) {
      txt += `*🙋 TURNOS SIN CUBRIR (próximos 3 días)*\n\n`;
      uncovered.forEach(u => txt += `• ${u}\n`);
      txt += `\n_Si alguien puede acompañar, avisar para anotarlo._\n\n`;
    }

    // Inventario - lo que falta
    const missingItems = [];
    const buyingItems = [];
    Object.entries(inventoryData).forEach(([key, v]) => {
      if (v.status === 'falta') missingItems.push(v);
      if (v.status === 'comprando') buyingItems.push(v);
    });
    if (missingItems.length > 0 || buyingItems.length > 0) {
      txt += `*📦 INVENTARIO*\n\n`;
      if (missingItems.length > 0) {
        txt += `*Faltan:*\n`;
        missingItems.forEach(item => {
          txt += `• ${item.name}`;
          if (item.notes) txt += ` (${item.notes})`;
          txt += `\n`;
        });
        txt += `\n`;
      }
      if (buyingItems.length > 0) {
        txt += `*Conseguirán:*\n`;
        buyingItems.forEach(item => {
          txt += `• ${item.name} — ${item.responsable || 'alguien'}`;
          if (item.notes) txt += ` (${item.notes})`;
          txt += `\n`;
        });
        txt += `\n`;
      }
    }

    // Medicamentos recientes
    const recentMeds = medLog.slice(0, 5);
    if (recentMeds.length > 0) {
      txt += `*💊 MEDICAMENTOS (últimos registrados)*\n\n`;
      recentMeds.forEach(m => {
        txt += `• ${m.date} — ${m.name}`;
        if (m.dose) txt += ` · ${m.dose}`;
        txt += `\n`;
        if (m.notes) txt += `   _${m.notes}_\n`;
      });
      txt += `\n`;
    }

    // Notas del diario (últimas)
    if (notes.trim()) {
      const lastNotes = notes.split('\n\n').filter(n => n.trim()).slice(0, 3);
      if (lastNotes.length > 0) {
        txt += `*📝 DIARIO (últimas notas)*\n\n`;
        lastNotes.forEach(n => {
          txt += `${n}\n\n`;
        });
      }
    }

    // Preguntas pendientes priorizadas
    const criticalGroupIds = ['dx', 'prechemo', 'regimen'];
    const criticalPending = [];
    questionGroups.forEach(group => {
      if (!criticalGroupIds.includes(group.id)) return;
      group.questions.forEach(q => {
        if (!answers[q.id] || !answers[q.id].text) {
          criticalPending.push(q.text);
        }
      });
    });
    if (criticalPending.length > 0) {
      txt += `*❓ PREGUNTAS URGENTES PARA PRÓXIMA REUNIÓN*\n\n`;
      criticalPending.slice(0, 8).forEach(q => {
        txt += `• ${q}\n`;
      });
      if (criticalPending.length > 8) {
        txt += `_(+ ${criticalPending.length - 8} preguntas más en la app)_\n`;
      }
      txt += `\n`;
    }

    txt += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    txt += `_Generado desde la app familiar de cuidado de Roro_\n`;
    txt += `_Actualización: ${dateStr} ${timeStr}_\n`;

    setExportText(txt);
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      await logActivity('Familia', 'Broadcast de WhatsApp generado', 'Copiado al portapapeles');
      flashSave('Copiado · péguenlo en WhatsApp');
    } catch (e) {
      flashSave('Error al copiar');
    }
  };

  const groups = useMemo(() => {
    const g = {};
    tabs.forEach(t => {
      if (!g[t.group]) g[t.group] = [];
      g[t.group].push(t);
    });
    return g;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-stone-500">
        <div className="text-center">
          <div className="animate-pulse text-sm">Cargando información guardada...</div>
        </div>
      </div>
    );
  }

  // --- Render helpers ---
  const SectionTitle = ({ children, subtitle }) => (
    <div className="mb-6">
      <h2 className="text-2xl font-serif font-normal text-stone-900 tracking-tight">{children}</h2>
      {subtitle && <p className="text-sm text-stone-500 mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );

  const Card = ({ children, tone = 'default', className = '' }) => {
    const tones = {
      default: 'bg-white border-stone-200',
      warn: 'bg-amber-50/60 border-amber-200',
      critical: 'bg-rose-50/60 border-rose-200',
      safe: 'bg-emerald-50/60 border-emerald-200',
      info: 'bg-sky-50/60 border-sky-200',
      muted: 'bg-stone-50 border-stone-200',
    };
    return (
      <div className={`${tones[tone]} border rounded-xl p-5 ${className}`}>
        {children}
      </div>
    );
  };

  const Pill = ({ children, tone = 'default' }) => {
    const tones = {
      default: 'bg-stone-100 text-stone-700',
      warn: 'bg-amber-100 text-amber-900',
      critical: 'bg-rose-100 text-rose-900',
      safe: 'bg-emerald-100 text-emerald-900',
      info: 'bg-sky-100 text-sky-900',
    };
    return (
      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${tones[tone]}`}>
        {children}
      </span>
    );
  };

  // --- Tab contents ---
  const renderHome = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="Esta aplicación guarda automáticamente todo lo que escriban — respuestas de médicos, notas, turnos de visita, medicamentos, inventario. Nadie más lo ve, es solo para la familia. Cada cosa que se anota queda en el log que después se exporta al broadcast de WhatsApp.">
        Bienvenida a la familia
      </SectionTitle>

      <Card tone="info">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <User className="w-5 h-5 text-sky-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sky-900">Rodrigo Cardona Moreno · 78 años</p>
            <p className="text-xs text-sky-800 mt-1">Cariñosamente: Roro · Clínica del Country, Bogotá · Ingreso: 6 abril 2026</p>
            <p className="text-xs text-sky-800">Actualmente en UCI · Próximo paso: traslado a oncología para iniciar preparación de quimioterapia</p>
          </div>
        </div>
      </Card>

      <Card tone="safe">
        <div className="flex items-start gap-3">
          <Share2 className="w-5 h-5 text-emerald-700 flex-none mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-950 mb-1">Cómo se comparte con la familia por WhatsApp</p>
            <p className="text-sm text-emerald-900 leading-relaxed mb-2">
              Cada vez que alguien escribe una nota, registra un medicamento, anota una respuesta del médico o se anota para un turno, se agrega al <span className="font-medium">log de actividad</span> (lo ven abajo).
            </p>
            <p className="text-sm text-emerald-900 leading-relaxed">
              Cuando quieran hacer el broadcast diario, vayan a <span className="font-medium">Exportar a WhatsApp</span>, den clic en "Generar resumen", y copien el texto. Lo pueden pegar directamente en el grupo familiar o en el broadcast.
              Lo recomendable es que haya un <span className="font-medium">cuidador responsable del día</span> que haga esto 1 o 2 veces al día (mañana y noche).
            </p>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-base font-medium text-stone-900 mb-3">Lo que sabemos con certeza</h3>
          <ul className="text-sm text-stone-700 space-y-2">
            <li className="flex gap-2"><CheckCheck className="w-4 h-4 text-emerald-600 flex-none mt-0.5"/>Linfoma agresivo diseminado (PET-CT del 7 abril)</li>
            <li className="flex gap-2"><CheckCheck className="w-4 h-4 text-emerald-600 flex-none mt-0.5"/>Estadio IV: ganglios, bazo, pulmones, huesos</li>
            <li className="flex gap-2"><CheckCheck className="w-4 h-4 text-emerald-600 flex-none mt-0.5"/>Cerebro limpio (TAC cráneo 12 abril)</li>
            <li className="flex gap-2"><CheckCheck className="w-4 h-4 text-emerald-600 flex-none mt-0.5"/>Sin VIH, sin sífilis</li>
            <li className="flex gap-2"><CheckCheck className="w-4 h-4 text-emerald-600 flex-none mt-0.5"/>Riñones y corazón OK por ahora</li>
          </ul>
        </Card>

        <Card tone="warn">
          <h3 className="text-base font-medium text-amber-950 mb-3">Lo que falta confirmar</h3>
          <ul className="text-sm text-amber-900 space-y-2">
            <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-amber-700 flex-none mt-0.5"/>Informe definitivo de patología (biopsias del 8 abril)</li>
            <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-amber-700 flex-none mt-0.5"/>Hepatitis B y C (crítico antes de rituximab)</li>
            <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-amber-700 flex-none mt-0.5"/>Ecocardiograma con FEVI (antes de doxorrubicina)</li>
            <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-amber-700 flex-none mt-0.5"/>Biopsia médula ósea</li>
            <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-amber-700 flex-none mt-0.5"/>Objetivo del tratamiento (curativo vs paliativo)</li>
          </ul>
        </Card>
      </div>

      <Card tone="critical">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-700 flex-none mt-0.5" />
          <div>
            <h3 className="text-base font-medium text-rose-950 mb-1">Por favor lean antes de seguir</h3>
            <p className="text-sm text-rose-900 leading-relaxed">
              Este es un caso complejo. Roro tiene 78 años, está en UCI, con enfermedad extensa y marcadores de carga tumoral muy altos.
              Hay escenarios realistas de buen resultado y escenarios menos favorables. La sección <span className="font-medium">"Escenarios reales"</span> explica honestamente
              qué puede pasar, sin falsos optimismos pero sin condenar. Lean esa sección en familia.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Image className="w-5 h-5 text-stone-600 flex-none mt-0.5" />
          <div className="flex-1">
            <h3 className="text-base font-medium text-stone-900 mb-2">Lo ambiental también cura — reloj y fotos</h3>
            <p className="text-sm text-stone-700 leading-relaxed mb-2">
              Cuando Roro pase a piso de oncología (y aunque esté en UCI si los dejan), pongan dos cosas que parecen pequeñas pero no lo son:
            </p>
            <ul className="text-sm text-stone-700 space-y-1.5 mb-3">
              <li>• <span className="font-medium">Un reloj de pared analógico grande y visible desde la cama.</span> El delirium de UCI (confusión aguda en mayores) se dispara cuando la persona pierde noción de tiempo. Ver un reloj ayuda a orientarse.</li>
              <li>• <span className="font-medium">Un collage con fotos de la familia — hijos, nietos, esposa, personas queridas.</span> Cerca de su cama, donde las vea al abrir los ojos. No subestimen esto: les recuerda quién es, por qué pelear, y reduce episodios de agitación nocturna.</li>
              <li>• <span className="font-medium">Un calendario visible</span> donde puedan marcar el día de hoy con un círculo grande.</li>
              <li>• <span className="font-medium">Sus gafas y audífonos puestos</span> si los usa. Pacientes que "no oyen bien" muchas veces están solo sin audífonos y parecen más confundidos de lo que están.</li>
            </ul>
            <p className="text-xs text-stone-500 italic">Estos están en el <span className="font-medium">Inventario</span>, categoría "Emocional y ambiente". Marquen quién los lleva.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-stone-500" />
          Log de actividad reciente
        </h3>
        {activityLog.length === 0 ? (
          <p className="text-sm text-stone-500 italic">Todavía no hay actividad registrada. A medida que la familia use la app, aquí aparecerá quién hizo qué y cuándo.</p>
        ) : (
          <div className="space-y-1">
            {activityLog.slice(0, 12).map(a => (
              <div key={a.id} className="flex items-start gap-2 text-xs border-b border-stone-100 pb-1.5 last:border-0">
                <span className="text-stone-400 font-mono flex-none" style={{ minWidth: '95px' }}>
                  {new Date(a.time).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-stone-700 font-medium flex-none">{a.actor}:</span>
                <span className="text-stone-600 flex-1">{a.action}{a.detail && <span className="text-stone-500"> · {a.detail}</span>}</span>
              </div>
            ))}
            {activityLog.length > 12 && (
              <p className="text-xs text-stone-400 italic pt-2">+ {activityLog.length - 12} actividades más — verlas todas en "Exportar a WhatsApp"</p>
            )}
          </div>
        )}
      </Card>

      <div>
        <h3 className="text-base font-medium text-stone-900 mb-3">Cómo usar esta aplicación</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Card tone="muted">
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Entender</p>
            <p className="text-sm text-stone-700">Diagnóstico, mapa corporal, labs con gráficas, tratamiento, escenarios. Para leer con calma.</p>
          </Card>
          <Card tone="muted">
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Actuar</p>
            <p className="text-sm text-stone-700">Preguntas para médicos, calendario de turnos, inventario de insumos, cuidados diarios, recetas, medicamentos, diario.</p>
          </Card>
          <Card tone="muted">
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Referencia</p>
            <p className="text-sm text-stone-700">Glosario de términos y exportación al broadcast de WhatsApp.</p>
          </Card>
        </div>
      </div>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-2">Un recordatorio para los cuidadores</h3>
        <p className="text-sm text-stone-700 leading-relaxed">
          Cuidar a alguien en UCI es un maratón, no una carrera. Coman, duerman, túrnense — por eso existe el calendario de visitas. Designen un familiar como "punto de contacto" con el hospital — una sola persona, un solo número, para evitar información cruzada.
          Y acérquense a Roro. Tomar su mano, hablarle suave, poner su música favorita — esto no es sólo cariño, está probado que reduce delirium y mejora recuperación.
        </p>
      </Card>
    </div>
  );

  const renderDiagnosis = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="El diagnóstico más probable y por qué los médicos están tan seguros, aunque aún falte la confirmación por escrito de la patología.">
        Qué tiene Roro, en palabras claras
      </SectionTitle>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Pill tone="info">Diagnóstico en trabajo</Pill>
        </div>
        <h3 className="text-xl font-serif text-stone-900 mb-2">Linfoma B difuso de células grandes (LBDCG)</h3>
        <p className="text-sm text-stone-600 italic mb-3">En inglés: Diffuse Large B-Cell Lymphoma, DLBCL</p>
        <p className="text-sm text-stone-700 leading-relaxed mb-3">
          Es un cáncer que nace en un tipo de glóbulo blanco llamado <span className="font-medium">linfocito B</span>.
          Estos linfocitos viven en los ganglios, el bazo, la médula ósea y otros tejidos linfoides. Cuando uno de ellos muta, empieza a multiplicarse descontroladamente y forma tumores en los ganglios, y después invade órganos.
        </p>
        <p className="text-sm text-stone-700 leading-relaxed">
          "Difuso" significa que las células malas invaden el tejido sin formar un patrón organizado. "Grandes" se refiere al tamaño de las células bajo el microscopio. Es el linfoma no-Hodgkin más común en adultos mayores de 60 años.
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card tone="warn">
          <h3 className="text-base font-medium text-amber-950 mb-2">Lo paradójico de los linfomas agresivos</h3>
          <p className="text-sm text-amber-900 leading-relaxed">
            Aunque suene duro que sea "agresivo" (crecimiento rápido), los linfomas agresivos <span className="font-medium">responden mejor a la quimioterapia</span> que los lentos.
            Razón: las drogas de quimio atacan células que se están dividiendo. Como estas células se dividen mucho, reciben más daño. Los linfomas lentos (indolentes) son más difíciles de eliminar completamente.
          </p>
        </Card>

        <Card tone="safe">
          <h3 className="text-base font-medium text-emerald-950 mb-2">Por qué es potencialmente curable</h3>
          <p className="text-sm text-emerald-900 leading-relaxed">
            R-CHOP (el tratamiento estándar) puede curar al 60-70% de adultos jóvenes fuertes con DLBCL. En mayores de 80 con buena condición, la cifra baja a ~50-60%. En pacientes frágiles como podría ser el caso de Roro, baja más,
            pero <span className="font-medium">sigue siendo una enfermedad tratable</span>, a diferencia de muchos cánceres sólidos en estadio IV.
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-4">Por qué los médicos están seguros del diagnóstico (aunque falte la patología escrita)</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-none w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-700">1</div>
            <div>
              <p className="text-sm font-medium text-stone-900">El patrón clínico clásico</p>
              <p className="text-sm text-stone-600">Adenopatías múltiples en cuello, mediastino, abdomen + pérdida de peso + fatiga + LDH muy elevada. Es casi un retrato del linfoma B difuso.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-none w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-700">2</div>
            <div>
              <p className="text-sm font-medium text-stone-900">El PET-CT con SUVmax hasta 26.7</p>
              <p className="text-sm text-stone-600">Los linfomas agresivos "brillan" intensamente en el PET (alto SUVmax). Los linfomas indolentes y muchos cánceres sólidos no brillan así. Este patrón es característico.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-none w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-700">3</div>
            <div>
              <p className="text-sm font-medium text-stone-900">La distribución de la enfermedad</p>
              <p className="text-sm text-stone-600">Supra e infradiafragmática + bazo + huesos + pulmones. Este tipo de diseminación es típica de linfoma.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-none w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-700">4</div>
            <div>
              <p className="text-sm font-medium text-stone-900">Marcadores tumorales sólidos negativos</p>
              <p className="text-sm text-stone-600">CEA y CA 19-9 normales descartan cáncer de colon/páncreas, que podrían causar adenopatías similares.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card tone="info">
        <h3 className="text-base font-medium text-sky-950 mb-2">Qué falta para la confirmación definitiva</h3>
        <p className="text-sm text-sky-900 leading-relaxed mb-3">
          El diagnóstico formal requiere que un patólogo vea las células al microscopio y confirme con inmunohistoquímica (marcadores como CD20, CD10, BCL6, Ki-67).
          Las biopsias se tomaron el 8 de abril del estómago y del duodeno. Puede que ya esté el informe — hay que pedirlo.
        </p>
        <p className="text-sm text-sky-900 leading-relaxed">
          También hay que saber si se hizo <span className="font-medium">biopsia de médula ósea</span> (muy probablemente sí, dado el patrón óseo) — el informe dice mucho sobre el pronóstico.
        </p>
      </Card>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-3">Variantes del DLBCL — por qué preguntar el subtipo</h3>
        <p className="text-sm text-stone-700 mb-3 leading-relaxed">
          No todos los DLBCL son iguales. Hay dos grandes grupos con diferente pronóstico:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border border-stone-200 rounded-lg p-4">
            <p className="text-sm font-medium text-stone-900 mb-1">GCB (germinal center)</p>
            <p className="text-xs text-stone-600">Mejor pronóstico con R-CHOP. CD10+, BCL6+, MUM1−.</p>
          </div>
          <div className="border border-stone-200 rounded-lg p-4">
            <p className="text-sm font-medium text-stone-900 mb-1">Non-GCB / ABC</p>
            <p className="text-xs text-stone-600">Peor pronóstico con R-CHOP. A veces se añaden otras drogas (lenalidomida, ibrutinib en estudio).</p>
          </div>
        </div>
        <p className="text-sm text-stone-700 mt-3 leading-relaxed">
          Un caso especial, muy raro pero importante: los llamados <span className="font-medium">"doble hit"</span> (con alteraciones de MYC y BCL2) son más agresivos y a veces requieren regímenes más fuertes (R-EPOCH). Pero estos regímenes más fuertes
          usualmente no se pueden dar a los 78 años en UCI. Conocerlo igual es clave para saber qué esperar.
        </p>
      </Card>
    </div>
  );

  const renderBodyMap = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="Este es el mapa visual de dónde está la enfermedad, según el PET-CT del 7 de abril. Los colores indican qué tan activo está el tumor en cada zona (el SUVmax — entre más alto, más activo).">
        Mapa corporal de la enfermedad
      </SectionTitle>

      <Card>
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 680 680" className="w-full h-auto" style={{ maxWidth: '100%' }}>
            <text x="340" y="28" textAnchor="middle" fontSize="14" fontWeight="500" fill="#292524">Dónde está la enfermedad (PET-CT 7 abril 2026)</text>
            <text x="340" y="46" textAnchor="middle" fontSize="11" fill="#78716c">Color = intensidad tumoral. Rojo = muy activo · ámbar = activo · gris = sano</text>

            <g transform="translate(160,75)">
              <ellipse cx="80" cy="35" rx="34" ry="40" fill="#e7e5e4" stroke="#78716c" strokeWidth="0.5" />
              <rect x="68" y="72" width="24" height="22" fill="#e7e5e4" stroke="#78716c" strokeWidth="0.5" />
              <path d="M30 94 L130 94 L145 210 L130 330 L120 440 L95 440 L82 330 L78 330 L65 440 L40 440 L25 330 L15 210 Z" fill="#f5f5f4" stroke="#78716c" strokeWidth="0.5" />
              <path d="M30 94 L8 210 L12 320 L20 320 L32 210 Z" fill="#f5f5f4" stroke="#78716c" strokeWidth="0.5" />
              <path d="M130 94 L152 210 L148 320 L140 320 L128 210 Z" fill="#f5f5f4" stroke="#78716c" strokeWidth="0.5" />

              <ellipse cx="80" cy="82" rx="11" ry="5" fill="#f59e0b" opacity="0.7" />
              <ellipse cx="60" cy="90" rx="8" ry="4" fill="#f59e0b" opacity="0.7" />
              <ellipse cx="100" cy="90" rx="8" ry="4" fill="#f59e0b" opacity="0.7" />

              <rect x="48" y="110" width="64" height="60" rx="6" fill="#f59e0b" opacity="0.65" />
              <ellipse cx="40" cy="140" rx="12" ry="20" fill="#fb923c" opacity="0.5" />
              <ellipse cx="120" cy="140" rx="12" ry="20" fill="#fb923c" opacity="0.5" />
              <rect x="30" y="175" width="100" height="14" fill="#e11d48" opacity="0.4" />

              <ellipse cx="110" cy="215" rx="22" ry="18" fill="#e11d48" opacity="0.85" />
              <rect x="35" y="200" width="80" height="60" rx="8" fill="#e11d48" opacity="0.5" />

              <circle cx="50" cy="210" r="3" fill="#9f1239" />
              <circle cx="65" cy="225" r="3" fill="#9f1239" />
              <circle cx="80" cy="245" r="3" fill="#9f1239" />
              <circle cx="95" cy="255" r="3" fill="#9f1239" />

              <rect x="30" y="265" width="100" height="55" rx="6" fill="#f5f5f4" stroke="#78716c" strokeWidth="0.5" />

              <path d="M74 94 L74 330" stroke="#f59e0b" strokeWidth="4" opacity="0.55" />
              <path d="M86 94 L86 330" stroke="#f59e0b" strokeWidth="4" opacity="0.55" />
              <circle cx="74" cy="110" r="3" fill="#78350f" />
              <circle cx="74" cy="140" r="3" fill="#78350f" />
              <circle cx="74" cy="170" r="3" fill="#78350f" />
              <circle cx="74" cy="200" r="3" fill="#78350f" />
              <circle cx="74" cy="230" r="3" fill="#78350f" />
              <circle cx="74" cy="260" r="3" fill="#78350f" />
              <circle cx="74" cy="290" r="3" fill="#78350f" />
              <circle cx="34" cy="105" r="3" fill="#78350f" />
              <circle cx="124" cy="105" r="3" fill="#78350f" />
              <circle cx="40" cy="160" r="4" fill="#78350f" />
              <circle cx="115" cy="155" r="3" fill="#78350f" />
              <circle cx="75" cy="130" r="3" fill="#78350f" />
              <circle cx="22" cy="190" r="2.5" fill="#78350f" />
              <circle cx="28" cy="220" r="2.5" fill="#78350f" />
              <circle cx="128" cy="195" r="2.5" fill="#78350f" />
              <circle cx="132" cy="220" r="2.5" fill="#78350f" />
              <circle cx="55" cy="355" r="4" fill="#78350f" />
              <circle cx="105" cy="355" r="4" fill="#78350f" />
              <circle cx="55" cy="400" r="3" fill="#78350f" />
              <circle cx="105" cy="400" r="3" fill="#78350f" />

              <ellipse cx="80" cy="35" rx="25" ry="30" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="2 2" />
            </g>

            <line x1="200" y1="115" x2="40" y2="115" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="40" y="110" fontSize="11" fill="#44403c">Cerebro: sin compromiso</text>
            <text x="40" y="124" fontSize="11" fill="#059669">TAC cráneo normal</text>

            <line x1="230" y1="155" x2="40" y2="170" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="40" y="166" fontSize="11" fill="#44403c">Ganglios cuello</text>
            <text x="40" y="180" fontSize="11" fill="#92400e">SUVmax 10.3 · 11×18 mm</text>

            <line x1="205" y1="215" x2="40" y2="225" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="40" y="221" fontSize="11" fill="#44403c">Mediastino (pecho)</text>
            <text x="40" y="235" fontSize="11" fill="#92400e">SUVmax 11.9 · 21 mm</text>

            <line x1="210" y1="250" x2="40" y2="265" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="40" y="261" fontSize="11" fill="#44403c">Pulmones (nódulos)</text>
            <text x="40" y="275" fontSize="11" fill="#92400e">SUVmax 14.6 · hasta 22 mm</text>

            <line x1="180" y1="285" x2="40" y2="310" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="40" y="306" fontSize="11" fill="#44403c">Derrame pleural izquierdo</text>
            <text x="40" y="320" fontSize="11" fill="#9f1239">Tubo de tórax colocado</text>

            <line x1="480" y1="295" x2="520" y2="225" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="520" y="221" fontSize="11" fill="#44403c">Bazo (lesión 42×46 mm)</text>
            <text x="520" y="235" fontSize="11" fill="#9f1239">SUVmax 25.6 · muy alto</text>

            <line x1="470" y1="335" x2="520" y2="265" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="520" y="261" fontSize="11" fill="#44403c">Ganglios abdominales</text>
            <text x="520" y="275" fontSize="11" fill="#9f1239">SUVmax 26.7 · el más intenso</text>

            <line x1="460" y1="380" x2="520" y2="305" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="520" y="301" fontSize="11" fill="#44403c">Hígado</text>
            <text x="520" y="315" fontSize="11" fill="#059669">Sin compromiso</text>

            <line x1="480" y1="420" x2="520" y2="345" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="520" y="341" fontSize="11" fill="#44403c">Mesenterio</text>
            <text x="520" y="355" fontSize="11" fill="#92400e">SUVmax 13.7</text>

            <line x1="260" y1="465" x2="520" y2="395" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="520" y="391" fontSize="11" fill="#44403c">Huesos (difuso)</text>
            <text x="520" y="405" fontSize="11" fill="#92400e">Columna, pelvis, fémur</text>
            <text x="520" y="419" fontSize="11" fill="#9f1239">Fractura costilla 11</text>

            <g transform="translate(40,545)">
              <rect x="0" y="0" width="600" height="115" rx="8" fill="#f5f5f4" stroke="#a8a29e" strokeWidth="0.5" />
              <text x="16" y="22" fontSize="14" fontWeight="500" fill="#292524">Leyenda</text>
              <rect x="16" y="36" width="18" height="14" fill="#e11d48" opacity="0.85" />
              <text x="42" y="47" fontSize="11" fill="#44403c">Tumor muy activo (SUVmax &gt;15) — bazo, ganglios abdominales</text>
              <rect x="16" y="56" width="18" height="14" fill="#f59e0b" opacity="0.7" />
              <text x="42" y="67" fontSize="11" fill="#44403c">Tumor activo (SUVmax 5-15) — cuello, mediastino, pulmones, huesos</text>
              <rect x="16" y="76" width="18" height="14" fill="#e7e5e4" />
              <text x="42" y="87" fontSize="11" fill="#44403c">Sin actividad tumoral — cerebro, hígado, riñones, colon</text>
              <text x="16" y="105" fontSize="11" fill="#78716c">Los puntos marrones en columna y pelvis = múltiples lesiones óseas líticas</text>
            </g>
          </svg>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card tone="warn">
          <h3 className="text-base font-medium text-amber-950 mb-2">Qué implica estar en estadio IV</h3>
          <p className="text-sm text-amber-900 leading-relaxed">
            Estadio IV significa que el linfoma cruzó el diafragma y llegó a órganos (bazo, huesos, pulmones). <span className="font-medium">Pero ojo:</span> en linfoma, el estadio IV no es comparable al estadio IV de cáncer de mama o pulmón.
            En linfoma se logran remisiones completas incluso desde estadio IV con tratamiento estándar.
          </p>
        </Card>

        <Card tone="safe">
          <h3 className="text-base font-medium text-emerald-950 mb-2">Qué está libre</h3>
          <p className="text-sm text-emerald-900 leading-relaxed">
            El cerebro está limpio. El hígado no tiene lesiones tumorales (aunque está bajo estrés, ver labs). Los riñones están bien. El colon no tiene invasión. Esto permite
            que el tratamiento tenga una base más firme.
          </p>
        </Card>
      </div>
    </div>
  );

  const renderLabs = () => {
    // Datos de evolución de laboratorios por fecha
    const labSeries = [
      {
        name: 'LDH',
        unit: 'U/L',
        normalMax: 225,
        normalMin: 135,
        severity: 'critical',
        meaning: 'Termómetro de actividad tumoral. Su bajada indica respuesta al tratamiento.',
        data: [
          { date: '6 abr', value: 2100 },
          { date: '7 abr', value: 2010 },
        ],
      },
      {
        name: 'Plaquetas',
        unit: 'mil/µL',
        normalMax: 450,
        normalMin: 150,
        severity: 'warn',
        meaning: 'Evita sangrados. Si cae por debajo de 50, se restringen procedimientos.',
        data: [
          { date: '6 abr', value: 258 },
          { date: '7 abr', value: 171 },
          { date: '8 abr', value: 140 },
          { date: '10 abr', value: 136 },
        ],
      },
      {
        name: 'Hemoglobina',
        unit: 'g/dL',
        normalMax: 15.3,
        normalMin: 12.3,
        severity: 'warn',
        meaning: 'Transporta oxígeno. Si cae a <8, usualmente se transfunde.',
        data: [
          { date: '6 abr', value: 14.6 },
          { date: '7 abr', value: 13.1 },
          { date: '8 abr', value: 12.3 },
          { date: '10 abr', value: 12.0 },
        ],
      },
      {
        name: 'Albúmina',
        unit: 'g/dL',
        normalMax: 5.2,
        normalMin: 3.5,
        severity: 'critical',
        meaning: 'Marcador de nutrición y síntesis hepática. <3 es desnutrición. <2.5 es severa.',
        data: [
          { date: '6 abr', value: 3.6 },
          { date: '7 abr', value: 2.9 },
          { date: '10 abr', value: 2.5 },
        ],
      },
      {
        name: 'Ácido úrico',
        unit: 'mg/dL',
        normalMax: 7.0,
        normalMin: 3.4,
        severity: 'warn',
        meaning: 'Sube al romperse células tumorales. Predice riesgo de lisis tumoral.',
        data: [
          { date: '6 abr', value: 6.56 },
          { date: '7 abr', value: 7.00 },
          { date: '10 abr', value: 7.61 },
        ],
      },
      {
        name: 'AST (hígado)',
        unit: 'U/L',
        normalMax: 40,
        normalMin: 5,
        severity: 'warn',
        meaning: 'Mide estrés hepático. Si sube mucho podrían ajustar dosis de quimio.',
        data: [
          { date: '6 abr', value: 32.2 },
          { date: '10 abr', value: 86.4 },
        ],
      },
      {
        name: 'Creatinina',
        unit: 'mg/dL',
        normalMax: 1.17,
        normalMin: 0.67,
        severity: 'safe',
        meaning: 'Función renal. Estable es buena noticia — permite dar ciclofosfamida a dosis plena.',
        data: [
          { date: '6 abr', value: 0.89 },
          { date: '7 abr', value: 0.95 },
          { date: '10 abr', value: 1.02 },
        ],
      },
      {
        name: 'PCR',
        unit: 'mg/L',
        normalMax: 5,
        normalMin: 0,
        severity: 'critical',
        meaning: 'Inflamación sistémica. Muy alta por la enfermedad + posible infección.',
        data: [
          { date: '6 abr', value: 150 },
        ],
      },
    ];

    return (
      <div className="space-y-6">
        <SectionTitle subtitle="Gráficas de evolución de cada laboratorio clave. Muéstrenselas a los médicos — tener esto visual en reuniones hace que las decisiones sean más claras.">
          Laboratorios — evolución visual
        </SectionTitle>

        <Card tone="info">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-700 flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-sky-950 mb-1">Cómo leer estas gráficas</p>
              <p className="text-sm text-sky-900 leading-relaxed">
                La zona verde sombreada es el rango normal. La línea es la evolución de Roro. Si sube o baja fuera de la zona verde, hay que ver la tendencia (¿mejora, empeora, se estabiliza?).
                Cuando lleguen nuevos laboratorios, pueden agregarlos para mantener el histórico vivo.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          {labSeries.map(s => (
            <LabChart key={s.name} series={s} />
          ))}
        </div>

        <Card tone="warn">
          <h3 className="text-base font-medium text-amber-950 mb-3">Lectura conjunta — qué nos están diciendo</h3>
          <ul className="text-sm text-amber-900 space-y-2 leading-relaxed">
            <li>• <span className="font-medium">Carga tumoral muy alta:</span> LDH de 2010 (9x normal) + PCR de 150 (30x). Esto predice alto riesgo de síndrome de lisis tumoral cuando empiece la quimio. Por eso es CRÍTICA la pre-fase con prednisona y alopurinol.</li>
            <li>• <span className="font-medium">Desnutrición progresando:</span> albúmina bajó de 3.6 a 2.5 en 4 días. Esto se arregla con soporte nutricional agresivo YA. El recetario de la app está pensado para esto.</li>
            <li>• <span className="font-medium">Anemia y plaquetopenia leves pero descendiendo:</span> probablemente por infiltración medular del linfoma. Con la quimio van a caer más — posiblemente necesite transfusiones en los ciclos.</li>
            <li>• <span className="font-medium">Riñones estables:</span> permite dar ciclofosfamida a dosis plena. Pero con lisis tumoral pueden dañarse rápido. Vigilancia estrecha.</li>
            <li>• <span className="font-medium">Hígado bajo estrés:</span> AST subió 2.7x en 4 días. Si sigue subiendo, pueden necesitar ajustar dosis de vincristina (que se elimina por hígado).</li>
          </ul>
        </Card>

        <Card tone="info">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-sky-700 flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-sky-950 mb-1">Para compartir con la familia por WhatsApp</p>
              <p className="text-sm text-sky-900 leading-relaxed">
                En la sección <span className="font-medium">Exportar a WhatsApp</span> pueden generar un resumen con los valores actuales y tendencias, en texto plano listo para copiar y pegar en el broadcast familiar.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderTreatment = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="El tratamiento estándar y cómo probablemente se va a adaptar por su edad y condición.">
        El plan de tratamiento
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-serif text-stone-900 mb-3">R-CHOP — el régimen estándar</h3>
        <p className="text-sm text-stone-700 mb-4 leading-relaxed">
          Es una combinación de 5 medicamentos que se dan el mismo día, en un "ciclo". Se repite cada 21 días. El plan completo son 6 ciclos (aprox. 4-5 meses total).
        </p>
        <div className="space-y-3">
          <DrugRow letter="R" name="Rituximab" role="Anticuerpo monoclonal. Se pega al marcador CD20 de los linfocitos B malos y los marca para ser destruidos." admin="Infusión IV, 3-6 horas. Primera vez es lenta por riesgo de reacción." />
          <DrugRow letter="C" name="Ciclofosfamida" role="Quimioterapia clásica que daña el ADN de células que se dividen rápido." admin="IV, 1 hora. Requiere hidratación para proteger vejiga." />
          <DrugRow letter="H" name="Doxorrubicina (hidroxidaunorubicina)" role="'La roja'. Quimio antraciclina, muy efectiva. Pero cardiotóxica — por eso necesita ecocardiograma antes." admin="IV en bolo, 10-15 min. Requiere monitoreo cardíaco." />
          <DrugRow letter="O" name="Vincristina (Oncovin)" role="Quimio alcaloide. Detiene la división celular. Puede dar neuropatía (hormigueo, debilidad en manos/pies)." admin="IV en bolo, unos minutos." />
          <DrugRow letter="P" name="Prednisona" role="Esteroide. Potente anti-linfoma por sí solo, además reduce inflamación." admin="Vía oral, días 1 a 5 de cada ciclo. Sube la azúcar, el ánimo, puede dar insomnio." />
        </div>
      </Card>

      <Card tone="info">
        <h3 className="text-base font-medium text-sky-950 mb-2">Por qué probablemente reciba R-mini-CHOP (dosis reducidas)</h3>
        <p className="text-sm text-sky-900 leading-relaxed mb-3">
          A los 78 años, en UCI, con desnutrición y múltiples órganos comprometidos, la dosis estándar de R-CHOP tendría mucho riesgo. R-mini-CHOP usa
          aproximadamente 50% de la dosis de ciclofosfamida y doxorrubicina, con la misma rituximab y prednisona.
        </p>
        <p className="text-sm text-sky-900 leading-relaxed">
          Estudios muestran que R-mini-CHOP en mayores de 80 logra remisión completa en ~60% y supervivencia a 2 años de ~60-65%, con mucha menos toxicidad.
        </p>
      </Card>

      <Card tone="warn">
        <h3 className="text-base font-medium text-amber-950 mb-2">La "pre-fase" de prednisona — por qué es crucial</h3>
        <p className="text-sm text-amber-900 leading-relaxed mb-3">
          Cuando la LDH está altísima como la de Roro (&gt;2000), si uno da R-CHOP completo de una vez, las células tumorales se mueren todas al tiempo. Eso suelta una cantidad masiva de potasio, fósforo y ácido úrico a la sangre — y el riñón colapsa.
          Es el <span className="font-medium">síndrome de lisis tumoral</span>, y puede ser mortal.
        </p>
        <p className="text-sm text-amber-900 leading-relaxed">
          La solución es empezar 5-7 días antes con solo <span className="font-medium">prednisona 60-100 mg al día</span> + mucha hidratación + alopurinol (o rasburicasa en casos muy altos).
          Esto empieza a bajar la carga tumoral suavemente, de manera que cuando entra el resto del R-CHOP, el cuerpo tolera mejor.
          Pregunten específicamente si van a hacer pre-fase.
        </p>
      </Card>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-3">Línea de tiempo probable</h3>
        <div className="space-y-3">
          <TimelineStep num="1" title="Ahora — UCI, estabilización" detail="Manejo del tubo de tórax, nutrición, dolor, control de infección si hay, labs completos, ecocardiograma, hepatitis B/C." days="Días 1-4" />
          <TimelineStep num="2" title="Traslado a oncología" detail="Probablemente mañana o pasado mañana. Entorno más tranquilo. Equipo multidisciplinar (oncólogo, geriatra, paliativo, nutrición)." days="Día 4-5" />
          <TimelineStep num="3" title="Pre-fase de prednisona + alopurinol" detail="5-7 días solo con esteroide + protección de riñón. Labs cada 8-12 horas para vigilar lisis tumoral." days="Días 5-12" />
          <TimelineStep num="4" title="Ciclo 1 de R-CHOP (o R-mini-CHOP)" detail="Se da en 1-2 días. Monitoreo estrecho. Hidratación masiva. Alopurinol o rasburicasa continúan." days="Día 13-14" />
          <TimelineStep num="5" title="Nadir (el 'valle') de los glóbulos" detail="Día 7-14 post-quimio. Defensas más bajas. Riesgo de infección. Puede necesitar transfusiones o G-CSF." days="Días 20-28" />
          <TimelineStep num="6" title="Recuperación" detail="Los glóbulos suben de nuevo, tolera más comida, se mueve más." days="Días 29-35" />
          <TimelineStep num="7" title="Ciclo 2 de R-CHOP" detail="Se repite cada 21 días si todo OK." days="Día 35 (ciclo 2 día 1)" />
          <TimelineStep num="8" title="PET intermedio" detail="Usualmente después del ciclo 2 o 4. Si el PET mejoró mucho (respuesta completa metabólica), el pronóstico es mucho mejor." days="~Día 80-100" />
          <TimelineStep num="9" title="Completar 6 ciclos" detail="Si hay buena respuesta. PET final para evaluar remisión." days="~Mes 5-6" last />
        </div>
      </Card>
    </div>
  );

  const renderRisks = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="Esta sección es honesta. Presenta tres escenarios posibles, sin falsa esperanza pero sin condenar. Lean esto en familia. Son probabilidades estimadas, no predicciones exactas.">
        Escenarios reales — lo que realmente puede pasar
      </SectionTitle>

      <Card tone="critical">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-700 flex-none mt-0.5" />
          <div>
            <h3 className="text-base font-medium text-rose-950 mb-1">Aclaración importante</h3>
            <p className="text-sm text-rose-900 leading-relaxed">
              Estas probabilidades vienen de estudios en pacientes similares (DLBCL, &gt;75 años, IPI alto). No son predicciones para Roro específicamente — cada persona responde diferente.
              Pero son útiles como referencia para conversar con el equipo médico y tomar decisiones informadas.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <ScenarioCard
          tone="safe"
          pct="≈ 30-40%"
          title="Escenario A — Respuesta favorable"
          sub="Lo que esperamos que pase"
          desc="Roro tolera la pre-fase, recibe ciclo 1 de R-CHOP con manejo de lisis tumoral exitoso. PET intermedio muestra respuesta metabólica marcada. Completa 6 ciclos con dosis ajustadas. Alcanza remisión completa."
          signs="• Bajada clara de LDH en días 3-7 de pre-fase\n• Ganglios palpables disminuyen\n• Respiración mejora, puede salir de UCI\n• Sin complicaciones graves en ciclo 1\n• PET intermedio (ciclo 2-4) con Deauville 1-3"
          outcome="Supervivencia a 2 años: 55-65%. Calidad de vida significativa. Posibilidad real de años adicionales con familia."
        />

        <ScenarioCard
          tone="warn"
          pct="≈ 30-40%"
          title="Escenario B — Respuesta parcial o complicada"
          sub="Posible y manejable"
          desc="Responde a la pre-fase pero con complicaciones: infección, lisis tumoral moderada, neutropenia febril, o progresión más lenta. Requiere ajuste de dosis, más hospitalizaciones, períodos más largos en UCI. Logra controlar la enfermedad pero sin remisión completa."
          signs="• LDH baja pero no a normal\n• PET intermedio con respuesta parcial (Deauville 4)\n• Una o más hospitalizaciones por infección\n• Reducción de dosis en ciclos posteriores\n• Posible cambio a régimen paliativo a mitad de camino"
          outcome="Supervivencia a 2 años: 20-35%. Meses a pocos años de enfermedad controlada pero activa. Requiere cuidados cada vez más frecuentes."
        />

        <ScenarioCard
          tone="critical"
          pct="≈ 25-35%"
          title="Escenario C — Tolerancia insuficiente"
          sub="La realidad dura que debemos considerar"
          desc="La pre-fase o el primer ciclo desencadena complicaciones que el cuerpo no tolera: lisis tumoral severa, sepsis, falla respiratoria, falla cardíaca. El equipo puede suspender quimio y cambiar a cuidado de confort. La enfermedad progresa."
          signs="• Deterioro respiratorio rápido\n• Falla orgánica múltiple\n• Imposibilidad de salir de UCI\n• Infección no controlable\n• Decisión familiar y médica de parar quimio por falta de beneficio"
          outcome="Tiempo de vida: semanas a pocos meses. Foco en confort, despedida, bienestar. Es un escenario trágico pero no es un 'fracaso' — el cuerpo dijo hasta dónde pudo."
        />
      </div>

      <Card tone="info">
        <h3 className="text-base font-medium text-sky-950 mb-3">Factores que inclinan hacia el mejor escenario</h3>
        <ul className="text-sm text-sky-900 space-y-2">
          <li>• <span className="font-medium">Estado funcional previo:</span> si Roro caminaba, comía y se bañaba solo hasta hace poco, pronóstico mejora.</li>
          <li>• <span className="font-medium">Respuesta temprana a pre-fase:</span> si la LDH baja &gt;50% en 5-7 días con prednisona, buen signo.</li>
          <li>• <span className="font-medium">Subtipo GCB (germinal center):</span> mejor pronóstico que non-GCB.</li>
          <li>• <span className="font-medium">Sin "doble hit":</span> si no hay MYC+BCL2, pronóstico mejor.</li>
          <li>• <span className="font-medium">FEVI &gt;55%:</span> permite dosis completa de doxorrubicina.</li>
          <li>• <span className="font-medium">Cuidado intensivo de soporte:</span> nutrición, control de dolor, prevención de delirium, movilización temprana. ESTO LO HACE LA FAMILIA.</li>
        </ul>
      </Card>

      <Card tone="warn">
        <h3 className="text-base font-medium text-amber-950 mb-3">Riesgos específicos de los próximos días</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-amber-950 mb-1">Síndrome de lisis tumoral</p>
            <p className="text-xs text-amber-800">Riesgo alto por LDH &gt;2000 y enfermedad voluminosa. Prevenible con alopurinol/rasburicasa + hidratación masiva + vigilancia de K, P, Ca, ácido úrico cada 6-8 horas primeras 72 hs.</p>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-950 mb-1">Neutropenia febril</p>
            <p className="text-xs text-amber-800">Día 7-14 post-ciclo 1. Cualquier fiebre &gt;38°C = emergencia, antibióticos en &lt;1 hora. El G-CSF (filgrastim) reduce riesgo.</p>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-950 mb-1">Infecciones secundarias</p>
            <p className="text-xs text-amber-800">Por inmunosupresión. Especialmente Pneumocystis (requiere trimetoprim-sulfa profiláctico), hongos y reactivación viral.</p>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-950 mb-1">Reactivación de hepatitis B</p>
            <p className="text-xs text-amber-800">Rituximab puede despertar hepatitis B dormida. Por eso es crítico hacer HBsAg y anti-HBc ANTES del rituximab.</p>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-950 mb-1">Cardiotoxicidad</p>
            <p className="text-xs text-amber-800">Por doxorrubicina. FEVI tiene que ser ≥50%. Si ya tiene disfunción, usar R-CEOP (sin doxo).</p>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-950 mb-1">Delirium</p>
            <p className="text-xs text-amber-800">Muy común en mayores en UCI. Prevenir con orientación, sueño regular, mínimas benzodiazepinas, presencia familiar.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-3">Cuándo alertar al equipo URGENTE</h3>
        <ul className="text-sm text-stone-700 space-y-2">
          <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5"/>Fiebre &gt;38°C (especialmente después de quimio)</li>
          <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5"/>Confusión nueva, no reconoce familiares, agitación</li>
          <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5"/>Dificultad respiratoria que empeora</li>
          <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5"/>Dolor en pecho nuevo, palpitaciones</li>
          <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5"/>Sangrado de cualquier lugar, hematomas nuevos</li>
          <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5"/>Caída de orina por hora, orina muy oscura</li>
          <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5"/>Úlceras orales que sangran o impiden tragar</li>
          <li className="flex gap-2"><AlertCircle className="w-4 h-4 text-rose-600 flex-none mt-0.5"/>Dolor severo que no cede con la medicación pautada</li>
        </ul>
      </Card>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="Estas preguntas están organizadas por tema. Haz clic en cada una para escribir la respuesta que te dé el médico. Todo se guarda automáticamente.">
        Preguntas para el equipo médico
      </SectionTitle>

      <Card tone="info">
        <p className="text-sm text-sky-900 leading-relaxed">
          <span className="font-medium">Sugerencia:</span> impriman o lleven abierta esta sección en la próxima reunión con oncología. Muchas preguntas tienen una sola respuesta de 5 palabras.
          Cuando tengan la respuesta, escríbanla aquí y quedará en el registro. En la sección "Exportar" pueden generar un resumen completo para compartir.
        </p>
      </Card>

      {saveStatus && (
        <div className="fixed bottom-4 right-4 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50">
          {saveStatus}
        </div>
      )}

      {questionGroups.map(group => {
        const total = group.questions.length;
        const answered = group.questions.filter(q => answers[q.id] && answers[q.id].text).length;
        return (
          <Card key={group.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-stone-900">{group.title}</h3>
              <Pill tone={answered === total ? 'safe' : answered > 0 ? 'warn' : 'default'}>
                {answered} / {total} respondidas
              </Pill>
            </div>
            <div className="space-y-2">
              {group.questions.map(q => {
                const isOpen = openQuestion === q.id;
                const hasAnswer = answers[q.id] && answers[q.id].text;
                return (
                  <div key={q.id} className="border border-stone-200 rounded-lg overflow-hidden">
                    <div
                      onClick={() => setOpenQuestion(isOpen ? null : q.id)}
                      className="flex items-start gap-3 p-3 cursor-pointer hover:bg-stone-50"
                    >
                      <div className="flex-none mt-1">
                        {hasAnswer ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-stone-300" />
                        )}
                      </div>
                      <p className="flex-1 text-sm text-stone-800">{q.text}</p>
                      <ChevronDown className={`w-4 h-4 text-stone-400 flex-none mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isOpen && (
                      <div className="p-3 pt-0 border-t border-stone-100 bg-stone-50/50">
                        <textarea
                          className="w-full mt-3 p-3 text-sm border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                          style={{ minHeight: '6rem' }}
                          placeholder="Escribe aquí la respuesta del médico…"
                          defaultValue={answers[q.id]?.text || ''}
                          onBlur={(e) => saveAnswer(q.id, e.target.value)}
                        />
                        {hasAnswer && (
                          <p className="text-xs text-stone-500 mt-2">
                            Guardado el {new Date(answers[q.id].date).toLocaleString('es-CO')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderCare = () => {
    const today = new Date().toISOString().slice(0, 10);
    const categories = {
      piel: { label: 'Cuidado de piel', icon: Shield },
      boca: { label: 'Cuidado de boca', icon: Droplets },
      mente: { label: 'Prevención de delirium', icon: Brain },
      dolor: { label: 'Manejo del dolor', icon: Thermometer },
      nutricion: { label: 'Nutrición / hidratación', icon: Soup },
      presencia: { label: 'Presencia afectuosa', icon: HandHeart },
    };
    return (
      <div className="space-y-6">
        <SectionTitle subtitle="Checklist del día de hoy. Marca las cosas que ya se hicieron — se reinicia cada día automáticamente.">
          Cuidados diarios en UCI
        </SectionTitle>

        <Card tone="info">
          <p className="text-sm text-sky-900 leading-relaxed">
            Cada uno de estos cuidados está basado en evidencia clínica. Hacen una diferencia real en cómo se recupera y en si desarrolla complicaciones.
            Si la enfermera o auxiliar ya los hace, pueden preguntarles con tranquilidad cómo los están haciendo — no es cuestionarlos, es acompañar.
          </p>
        </Card>

        {Object.entries(categories).map(([catId, catData]) => {
          const items = checklistItems.filter(i => i.category === catId);
          const Icon = catData.icon;
          return (
            <Card key={catId}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-stone-600" />
                <h3 className="text-base font-medium text-stone-900">{catData.label}</h3>
              </div>
              <div className="space-y-2">
                {items.map(item => {
                  const key = `${today}_${item.id}`;
                  const done = checklist[key];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${done ? 'bg-emerald-50' : 'hover:bg-stone-50'}`}
                    >
                      <div className="flex-none mt-0.5">
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-stone-300" />
                        )}
                      </div>
                      <p className={`text-sm ${done ? 'text-emerald-900 line-through' : 'text-stone-800'}`}>{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        <Card tone="warn">
          <h3 className="text-base font-medium text-amber-950 mb-2">Recordatorio importante</h3>
          <p className="text-sm text-amber-900 leading-relaxed">
            El cuidado diario de la piel, boca y la presencia afectuosa son tan importantes como la quimio. Pacientes mayores en UCI que reciben este tipo de cuidado integral
            tienen menos delirium, menos infecciones, y mejor recuperación. <span className="font-medium">Túrnense en familia</span> para que alguien siempre esté presente en horarios clave (visita médica, comidas, tarde).
          </p>
        </Card>
      </div>
    );
  };

  const renderNutrition = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="Recetario de soporte casero basado en evidencia clínica, pensado para las distintas fases: pre-quimio, durante quimio, y en neutropenia. Todo debe validarse con la nutricionista.">
        Recetario de soporte nutricional
      </SectionTitle>

      <Card tone="info">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-700 flex-none mt-0.5" />
          <div>
            <p className="text-sm text-sky-900 leading-relaxed">
              <span className="font-medium">Importante:</span> todas estas ideas se deben <span className="font-medium">validar con la nutricionista del hospital</span> antes de dárselas a Roro. Algunas pueden estar contraindicadas por su condición (neutropenia futura, diabetes, falla renal si aparece).
              Llevar esta lista a la nutricionista les servirá para negociar un plan más completo que el menú estándar del hospital.
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-lg font-serif text-stone-900 mb-3">Enjuagues bucales — lo primero y más importante</h3>
        <p className="text-sm text-stone-600 mb-4 leading-relaxed">
          La boca es puerta de infección. Empezar CUIDADO ORAL INTENSIVO desde antes de quimio reduce a la mitad la severidad de la mucositis (inflamación/úlceras en la boca que aparece día 7-14 post-quimio).
        </p>
        <div className="space-y-4">
          {mouthRinseRecipes.map(r => (
            <div key={r.id} className="border border-stone-200 rounded-xl p-5 bg-white">
              <div className="flex items-start gap-3 mb-3">
                <Droplets className="w-5 h-5 text-sky-600 flex-none mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-base font-medium text-stone-900">{r.name}</h4>
                  <p className="text-xs text-stone-500 italic mt-1">{r.evidence}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">Cuándo</p>
                  <p className="text-sm text-stone-700 mb-3">{r.when}</p>
                  <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">Ingredientes</p>
                  <ul className="text-sm text-stone-700 space-y-1">
                    {r.ingredients.map((i, idx) => <li key={idx}>• {i}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">Preparación</p>
                  <p className="text-sm text-stone-700 mb-3">{r.method}</p>
                  <p className="text-xs uppercase tracking-wide text-amber-700 mb-1 font-medium">Precaución</p>
                  <p className="text-sm text-amber-800">{r.caution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card tone="warn">
        <h3 className="text-base font-medium text-amber-950 mb-2">Evitar en boca</h3>
        <ul className="text-sm text-amber-900 space-y-1">
          {avoidInMouth.map((item, i) => (
            <li key={i}>✗ {item}</li>
          ))}
        </ul>
      </Card>

      <div>
        <h3 className="text-lg font-serif text-stone-900 mb-3 mt-4">Alimentos terapéuticos para llevar al hospital</h3>
        <p className="text-sm text-stone-600 mb-4 leading-relaxed">
          Roro tiene albúmina 2.5 (desnutrición severa) y lleva días comiendo poco. La comida hospitalaria estándar no alcanza para sus necesidades.
          Estas recetas densas en calorías y proteína se pueden llevar <span className="font-medium">con autorización previa</span> del equipo tratante — suelen permitirlo si están bien preparadas.
        </p>
        <div className="space-y-4">
          {foodRecipes.map(r => (
            <div key={r.id} className="border border-stone-200 rounded-xl p-5 bg-white">
              <div className="flex items-start gap-3 mb-3">
                <Utensils className="w-5 h-5 text-orange-600 flex-none mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-base font-medium text-stone-900">{r.name}</h4>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <Pill tone="info">{r.phase}</Pill>
                    <Pill tone="default">{r.nutrition}</Pill>
                  </div>
                </div>
              </div>
              <p className="text-sm text-stone-700 mb-3 leading-relaxed italic">{r.why}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">Ingredientes</p>
                  <ul className="text-sm text-stone-700 space-y-1">
                    {r.ingredients.map((i, idx) => <li key={idx}>• {i}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">Preparación</p>
                  <p className="text-sm text-stone-700 leading-relaxed">{r.method}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card tone="critical">
        <h3 className="text-base font-medium text-rose-950 mb-3">Reglas en neutropenia (días 7-14 post-quimio)</h3>
        <p className="text-sm text-rose-900 mb-4 leading-relaxed">
          Cuando las defensas caen después de cada ciclo de quimio, cualquier microorganismo del ambiente o de la comida puede causar infección grave. Durante estos días,
          la comida tiene que ser estrictamente controlada.
        </p>
        <div className="space-y-3">
          {neutropeniaRules.map((n, i) => (
            <div key={i} className="bg-white/70 rounded-lg p-3">
              <p className="text-sm font-medium text-rose-900 mb-2">{n.rule}</p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="inline-block bg-emerald-100 text-emerald-900 rounded px-1.5 py-0.5 text-xs font-medium mr-2">OK</span>
                  <span className="text-stone-700">{n.ok}</span>
                </div>
                <div>
                  <span className="inline-block bg-rose-100 text-rose-900 rounded px-1.5 py-0.5 text-xs font-medium mr-2">EVITAR</span>
                  <span className="text-stone-700">{n.avoid}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h3 className="text-lg font-serif text-stone-900 mb-3">Ideas para hidratación</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {hydrationIdeas.map((h, i) => (
            <div key={i} className="border border-stone-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-1">
                <Coffee className="w-4 h-4 text-sky-600" />
                <p className="text-sm font-medium text-stone-900">{h.name}</p>
              </div>
              <p className="text-xs text-stone-600 mb-1">{h.why}</p>
              <p className="text-xs text-amber-700"><span className="font-medium">Ojo:</span> {h.caution}</p>
            </div>
          ))}
        </div>
      </div>

      <Card tone="info">
        <h3 className="text-base font-medium text-sky-950 mb-3">Cómo presentar esto a la nutricionista</h3>
        <p className="text-sm text-sky-900 leading-relaxed mb-3">
          Cuando hablen con la nutricionista del hospital, no es cuestión de pedir permiso para cada receta — es cuestión de plantear el plan así:
        </p>
        <ol className="text-sm text-sky-900 space-y-2 list-decimal list-inside">
          <li>"Roro lleva varios días sin comer bien, albúmina en 2.5. Queremos ser activos en soporte nutricional casero, traído de casa."</li>
          <li>"Estos son los alimentos que podemos preparar con controles de higiene." (mostrar la lista)</li>
          <li>"¿Hay restricciones actuales por función renal, glucosa, sodio que debamos tener en cuenta?"</li>
          <li>"¿Es factible iniciar suplemento proteico oral (tipo Ensure, Glucerna) entre comidas?"</li>
          <li>"¿Deberíamos considerar sonda nasoenteral si no alcanza la ingesta objetivo?"</li>
          <li>"¿Qué hacemos cuando entre en neutropenia post-quimio? ¿Restricciones específicas?"</li>
        </ol>
      </Card>
    </div>
  );

  const renderMedLog = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="Registro de todos los medicamentos que va recibiendo. Útil para llevar a reuniones, detectar efectos adversos, evitar duplicaciones.">
        Log de medicamentos
      </SectionTitle>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-3">Agregar medicamento</h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input
            type="date"
            value={newMed.date}
            onChange={(e) => setNewMed({ ...newMed, date: e.target.value })}
            className="p-2.5 text-sm border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <input
            type="text"
            placeholder="Nombre del medicamento"
            value={newMed.name}
            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            className="p-2.5 text-sm border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <input
            type="text"
            placeholder="Dosis (ej. 500 mg cada 8 hs IV)"
            value={newMed.dose}
            onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
            className="p-2.5 text-sm border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <input
            type="text"
            placeholder="Notas (efectos, reacción, observaciones)"
            value={newMed.notes}
            onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
            className="p-2.5 text-sm border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <button
          onClick={addMed}
          className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm px-4 py-2 rounded-md hover:bg-stone-800"
        >
          <Plus className="w-4 h-4" /> Agregar al registro
        </button>
      </Card>

      {medLog.length === 0 ? (
        <Card tone="muted">
          <p className="text-sm text-stone-600 text-center py-4">
            Sin medicamentos registrados todavía. Empezá agregando los que sepas que le han dado desde el ingreso (6 abril).
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {medLog.map(m => (
            <Card key={m.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill tone="info">{m.date}</Pill>
                    <h4 className="text-sm font-medium text-stone-900">{m.name}</h4>
                  </div>
                  {m.dose && <p className="text-sm text-stone-700">Dosis: {m.dose}</p>}
                  {m.notes && <p className="text-xs text-stone-600 mt-1 italic">{m.notes}</p>}
                </div>
                <button
                  onClick={() => deleteMed(m.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="Espacio para notas diarias de la familia: cómo amaneció, qué comió, qué le preocupó, qué dijo el médico, cualquier cosa relevante.">
        Diario de la familia
      </SectionTitle>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-3">Agregar nueva nota</h3>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribí lo que pasó hoy, cómo se veía, qué comió, qué preguntaron, cualquier cosa…"
          className="w-full p-3 text-sm border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          style={{ minHeight: '7rem' }}
        />
        <button
          onClick={appendNote}
          className="mt-3 inline-flex items-center gap-2 bg-stone-900 text-white text-sm px-4 py-2 rounded-md hover:bg-stone-800"
        >
          <Save className="w-4 h-4" /> Guardar con fecha y hora
        </button>
      </Card>

      <Card>
        <h3 className="text-base font-medium text-stone-900 mb-3">Historial de notas</h3>
        {!notes ? (
          <p className="text-sm text-stone-500 italic">Sin notas todavía.</p>
        ) : (
          <pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">{notes}</pre>
        )}
      </Card>
    </div>
  );

  const renderGlossary = () => {
    const terms = [
      { term: 'LBDCG / DLBCL', def: 'Linfoma B difuso de células grandes. Cáncer de linfocitos B, el glóbulo blanco que produce anticuerpos. Es el linfoma no-Hodgkin más común.' },
      { term: 'Ann Arbor', def: 'Sistema de clasificación por estadio en linfoma. I = un solo ganglio, II = varios ganglios del mismo lado del diafragma, III = ambos lados, IV = invasión de órganos.' },
      { term: 'Síntomas B', def: 'Fiebre inexplicada >38°C, sudores nocturnos empapantes, pérdida de peso >10% en 6 meses. Marcan enfermedad más activa.' },
      { term: 'PET-CT', def: 'Tomografía con glucosa radiactiva. Las células cancerosas consumen más glucosa y se "iluminan". Permite ver todo el cuerpo.' },
      { term: 'SUVmax', def: 'Medida de qué tan intenso brilla una lesión en el PET. Normal <2. Linfoma agresivo suele ser >5. El SUVmax de 26.7 de Roro es muy alto.' },
      { term: 'LDH', def: 'Deshidrogenasa láctica. Enzima que se libera al romperse células. Refleja cantidad de tumor activo. Normal <225. Roro: 2010.' },
      { term: 'IPI', def: 'International Prognostic Index. Puntaje de 0 a 5 que predice pronóstico en DLBCL. Edad >60, LDH alta, estadio III-IV, >1 sitio extranodal, mal estado funcional.' },
      { term: 'R-CHOP', def: 'Rituximab + Ciclofosfamida + Doxorrubicina (Hidroxidaunorubicina) + Vincristina (Oncovin) + Prednisona. Régimen estándar de quimio en DLBCL.' },
      { term: 'Rituximab', def: 'Anticuerpo contra CD20 de linfocitos B. No es quimio pura, es inmunoterapia. Primera infusión puede dar reacción.' },
      { term: 'R-mini-CHOP', def: 'R-CHOP con dosis reducidas (~50% de ciclofosfamida y doxorrubicina). Para mayores de 80 o pacientes frágiles.' },
      { term: 'Síndrome de lisis tumoral (TLS)', def: 'Cuando muchas células tumorales se rompen al tiempo tras quimio. Liberan potasio, fósforo, ácido úrico que dañan riñón. Emergencia prevenible.' },
      { term: 'Neutropenia febril', def: 'Fiebre con defensas bajas (<500 neutrófilos) post-quimio. Emergencia médica. Antibiótico en <1 hora.' },
      { term: 'FEVI', def: 'Fracción de Eyección del Ventrículo Izquierdo. Mide cuánto bombea el corazón. Debe ser ≥50% para usar doxorrubicina.' },
      { term: 'Pre-fase', def: 'Periodo de 5-7 días con solo prednisona y soporte, antes del primer ciclo completo. Baja la carga tumoral suavemente.' },
      { term: 'Deauville', def: 'Escala de 1 a 5 para evaluar respuesta en PET de control. 1-3 = buena respuesta. 4-5 = respuesta parcial o no respuesta.' },
      { term: 'Alopurinol', def: 'Medicamento que baja el ácido úrico. Se usa antes de quimio para prevenir lisis tumoral.' },
      { term: 'Rasburicasa', def: 'Enzima que descompone ácido úrico. Más potente que alopurinol. Para casos de lisis tumoral grave o prevención en alto riesgo.' },
      { term: 'G-CSF / Filgrastim', def: 'Factor estimulante de granulocitos. Acelera recuperación de defensas post-quimio. Reduce neutropenia febril.' },
      { term: 'Mucositis', def: 'Inflamación dolorosa y úlceras en boca y garganta post-quimio (día 7-14). Prevenible con higiene oral estricta desde antes.' },
      { term: 'Delirium', def: 'Confusión aguda reversible, común en mayores en UCI. Prevenible con orientación, sueño regular, presencia familiar.' },
      { term: 'Tubo de toracostomía', def: 'Tubo que drena líquido o aire del espacio alrededor del pulmón (cavidad pleural).' },
      { term: 'Catéter venoso central', def: 'Acceso por vena grande del cuello, subclavia o brazo, que llega al corazón. Para quimio y medicación.' },
      { term: 'Ecocardiograma', def: 'Ultrasonido del corazón. Mide FEVI, estructura y función cardiaca.' },
      { term: 'Anti-HBc', def: 'Anticuerpo contra el núcleo del virus de hepatitis B. Si es positivo, hubo infección previa y rituximab puede reactivarla.' },
      { term: 'Oncogeriatría', def: 'Especialidad que valora cáncer en adultos mayores integrando función, cognición, nutrición y comorbilidades.' },
      { term: 'Cuidados paliativos', def: 'NO es lo mismo que cuidados del final de la vida. Ayuda con síntomas, dolor, decisiones complejas, en cualquier fase de la enfermedad.' },
      { term: 'ECOG / Karnofsky', def: 'Escalas de estado funcional. ECOG 0 = normal, ECOG 4 = postrado. Karnofsky 100 = normal, Karnofsky 40 = incapaz de cuidarse.' },
    ];
    return (
      <div className="space-y-6">
        <SectionTitle subtitle="Términos médicos que vas a escuchar, en palabras claras. Guárdenlo para consulta rápida.">
          Glosario
        </SectionTitle>
        <div className="grid sm:grid-cols-2 gap-3">
          {terms.map(t => (
            <div key={t.term} className="border border-stone-200 rounded-lg p-4 bg-white">
              <p className="text-sm font-medium text-stone-900 mb-1">{t.term}</p>
              <p className="text-xs text-stone-600 leading-relaxed">{t.def}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExport = () => (
    <div className="space-y-6">
      <SectionTitle subtitle="Genera el broadcast de WhatsApp con todo lo más reciente: turnos asignados, turnos sin cubrir, inventario faltante, respuestas del médico, notas del diario y preguntas pendientes.">
        Exportar a WhatsApp
      </SectionTitle>

      <Card tone="safe">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-emerald-700 flex-none mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-950 mb-2">Flujo recomendado para el broadcast familiar</p>
            <ol className="text-sm text-emerald-900 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>El cuidador responsable del día entra a esta sección.</li>
              <li>Da clic en <span className="font-medium">"Generar resumen"</span>.</li>
              <li>Revisa que todo esté correcto.</li>
              <li>Da clic en <span className="font-medium">"Copiar al portapapeles"</span>.</li>
              <li>Abre WhatsApp, entra al grupo o broadcast familiar, pega y envía.</li>
            </ol>
            <p className="text-xs text-emerald-800 mt-3 italic leading-relaxed">
              Sugerencia: hacer esto una vez al día (idealmente noche) para que toda la familia despierte con el resumen. También cuando pase algo importante (resultado de examen, decisión médica, cambio de plan).
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex gap-3 mb-4 flex-wrap">
          <button
            onClick={generateExport}
            className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-md hover:bg-stone-800"
          >
            <FileText className="w-4 h-4" /> Generar resumen
          </button>
          {exportText && (
            <button
              onClick={copyExport}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-md hover:bg-emerald-700"
            >
              <Copy className="w-4 h-4" /> Copiar para WhatsApp
            </button>
          )}
        </div>
        {exportText && (
          <>
            <p className="text-xs text-stone-500 mb-2">Vista previa del broadcast (formato WhatsApp — *negritas* y _cursivas_ se renderizan al pegar):</p>
            <pre className="text-xs text-stone-700 whitespace-pre-wrap font-mono bg-stone-50 p-4 rounded-md overflow-y-auto leading-relaxed border border-stone-200" style={{ maxHeight: '600px' }}>
              {exportText}
            </pre>
          </>
        )}
      </Card>

      {activityLog.length > 0 && (
        <Card>
          <h3 className="text-base font-medium text-stone-900 mb-3">Log completo de actividad ({activityLog.length} entradas)</h3>
          <div className="space-y-1" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {activityLog.map(a => (
              <div key={a.id} className="flex items-start gap-2 text-xs border-b border-stone-100 pb-1.5 last:border-0">
                <span className="text-stone-400 font-mono flex-none" style={{ minWidth: '100px' }}>
                  {new Date(a.time).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-stone-700 font-medium flex-none">{a.actor}:</span>
                <span className="text-stone-600 flex-1">{a.action}{a.detail && <span className="text-stone-500"> · {a.detail}</span>}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderCalendar = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    const slots = [
      { id: 'manana', label: 'Mañana', time: '6:00 — 12:00', icon: Sun },
      { id: 'tarde', label: 'Tarde', time: '12:00 — 18:00', icon: Sunset },
      { id: 'noche', label: 'Noche', time: '18:00 — 24:00', icon: Moon },
    ];

    const formatDate = (d) => d.toISOString().slice(0, 10);
    const dateLabel = (d) => {
      const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `${weekdays[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
    };

    // Contar cobertura
    let covered = 0;
    let total = days.length * slots.length;
    days.forEach(d => {
      const dk = formatDate(d);
      slots.forEach(s => {
        if (calendarData[dk] && calendarData[dk][s.id] && calendarData[dk][s.id].who) covered++;
      });
    });

    return (
      <div className="space-y-6">
        <SectionTitle subtitle="Turnos de acompañamiento por los próximos 15 días. Dividir la energía entre la familia. Cualquier persona que quiera ayudar puede anotarse.">
          Calendario de visitas y acompañamiento
        </SectionTitle>

        <Card tone="info">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-sky-700 flex-none mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-sky-950 mb-1">Cobertura actual: {covered} de {total} turnos</p>
              <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-sky-600 transition-all"
                  style={{ width: `${(covered / total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-sky-800 mt-3 leading-relaxed">
                La presencia familiar en UCI reduce delirium y mejora recuperación. No hace falta llenar todos los turnos — pero sí tratar de cubrir al menos: visita médica matutina (8-10 am), momento de comida (mediodía y 6 pm), y cambio de turno de enfermería.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-medium text-stone-900 mb-2">Cómo se usa</h3>
          <ol className="text-sm text-stone-700 space-y-2 list-decimal list-inside">
            <li>Cualquier miembro de la familia que quiera acompañar: encuentra un turno libre y escribe su nombre.</li>
            <li>En "Tarea / notas" puede escribir cosas concretas: "llevo caldo de huesos", "acompaño ronda médica", "cambio de pañal", "me toca oxímetro cada 2 horas".</li>
            <li>Todo se guarda automático y aparece en el resumen que se exporta al broadcast de WhatsApp.</li>
          </ol>
        </Card>

        <div className="space-y-3">
          {days.map(d => {
            const dk = formatDate(d);
            const dayData = calendarData[dk] || {};
            const isToday = formatDate(new Date()) === dk;
            return (
              <div
                key={dk}
                className={`border rounded-xl p-4 ${isToday ? 'border-sky-300 bg-sky-50/40' : 'border-stone-200 bg-white'}`}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className={`text-base font-medium ${isToday ? 'text-sky-950' : 'text-stone-900'}`}>
                    {dateLabel(d)}
                    {isToday && <span className="ml-2 text-xs font-normal text-sky-700">(hoy)</span>}
                  </h3>
                  <span className="text-xs text-stone-500">
                    {slots.filter(s => dayData[s.id] && dayData[s.id].who).length} / 3 cubiertos
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {slots.map(slot => {
                    const slotData = dayData[slot.id] || { who: '', notes: '' };
                    const SlotIcon = slot.icon;
                    const filled = slotData.who && slotData.who.trim();
                    return (
                      <div
                        key={slot.id}
                        className={`border rounded-lg p-3 ${filled ? 'border-emerald-200 bg-emerald-50/40' : 'border-stone-200 bg-stone-50/40'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <SlotIcon className="w-3.5 h-3.5 text-stone-500" />
                            <span className="text-xs font-medium text-stone-700">{slot.label}</span>
                          </div>
                          <span className="text-[10px] text-stone-500">{slot.time}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="¿Quién acompaña?"
                          defaultValue={slotData.who}
                          onBlur={(e) => {
                            const newData = { ...slotData, who: e.target.value };
                            if (e.target.value !== slotData.who) {
                              saveCalendarSlot(dk, slot.id, newData);
                            }
                          }}
                          className="w-full text-xs p-2 mb-1.5 border border-stone-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
                        />
                        <input
                          type="text"
                          placeholder="Tarea / notas"
                          defaultValue={slotData.notes}
                          onBlur={(e) => {
                            const newData = { ...slotData, notes: e.target.value };
                            if (e.target.value !== slotData.notes) {
                              saveCalendarSlot(dk, slot.id, newData);
                            }
                          }}
                          className="w-full text-xs p-2 border border-stone-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
                        />
                        {filled && (
                          <button
                            onClick={() => clearCalendarSlot(dk, slot.id)}
                            className="mt-1.5 text-[10px] text-stone-400 hover:text-rose-600"
                          >
                            Liberar turno
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    const getStatus = (catKey, item) => {
      const key = `${catKey}_${item}`;
      return inventoryData[key] || { name: item, status: 'pendiente', qty: '', responsable: '', notes: '' };
    };

    const countStatus = (status) => {
      let count = 0;
      inventoryCatalog.forEach(cat => {
        cat.items.forEach(item => {
          const key = `${cat.category}_${item}`;
          if (inventoryData[key] && inventoryData[key].status === status) count++;
        });
      });
      return count;
    };

    const totalItems = inventoryCatalog.reduce((sum, cat) => sum + cat.items.length, 0);

    return (
      <div className="space-y-6">
        <SectionTitle subtitle="Lista de insumos para cuidar a Roro en el hospital y en casa. Cada uno marca qué tiene, qué falta, quién se encargará. Se comparte con toda la familia.">
          Inventario de insumos
        </SectionTitle>

        <Card tone="info">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-sky-700 flex-none mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-sky-950 mb-2">Resumen rápido</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-emerald-700 font-medium">{countStatus('tengo')}</p>
                  <p className="text-stone-600">Ya tenemos</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-amber-700 font-medium">{countStatus('comprando')}</p>
                  <p className="text-stone-600">Alguien va por ello</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-rose-700 font-medium">{countStatus('falta')}</p>
                  <p className="text-stone-600">Falta — urgente</p>
                </div>
              </div>
              <p className="text-xs text-sky-800 mt-3 leading-relaxed">
                Total de {totalItems} insumos sugeridos. No todos son necesarios, pero es una lista integral para no olvidar nada.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-medium text-stone-900 mb-2">Cómo se usa</h3>
          <p className="text-sm text-stone-700 leading-relaxed mb-2">
            Cada ítem tiene 4 estados — haz clic en el botón del estado correspondiente:
          </p>
          <ul className="text-sm text-stone-700 space-y-1">
            <li><span className="inline-block w-3 h-3 rounded-full bg-stone-300 mr-2 align-middle"></span><span className="font-medium">Pendiente:</span> todavía no se evaluó</li>
            <li><span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-2 align-middle"></span><span className="font-medium">Tengo:</span> ya está disponible en casa o en hospital</li>
            <li><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2 align-middle"></span><span className="font-medium">Comprando:</span> alguien va a conseguirlo</li>
            <li><span className="inline-block w-3 h-3 rounded-full bg-rose-500 mr-2 align-middle"></span><span className="font-medium">Falta:</span> nadie lo tiene todavía — es la lista de compras</li>
          </ul>
        </Card>

        {inventoryCatalog.map(cat => (
          <Card key={cat.category}>
            <h3 className="text-base font-medium text-stone-900 mb-3">{cat.category}</h3>
            <div className="space-y-2">
              {cat.items.map(item => {
                const key = `${cat.category}_${item}`;
                const current = getStatus(cat.category, item);
                const status = current.status;
                const statusColors = {
                  pendiente: 'bg-stone-100 text-stone-700',
                  tengo: 'bg-emerald-100 text-emerald-800',
                  comprando: 'bg-amber-100 text-amber-800',
                  falta: 'bg-rose-100 text-rose-800',
                };
                return (
                  <div key={item} className="border border-stone-200 rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-900">{item}</p>
                        {(current.responsable || current.notes) && (
                          <p className="text-xs text-stone-500 mt-1">
                            {current.responsable && <span>Encargado: <span className="font-medium">{current.responsable}</span></span>}
                            {current.responsable && current.notes && ' · '}
                            {current.notes && <span>{current.notes}</span>}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {['tengo', 'comprando', 'falta'].map(s => (
                          <button
                            key={s}
                            onClick={() => saveInventoryItem(key, { ...current, name: item, status: status === s ? 'pendiente' : s })}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              status === s ? statusColors[s] : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                            }`}
                          >
                            {s === 'tengo' ? '✓ Tengo' : s === 'comprando' ? '↻ Comprando' : '✗ Falta'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {(status === 'comprando' || status === 'falta') && (
                      <div className="mt-2 grid sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="¿Quién se encarga?"
                          defaultValue={current.responsable}
                          onBlur={(e) => {
                            if (e.target.value !== current.responsable) {
                              saveInventoryItem(key, { ...current, name: item, responsable: e.target.value });
                            }
                          }}
                          className="text-xs p-1.5 border border-stone-200 rounded bg-stone-50 focus:outline-none focus:ring-1 focus:ring-sky-300"
                        />
                        <input
                          type="text"
                          placeholder="Cantidad / notas"
                          defaultValue={current.notes}
                          onBlur={(e) => {
                            if (e.target.value !== current.notes) {
                              saveInventoryItem(key, { ...current, name: item, notes: e.target.value });
                            }
                          }}
                          className="text-xs p-1.5 border border-stone-200 rounded bg-stone-50 focus:outline-none focus:ring-1 focus:ring-sky-300"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        <Card tone="warn">
          <h3 className="text-base font-medium text-amber-950 mb-2">¿Falta algo? Los ambientes de UCI prohíben...</h3>
          <ul className="text-sm text-amber-900 space-y-1">
            <li>✗ Flores frescas (riesgo de hongos)</li>
            <li>✗ Plantas vivas</li>
            <li>✗ Alimentos sin autorización (confirmar con equipo cada vez)</li>
            <li>✗ Objetos de tela que no se puedan lavar a alta temperatura</li>
            <li>✗ Más de 2 visitantes a la vez (usualmente)</li>
          </ul>
        </Card>
      </div>
    );
  };

  const content = {
    home: renderHome,
    diagnosis: renderDiagnosis,
    bodymap: renderBodyMap,
    labs: renderLabs,
    treatment: renderTreatment,
    risks: renderRisks,
    questions: renderQuestions,
    calendar: renderCalendar,
    inventory: renderInventory,
    care: renderCare,
    nutrition: renderNutrition,
    medlog: renderMedLog,
    notes: renderNotes,
    glossary: renderGlossary,
    export: renderExport,
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const Icon = currentTab?.icon || Home;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Top bar mobile */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-stone-200 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-serif text-stone-900 leading-tight">Cuidado de Roro</p>
          <p className="text-[10px] text-stone-500">Rodrigo Cardona · UCI Country</p>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded-md text-xs text-stone-700"
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{menuOpen ? 'Cerrar' : 'Menú'}</span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-stone-900/30" onClick={() => setMenuOpen(false)}>
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-stone-200">
              <p className="text-sm font-serif text-stone-900 leading-tight">Cuidado de Roro</p>
              <p className="text-xs text-stone-500 mt-0.5">Rodrigo Cardona</p>
              <p className="text-[10px] text-stone-400 mt-1">UCI · Clínica del Country, Bogotá</p>
            </div>
            <nav className="p-3">
              {Object.entries(groups).map(([groupId, groupTabs]) => (
                <div key={groupId} className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 px-2 mb-1.5 font-medium">
                    {groupLabels[groupId]}
                  </p>
                  {groupTabs.map(tab => {
                    const TabIcon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setMenuOpen(false); window.scrollTo(0, 0); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md text-left transition-colors ${
                          active
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <TabIcon className="w-4 h-4 flex-none" />
                        <span className="flex-1 truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop sidebar - always visible */}
        <aside className="hidden lg:block lg:w-64 lg:flex-none lg:min-h-screen bg-white border-r border-stone-200 sticky top-0 self-start" style={{ height: '100vh', overflowY: 'auto' }}>
          <div className="p-5 border-b border-stone-200">
            <p className="text-sm font-serif text-stone-900 leading-tight">Cuidado de Roro</p>
            <p className="text-xs text-stone-500 mt-0.5">Rodrigo Cardona</p>
            <p className="text-[10px] text-stone-400 mt-1">UCI · Clínica del Country</p>
          </div>
          <nav className="p-3">
            {Object.entries(groups).map(([groupId, groupTabs]) => (
              <div key={groupId} className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 px-2 mb-1.5 font-medium">
                  {groupLabels[groupId]}
                </p>
                {groupTabs.map(tab => {
                  const TabIcon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); window.scrollTo(0, 0); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md text-left transition-colors ${
                        active
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <TabIcon className="w-4 h-4 flex-none" />
                      <span className="flex-1 truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 lg:p-10 max-w-full overflow-x-hidden">
          <div className="flex items-center gap-2 mb-1 text-xs text-stone-500 uppercase tracking-wider">
            <Icon className="w-3.5 h-3.5" />
            <span>{groupLabels[currentTab?.group] || ''}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{currentTab?.label}</span>
          </div>
          {content[activeTab]()}
        </main>
      </div>
    </div>
  );
}

// --- Subcomponents ---
function LabChart({ series }) {
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

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xForIndex(i)} ${yForValue(d.value)}`)
    .join(' ');

  const lineColors = {
    safe: '#059669',
    warn: '#d97706',
    critical: '#e11d48',
    default: '#525252',
  };
  const color = lineColors[severity] || lineColors.default;

  const toneStyles = {
    safe: 'border-emerald-200',
    warn: 'border-amber-200',
    critical: 'border-rose-200',
  };

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
        {/* Rango normal sombreado */}
        <rect
          x={padding.left}
          y={normalTop}
          width={plotW}
          height={Math.max(normalBottom - normalTop, 2)}
          fill="#10b981"
          opacity="0.08"
        />
        <line x1={padding.left} y1={normalTop} x2={padding.left + plotW} y2={normalTop} stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
        <line x1={padding.left} y1={normalBottom} x2={padding.left + plotW} y2={normalBottom} stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />

        {/* Etiquetas del rango normal */}
        <text x={padding.left + plotW + 3} y={normalTop + 3} fontSize="9" fill="#047857">{normalMax}</text>
        <text x={padding.left + plotW + 3} y={normalBottom + 3} fontSize="9" fill="#047857">{normalMin}</text>

        {/* Eje Y min/max */}
        <text x={padding.left - 4} y={padding.top + 4} fontSize="9" fill="#78716c" textAnchor="end">{Math.round(yMax)}</text>
        <text x={padding.left - 4} y={padding.top + plotH + 4} fontSize="9" fill="#78716c" textAnchor="end">{Math.round(yMin)}</text>

        {/* Eje Y línea */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} stroke="#d6d3d1" strokeWidth="0.5" />
        <line x1={padding.left} y1={padding.top + plotH} x2={padding.left + plotW} y2={padding.top + plotH} stroke="#d6d3d1" strokeWidth="0.5" />

        {/* Línea de datos */}
        {data.length > 1 && (
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Puntos */}
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
          {last.value} {unit} {isOutOfRange && '·'}  {isOutOfRange && (last.value > normalMax ? 'arriba de normal' : 'debajo de normal')}
        </span>
      </div>
    </div>
  );
}

function LabCard({ label, value, range, trend, severity }) {
  const tones = {
    critical: 'bg-rose-50 border-rose-200',
    warn: 'bg-amber-50 border-amber-200',
    safe: 'bg-emerald-50 border-emerald-200',
    default: 'bg-stone-50 border-stone-200',
  };
  const trendColors = {
    critical: 'text-rose-800',
    warn: 'text-amber-800',
    safe: 'text-emerald-800',
    default: 'text-stone-600',
  };
  return (
    <div className={`border rounded-lg p-4 ${tones[severity] || tones.default}`}>
      <p className="text-xs text-stone-600 font-medium mb-1">{label}</p>
      <p className="text-xl font-medium text-stone-900">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{range}</p>
      <p className={`text-xs mt-2 ${trendColors[severity] || trendColors.default}`}>{trend}</p>
    </div>
  );
}

function DrugRow({ letter, name, role, admin }) {
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

function TimelineStep({ num, title, detail, days, last }) {
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

function ScenarioCard({ tone, pct, title, sub, desc, signs, outcome }) {
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
