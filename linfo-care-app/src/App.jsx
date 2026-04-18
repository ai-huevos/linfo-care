import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/layout/Layout';

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Chat = lazy(() => import('./pages/Chat'));

// Medical
const Diagnosis = lazy(() => import('./pages/medical/Diagnosis'));
const Questions = lazy(() => import('./pages/medical/Questions'));

// Family
const Journal = lazy(() => import('./pages/family/Journal'));
const Inventory = lazy(() => import('./pages/family/Inventory'));
const DailyChecklist = lazy(() => import('./pages/family/DailyChecklist'));
const WhatsAppExport = lazy(() => import('./pages/family/WhatsAppExport'));
const CareShifts = lazy(() => import('./pages/family/CareShifts'));

// Care
const Nutrition = lazy(() => import('./pages/care/Nutrition'));
const DailyCare = lazy(() => import('./pages/care/DailyCare'));

// Reference
const Glossary = lazy(() => import('./pages/reference/Glossary'));
const Scenarios = lazy(() => import('./pages/reference/Scenarios'));

// Placeholder for pages still in progress
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-serif text-stone-900 mb-2">{title}</h2>
      <p className="text-sm text-stone-500 max-w-md">
        Esta sección está en construcción. Pronto podrás acceder a toda la información aquí.
      </p>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Login />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />

              {/* Medical Record */}
              <Route path="/medical/diagnosis" element={<Diagnosis />} />
              <Route path="/medical/bodymap" element={<ComingSoon title="Mapa Corporal" />} />
              <Route path="/medical/labs" element={<ComingSoon title="Laboratorios" />} />
              <Route path="/medical/treatment" element={<ComingSoon title="Plan de Tratamiento" />} />
              <Route path="/medical/medications" element={<ComingSoon title="Medicamentos" />} />
              <Route path="/medical/documents" element={<ComingSoon title="Documentos Médicos" />} />
              <Route path="/medical/questions" element={<Questions />} />

              {/* Family Hub */}
              <Route path="/family/shifts" element={<CareShifts />} />
              <Route path="/family/journal" element={<Journal />} />
              <Route path="/family/inventory" element={<Inventory />} />
              <Route path="/family/checklist" element={<DailyChecklist />} />
              <Route path="/family/export" element={<WhatsAppExport />} />

              {/* Care Guide */}
              <Route path="/care/nutrition" element={<Nutrition />} />
              <Route path="/care/daily" element={<DailyCare />} />

              {/* Reference */}
              <Route path="/reference/glossary" element={<Glossary />} />
              <Route path="/reference/scenarios" element={<Scenarios />} />

              {/* AI Chat */}
              <Route path="/chat" element={<Chat />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
