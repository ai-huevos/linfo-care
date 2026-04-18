// Daily checklist items — extracted from LymphomaCare.jsx
export const checklistItems = [
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

export const checklistCategories = {
  piel: { label: 'Cuidado de piel', icon: 'Shield' },
  boca: { label: 'Cuidado de boca', icon: 'Droplets' },
  mente: { label: 'Prevención de delirium', icon: 'Brain' },
  dolor: { label: 'Manejo del dolor', icon: 'Thermometer' },
  nutricion: { label: 'Nutrición / hidratación', icon: 'Soup' },
  presencia: { label: 'Presencia afectuosa', icon: 'HandHeart' },
};
