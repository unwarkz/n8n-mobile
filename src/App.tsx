/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Layout from './components/Layout';
import InstancesScreen from './screens/InstancesScreen';
import DashboardScreen from './screens/DashboardScreen';
import WorkflowsScreen from './screens/WorkflowsScreen';
import ExecutionsScreen from './screens/ExecutionsScreen';
import CredentialsScreen from './screens/CredentialsScreen';
import UsersScreen from './screens/UsersScreen';
import LogsScreen from './screens/LogsScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const activeInstanceId = useStore((state) => state.activeInstanceId);
  if (!activeInstanceId) {
    return <Navigate to="/instances" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/instances" element={<InstancesScreen />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardScreen />} />
          <Route path="workflows" element={<WorkflowsScreen />} />
          <Route path="executions" element={<ExecutionsScreen />} />
          <Route path="credentials" element={<CredentialsScreen />} />
          <Route path="users" element={<UsersScreen />} />
          <Route path="logs" element={<LogsScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
