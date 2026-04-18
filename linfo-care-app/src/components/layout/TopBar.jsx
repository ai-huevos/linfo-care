import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const pathLabels = {
  '/': 'Inicio',
  '/medical/diagnosis': 'Diagnóstico',
  '/medical/bodymap': 'Mapa Corporal',
  '/medical/labs': 'Laboratorios',
  '/medical/treatment': 'Tratamiento',
  '/medical/medications': 'Medicamentos',
  '/medical/documents': 'Documentos',
  '/medical/questions': 'Preguntas',
  '/family/shifts': 'Turnos',
  '/family/journal': 'Diario',
  '/family/inventory': 'Inventario',
  '/family/checklist': 'Checklist diario',
  '/family/export': 'WhatsApp',
  '/care/nutrition': 'Nutrición',
  '/care/daily': 'Cuidados diarios',
  '/reference/glossary': 'Glosario',
  '/reference/scenarios': 'Escenarios',
  '/chat': 'Doctora Lío',
};

const pathSections = {
  '/': 'Inicio',
  '/medical': 'Historia Clínica',
  '/family': 'Familia',
  '/care': 'Guía de Cuidado',
  '/reference': 'Referencia',
  '/chat': 'Doctora Lío',
};

export default function TopBar({ onMenuToggle }) {
  const location = useLocation();
  const currentLabel = pathLabels[location.pathname] || 'LinfoCare';
  const sectionKey = '/' + (location.pathname.split('/')[1] || '');
  const sectionLabel = pathSections[sectionKey] || '';

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 -ml-2 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1 text-[10px] text-stone-400 uppercase tracking-wider">
              {sectionLabel && sectionLabel !== currentLabel && (
                <>
                  <span>{sectionLabel}</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </>
              )}
              <span className="text-stone-600">{currentLabel}</span>
            </div>
            <p className="text-sm font-semibold text-stone-900 -mt-0.5">LinfoCare</p>
          </div>
        </div>
        <button className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
