import Header from '../components/Header';

const TalentAnalyticsPage = () => {
  return (
    <>
      <Header 
        currentTab="talent"
        setCurrentTab={() => {}}
        currentFilter="all"
        setCurrentFilter={() => {}}
        toggleSidebar={() => {}}
      />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">タレント分析</h1>
          <p className="text-gray-400">タレント分析機能は開発中です。</p>
        </div>
      </div>
    </>
  );
};

export default TalentAnalyticsPage;