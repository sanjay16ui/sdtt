import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts';
import { ROUTES } from '@/config/routes';

import {
  Home,
  Dashboard,
  LiveProtection,
  Alerts,
  Subjects,
  Releases,
  Provenance,
  RiskIntelligence,
  Multimodal,
  MemoryCache,
  Policies,
  AuditLedger,
  Reports,
  ModelProviders,
  ScatterCortex,
  Settings
} from '@/pages';

export function AppRouter() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path={ROUTES.HOME} element={<Home />} />

      {/* Main Console Routes */}
      <Route path={ROUTES.DASHBOARD} element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path={ROUTES.LIVE} element={<MainLayout><LiveProtection /></MainLayout>} />
      <Route path={ROUTES.ALERTS} element={<MainLayout><Alerts /></MainLayout>} />
      <Route path={ROUTES.SUBJECTS} element={<MainLayout><Subjects /></MainLayout>} />
      <Route path={ROUTES.RELEASES} element={<MainLayout><Releases /></MainLayout>} />
      <Route path={ROUTES.PROVENANCE} element={<MainLayout><Provenance /></MainLayout>} />
      <Route path={ROUTES.RISK} element={<MainLayout><RiskIntelligence /></MainLayout>} />
      <Route path={ROUTES.MULTIMODAL} element={<MainLayout><Multimodal /></MainLayout>} />
      <Route path={ROUTES.MEMORY_CACHE} element={<MainLayout><MemoryCache /></MainLayout>} />
      <Route path={ROUTES.POLICIES} element={<MainLayout><Policies /></MainLayout>} />
      <Route path={ROUTES.AUDIT} element={<MainLayout><AuditLedger /></MainLayout>} />
      <Route path={ROUTES.REPORTS} element={<MainLayout><Reports /></MainLayout>} />
      <Route path={ROUTES.PROVIDERS} element={<MainLayout><ModelProviders /></MainLayout>} />
      <Route path={ROUTES.SCATTER_CORTEX} element={<MainLayout><ScatterCortex /></MainLayout>} />
      <Route path={ROUTES.SETTINGS} element={<MainLayout><Settings /></MainLayout>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}

export default AppRouter;
