// =============================================================================
// RELIEFROUTE: React Router & Application Routing Entrypoint
// =============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';

// 13 Navigation Pages
import { DashboardPage } from './pages/DashboardPage';
import { DisastersPage } from './pages/DisastersPage';
import { EmergencyRequestsPage } from './pages/EmergencyRequestsPage';
import { PriorityAssessmentPage } from './pages/PriorityAssessmentPage';
import { MapPage } from './pages/MapPage';
import { ReliefCentresPage } from './pages/ReliefCentresPage';
import { InventoryPage } from './pages/InventoryPage';
import { AllocationPage } from './pages/AllocationPage';
import { DeliveryTrackingPage } from './pages/DeliveryTrackingPage';
import { ScenarioSimulationPage } from './pages/ScenarioSimulationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="disasters" element={<DisastersPage />} />
              <Route path="requests" element={<EmergencyRequestsPage />} />
              <Route path="priority" element={<PriorityAssessmentPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="relief-centres" element={<ReliefCentresPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="allocation" element={<AllocationPage />} />
              <Route path="deliveries" element={<DeliveryTrackingPage />} />
              <Route path="simulation" element={<ScenarioSimulationPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
