import React from 'react';
import Layout from '../components/layout/Layout';
import IntegratedCorporateDashboard from '../components/dashboards/IntegratedCorporateDashboard';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { useDemoMode } from '../components/demo/DemoModeController';
import { Navigate } from 'react-router-dom';

const IntegratedCorporateDashboardPage: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions(currentUser.id);

  // レベル5以上のみアクセス可能
  if (currentUser.permissionLevel < 5) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Layout>
      <IntegratedCorporateDashboard />
    </Layout>
  );
};

export default IntegratedCorporateDashboardPage;