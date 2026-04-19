import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Layout from './components/layout/Layout';

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Chat = lazy(() => import('./pages/Chat'));

// Medical
const Diagnosis = lazy(() => import('./pages/medical/Diagnosis'));
const Questions = lazy(() => import('./pages/medical/Questions'));
const LabResults = lazy(() => import('./pages/medical/LabResults'));
const BodyMap = lazy(() => import('./pages/medical/BodyMapEnhanced'));
const Documents = lazy(() => import('./pages/medical/Documents'));
const Treatment = lazy(() => import('./pages/medical/Treatment'));
const Medications = lazy(() => import('./pages/medical/Medications'));

// Family
const Journal = lazy(() => import('./pages/family/Journal'));
const Inventory = lazy(() => import('./pages/family/Inventory'));
const DailyChecklist = lazy(() => import('./pages/family/DailyChecklist'));
const WhatsAppExport = lazy(() => import('./pages/family/WhatsAppExport'));
const CareShifts = lazy(() => import('./pages/family/CareShifts'));
const GiftRequests = lazy(() => import('./pages/family/GiftRequests'));

// Care
const Nutrition = lazy(() => import('./pages/care/Nutrition'));
const DailyCare = lazy(() => import('./pages/care/DailyCare'));

// Reference
const Glossary = lazy(() => import('./pages/reference/Glossary'));
const Scenarios = lazy(() => import('./pages/reference/Scenarios'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin login — standalone page, no layout */}
            <Route path="/admin/login" element={<Login />} />

            {/* All pages are public — no ProtectedRoute */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />

              {/* Medical Record */}
              <Route path="/medical/diagnosis" element={<Diagnosis />} />
              <Route path="/medical/bodymap" element={<BodyMap />} />
              <Route path="/medical/labs" element={<LabResults />} />
              <Route path="/medical/treatment" element={<Treatment />} />
              <Route path="/medical/medications" element={<Medications />} />
              <Route path="/medical/documents" element={<Documents />} />
              <Route path="/medical/questions" element={<Questions />} />

              {/* Family Hub */}
              <Route path="/family/shifts" element={<CareShifts />} />
              <Route path="/family/journal" element={<Journal />} />
              <Route path="/family/inventory" element={<Inventory />} />
              <Route path="/family/gifts" element={<GiftRequests />} />
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
