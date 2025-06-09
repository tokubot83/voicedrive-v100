import Header from '../components/Header';

const PolicyManagementPage = () => {
  return (
    <>
      <Header 
        currentTab="policy"
        setCurrentTab={() => {}}
        currentFilter="all"
        setCurrentFilter={() => {}}
        toggleSidebar={() => {}}
      />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">ポリシー管理</h1>
          <p className="text-gray-400">ポリシー管理機能は開発中です。</p>
        </div>
      </div>
    </>
  );
};

export default PolicyManagementPage;