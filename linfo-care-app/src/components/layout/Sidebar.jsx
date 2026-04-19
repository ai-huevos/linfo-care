import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Stethoscope, Users, Utensils, BookOpen,
  Activity, MapPin, FlaskConical, Pill, FileText, HelpCircle,
  Calendar, NotebookPen, Package, CheckSquare, MessageCircle,
  ChevronDown, ChevronRight, X, Menu, LogOut, Bot,
  Shield, BookOpenCheck
} from 'lucide-react';
import { useAuth } from '../../lib/auth';

const navSections = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: Home,
    path: '/',
  },
  {
    id: 'medical',
    label: 'Historia Clínica',
    icon: Stethoscope,
    children: [
      { label: 'Diagnóstico', icon: Activity, path: '/medical/diagnosis' },
      { label: 'Mapa Corporal', icon: MapPin, path: '/medical/bodymap' },
      { label: 'Laboratorios', icon: FlaskConical, path: '/medical/labs' },
      { label: 'Tratamiento', icon: Shield, path: '/medical/treatment' },
      { label: 'Medicamentos', icon: Pill, path: '/medical/medications' },
      { label: 'Documentos', icon: FileText, path: '/medical/documents' },
      { label: 'Preguntas', icon: HelpCircle, path: '/medical/questions' },
    ],
  },
  {
    id: 'family',
    label: 'Familia',
    icon: Users,
    children: [
      { label: 'Turnos', icon: Calendar, path: '/family/shifts' },
      { label: 'Diario', icon: NotebookPen, path: '/family/journal' },
      { label: 'Inventario', icon: Package, path: '/family/inventory' },
      { label: 'Checklist diario', icon: CheckSquare, path: '/family/checklist' },
      { label: 'WhatsApp', icon: MessageCircle, path: '/family/export' },
    ],
  },
  {
    id: 'care',
    label: 'Guía de Cuidado',
    icon: Utensils,
    children: [
      { label: 'Nutrición', icon: Utensils, path: '/care/nutrition' },
      { label: 'Cuidados diarios', icon: CheckSquare, path: '/care/daily' },
    ],
  },
  {
    id: 'reference',
    label: 'Referencia',
    icon: BookOpen,
    children: [
      { label: 'Glosario', icon: BookOpenCheck, path: '/reference/glossary' },
      { label: 'Escenarios', icon: Activity, path: '/reference/scenarios' },
    ],
  },
];

function NavSection({ section, collapsed, onNavigate }) {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  // Single item (Dashboard)
  if (!section.children) {
    const Icon = section.icon;
    const isActive = location.pathname === section.path;
    return (
      <NavLink
        to={section.path}
        onClick={onNavigate}
        className={`flex items-center gap-2.5 px-3 py-3 text-sm rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
        }`}
      >
        <Icon className="w-5 h-5 flex-none" />
        <span className="flex-1 truncate font-medium">{section.label}</span>
      </NavLink>
    );
  }

  const SectionIcon = section.icon;
  const hasActiveChild = section.children.some(c => location.pathname === c.path);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
          hasActiveChild ? 'text-sky-700 bg-sky-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
        }`}
      >
        <SectionIcon className="w-4 h-4 flex-none" />
        <span className="flex-1 text-left">{section.label}</span>
        <ChevronDown className={`w-3 h-3 flex-none transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="ml-2 mt-0.5 space-y-0.5 border-l border-stone-200 pl-2">
          {section.children.map(child => {
            const ChildIcon = child.icon;
            const isActive = location.pathname === child.path;
            return (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <ChildIcon className="w-4 h-4 flex-none" />
                <span className="truncate">{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { displayName, signOut, isDemo } = useAuth();

  const sidebarContent = (
    <>
      {/* Logo / header */}
      <div className="p-5 border-b border-stone-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 tracking-tight">LinfoCare</p>
            <p className="text-[11px] text-stone-500 truncate">Cuidado de Roro</p>
          </div>
        </div>
        <div className="mt-3 px-1">
          <p className="text-[11px] text-stone-400">Rodrigo Cardona · Clínica del Country</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navSections.map(section => (
          <NavSection key={section.id} section={section} onNavigate={onClose} />
        ))}
      </nav>

      {/* Doctora Lío quick access */}
      <div className="p-3 border-t border-stone-200/60">
        <NavLink
          to="/chat"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200/60 text-violet-700 hover:from-violet-100 hover:to-fuchsia-100 transition-all duration-200"
        >
          <Bot className="w-4 h-4 flex-none" />
          <span className="font-medium">Doctora Lío</span>
          <span className="ml-auto text-[10px] bg-violet-200 text-violet-800 px-1.5 py-0.5 rounded-full font-medium">AI</span>
        </NavLink>
      </div>

      {/* User */}
      <div className="p-4 border-t border-stone-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-800 truncate">{displayName}</p>
            <p className="text-[10px] text-stone-400">{isDemo ? 'Modo demo' : 'Conectado'}</p>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-none lg:flex-col bg-white/80 backdrop-blur-xl border-r border-stone-200/60 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
          <aside
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
