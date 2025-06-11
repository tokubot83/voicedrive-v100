import Header from '../components/Header';

const HRDashboardPage = () => {
  return (
    <>
      <Header 
        toggleSidebar={() => {}}
      />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">人事ダッシュボード</h1>
          <p className="text-gray-400">人事ダッシュボード機能は開発中です。</p>
        </div>
      </div>
    </>
  );
};

export default HRDashboardPage;