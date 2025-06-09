import Header from '../components/Header';

const ExecutiveOverviewPage = () => {
  return (
    <>
      <Header 
        currentTab="executive-overview"
        setCurrentTab={() => {}}
        currentFilter="all"
        setCurrentFilter={() => {}}
        toggleSidebar={() => {}}
      />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">経営概要</h1>
          <p className="text-gray-400">経営概要機能は開発中です。</p>
        </div>
      </div>
    </>
  );
};

export default ExecutiveOverviewPage;