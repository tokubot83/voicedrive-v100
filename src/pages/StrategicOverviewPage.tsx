import Header from '../components/Header';

const StrategicOverviewPage = () => {
  return (
    <>
      <Header 
        currentTab="strategic-overview"
        setCurrentTab={() => {}}
        currentFilter="all"
        setCurrentFilter={() => {}}
        toggleSidebar={() => {}}
      />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">戦略概要</h1>
          <p className="text-gray-400">戦略概要機能は開発中です。</p>
        </div>
      </div>
    </>
  );
};

export default StrategicOverviewPage;