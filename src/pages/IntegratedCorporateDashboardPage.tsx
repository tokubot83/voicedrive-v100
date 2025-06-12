import React from 'react';
import Layout from '../components/layout/Layout';
import IntegratedCorporateDashboard from '../components/dashboards/IntegratedCorporateDashboard';
import { useDemoMode } from '../components/demo/DemoModeController';

const IntegratedCorporateDashboardPage: React.FC = () => {
  const { currentUser } = useDemoMode();

  // デバッグ用ログ
  console.log('IntegratedCorporateDashboardPage - Current User:', currentUser);
  console.log('IntegratedCorporateDashboardPage - Permission Level:', currentUser?.permissionLevel);

  return (
    <Layout>
      <IntegratedCorporateDashboard />
    </Layout>
  );
};

export default IntegratedCorporateDashboardPage;