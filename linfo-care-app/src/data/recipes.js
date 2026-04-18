// Recipes — extracted from LymphomaCare.jsx
export const mouthRinseRecipes = [
  {
    id: 'r1', name: 'Enjuague de bicarbonato y sal (el fundamental)',
    evidence: 'Evidencia nivel 1 — recomendado por guías MASCC/ISOO para prevención de mucositis',
    when: 'Desde antes de la quimio, 4-6 veces al día, especialmente después de cada comida',
    ingredients: ['250 ml de agua tibia (hervida previamente, no caliente)', '½ cucharadita de bicarbonato de sodio', '½ cucharadita de sal (no de mar si hay neutropenia, mejor sal refinada)'],
    method: 'Disolver bien. Enjuagar boca 30 segundos, escupir. No tragar. Preparar fresco cada vez.',
    caution: 'Si siente quemazón, reducir sal a ¼ cucharadita.',
  },
  {
    id: 'r2', name: 'Enjuague de manzanilla',
    evidence: 'Evidencia moderada — antiinflamatorio suave, calma mucosa irritada',
    when: 'Como complemento, 2-3 veces al día. No reemplaza el bicarbonato.',
    ingredients: ['1 bolsita de manzanilla (Matricaria chamomilla)', '250 ml de agua hervida'],
    method: 'Reposar la manzanilla 10 min, dejar enfriar completamente (temperatura ambiente o fría). Enjuagar 30 segundos.',
    caution: 'Si hay alergia a ambrosía o margaritas, evitar.',
  },
  {
    id: 'r3', name: 'Oil pulling con aceite de coco (antes de dormir)',
    evidence: 'Evidencia moderada — reduce carga bacteriana oral, alivia boca seca',
    when: 'Una vez al día, preferiblemente antes de dormir',
    ingredients: ['1 cucharada de aceite de coco virgen (grado alimenticio)'],
    method: 'Poner en la boca, dejar que se derrita con el calor de la boca (30 seg), luego moverlo suavemente entre dientes durante 5-10 minutos. Escupir en bolsa (no en lavamanos — tapa cañerías). Enjuagar con agua.',
    caution: 'No hacer si tiene dificultad para tragar o está sedado.',
  },
  {
    id: 'r4', name: 'Miel de flor de abeja aplicada en lesiones',
    evidence: 'Evidencia creciente (Cochrane 2020) — reduce severidad de mucositis en quimio/radio',
    when: 'Si aparece mucositis, 3 veces al día sobre las zonas irritadas',
    ingredients: ['1 cucharadita de miel natural sin procesar'],
    method: 'Aplicar directamente sobre las úlceras orales con un hisopo limpio. Dejar actuar 1-2 minutos. No enjuagar inmediatamente.',
    caution: 'EVITAR si hay diabetes mal controlada o si está en neutropenia profunda (usar miel pasteurizada en neutropenia).',
  },
  {
    id: 'r5', name: 'Enjuague frío de té verde débil',
    evidence: 'Evidencia moderada — antioxidantes (EGCG), reduce inflamación',
    when: 'Opcional, 1-2 veces al día',
    ingredients: ['1 bolsita de té verde', '300 ml de agua hervida'],
    method: 'Infusionar 3 min (no más — queda amargo). Enfriar por completo. Enjuagar sin tragar.',
    caution: 'Tiene cafeína — no antes de dormir.',
  },
];

export const avoidInMouth = [
  'Enjuagues con alcohol (Listerine clásico, etc.) — resecan y queman mucosa',
  'Clavos de olor masticados o en enjuague — son abrasivos e irritan mucosa dañada',
  'Jengibre directo en boca si hay mucositis — arde mucho',
  'Limón, naranja, piña directos en boca cuando hay mucositis — el ácido lastima',
  'Pasta de dientes con lauril sulfato de sodio (SLS) fuerte — preferir una suave sin SLS',
  'Cepillos duros o de cerdas medias',
];

export const foodRecipes = [
  {
    id: 'f1', name: 'Caldo de huesos casero (base de casi todo)',
    phase: 'Siempre. Fundacional.',
    why: 'Aporta colágeno, aminoácidos (glicina, prolina), electrolitos, minerales. Es hidratante, fácil de tragar, denso en micronutrientes.',
    ingredients: ['1.5-2 kg de huesos (pollo con médula, huesos de res, costilla)', '2 zanahorias grandes', '2 tallos de apio', '1 cebolla con cáscara', '6 dientes de ajo aplastados', '2 cucharadas de vinagre de manzana', '2 hojas de laurel', '1 cucharadita de sal', '4 L de agua'],
    method: 'Rostizar los huesos en horno a 200°C por 30 min. Pasar a olla grande con todos los ingredientes. Hervir, luego fuego suave. Cocinar 8-12 horas (olla lenta) o 3 horas (olla express). Colar bien. Porcionar en frascos.',
    nutrition: '1 taza aporta ~10-15 g colágeno, ~6 g proteína, minerales',
  },
  {
    id: 'f2', name: 'Paletas de caldo de huesos con mango',
    phase: 'Pre-quimio y durante mucositis — calma, hidrata, aporta proteína',
    why: 'El frío anestesia la boca irritada, el caldo aporta proteína y minerales.',
    ingredients: ['2 tazas de caldo de huesos frío', '1 taza de pulpa de mango maduro', '1 cucharada de miel', 'Pizca de sal'],
    method: 'Mezclar todo bien. Vertir en moldes de paletas. Congelar 6 horas. Hacer tanda de 10-12.',
    nutrition: 'Cada paleta: ~60-80 kcal, 3-4 g proteína, vitamina A, potasio',
  },
  {
    id: 'f3', name: 'Smoothie alto en calorías (aguacate-plátano-avena)',
    phase: 'Para recuperar peso. Pre-quimio.',
    why: 'Aguacate y mantequilla de maní son grasas saludables densas en calorías.',
    ingredients: ['½ aguacate maduro', '1 plátano maduro', '1 cucharada de mantequilla de maní natural', '3 cucharadas de avena instantánea', '250 ml de leche entera', '1 cucharadita de miel', 'Pizca de canela y sal'],
    method: 'Cocinar brevemente la avena en la leche (2 min). Dejar enfriar. Licuar todo hasta textura suave.',
    nutrition: '~500-550 kcal, 15-18 g proteína, 25 g grasa saludable',
  },
  {
    id: 'f4', name: 'Puré de papa enriquecido',
    phase: 'Cuando pueda comer blando. Alta densidad calórica.',
    why: 'La papa es suave, tolerada casi siempre. Enriquecida con grasas y proteína.',
    ingredients: ['2 papas blancas medianas', '3 cucharadas de mantequilla', '¼ taza de leche entera tibia', '1 cucharada de aceite de oliva', '1 yema de huevo cocida', '2 cucharadas de queso crema'],
    method: 'Hervir papas hasta muy blandas. Aplastar con tenedor. Añadir todo y mezclar hasta cremoso.',
    nutrition: '~400-450 kcal por porción, 10 g proteína',
  },
  {
    id: 'f5', name: 'Caldo de pollo con fideos y huevo batido',
    phase: 'Siempre, especialmente cuando hay poco apetito.',
    why: 'Combina caldo hidratante + carbohidrato suave + proteína completa del huevo.',
    ingredients: ['3 tazas de caldo de pollo casero', '¼ taza de fideos finos', '2 huevos muy bien batidos', 'Sal al gusto'],
    method: 'Hervir el caldo. Añadir fideos, cocinar 5 min. Bajar fuego. Verter huevos lentamente mientras se revuelve. Apagar.',
    nutrition: '~300 kcal, 18 g proteína',
  },
  {
    id: 'f6', name: 'Arroz con leche enriquecido',
    phase: 'Postre terapéutico. Suave, blando, consuela.',
    why: 'Arroz bien cocido es de los alimentos mejor tolerados. Leche y huevo aportan proteína.',
    ingredients: ['½ taza de arroz blanco', '1 L de leche entera', '½ taza de azúcar', '1 rama de canela', '2 yemas de huevo', '1 cucharadita de vainilla'],
    method: 'Hervir arroz en leche con canela a fuego suave 35-40 min hasta cremoso. Templar yemas, incorporar. Servir tibio con canela.',
    nutrition: '~280 kcal por porción, 9 g proteína',
  },
  {
    id: 'f7', name: 'Compota de manzana y pera con canela',
    phase: 'Suave, siempre. Aporta fibra soluble y potasio.',
    why: 'Fácil de digerir, bajo riesgo microbiológico (está cocida), reconforta.',
    ingredients: ['3 manzanas rojas peladas', '2 peras peladas', '1 cucharada de mantequilla', '1 rama de canela', 'Pizca de sal'],
    method: 'Cocinar todo tapado a fuego medio 20 min. Retirar canela. Triturar a textura deseada.',
    nutrition: '~130 kcal, 3 g fibra, vitamina C, potasio',
  },
  {
    id: 'f8', name: 'Pudín de chía',
    phase: 'Pre-quimio. NO en neutropenia severa.',
    why: 'Hidrata, aporta omega-3 vegetal y fibra soluble. Textura suave.',
    ingredients: ['3 cucharadas de semillas de chía', '1 taza de leche entera', '1 cucharada de miel', '½ cucharadita de vainilla'],
    method: 'Mezclar chía con leche, miel y vainilla. Remover a los 15 min. Refrigerar mínimo 4 horas. Servir con fruta blanda.',
    nutrition: '~320 kcal, 10 g proteína, 12 g fibra, omega-3',
  },
];

export const neutropeniaRules = [
  { rule: 'Todo bien cocido', ok: 'Carnes al punto bien hecho, huevos duros, vegetales hervidos', avoid: 'Sushi, carpaccio, huevo tibio, carne término medio' },
  { rule: 'Frutas peladas gruesas', ok: 'Plátano, mango (pelado), papaya (pelada), aguacate', avoid: 'Fresas, frambuesas, uvas, manzana con cáscara' },
  { rule: 'Vegetales SOLO cocidos', ok: 'Zanahoria, papa, calabaza, espinaca hervidas', avoid: 'Lechuga, tomate crudo, ensaladas' },
  { rule: 'Lácteos pasteurizados', ok: 'Leche UHT, yogurt industrial, quesos madurados', avoid: 'Queso fresco de mercado, leche cruda' },
  { rule: 'Nada fermentado sin control', ok: 'Yogurt industrial sellado', avoid: 'Kombucha, kimchi artesanal, kéfir casero' },
  { rule: 'Nueces envasadas', ok: 'Almendras tostadas en paquete sellado', avoid: 'Nueces al granel, frutos secos del mercado' },
  { rule: 'Miel pasteurizada', ok: 'Miel industrial de marca con sello', avoid: 'Miel cruda artesanal' },
  { rule: 'Agua hervida o embotellada', ok: 'Agua embotellada, agua hervida', avoid: 'Agua del grifo, hielo casero sin hervir' },
];

export const hydrationIdeas = [
  { name: 'Agua de coco natural', why: 'Electrolitos naturales, potasio, suave', caution: 'Si hipercalemia, limitar' },
  { name: 'Cubitos de caldo de huesos', why: 'Hidratan + proteína + minerales', caution: 'Revisar sodio si hipertensión' },
  { name: 'Agua con pepino y menta', why: 'Refrescante, estimula a beber', caution: 'En neutropenia, pepino pelado' },
  { name: 'Té de jengibre suave', why: 'Alivia náusea', caution: 'NO si anticoagulado' },
  { name: 'Agua con limón y sal', why: 'Balance hidroelectrolítico', caution: 'Omitir limón si mucositis' },
  { name: 'Paletas de manzanilla', why: 'Hidratan + calman náusea', caution: 'Asegurar temperatura antes de congelar' },
];
