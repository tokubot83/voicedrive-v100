import Header from '../components/Header';

const ExecutiveReportsPage = () => {
  return (
    <>
      <Header 
        toggleSidebar={() => {}}
      />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">エグゼクティブレポート</h1>
          <p className="text-gray-400">エグゼクティブレポート機能は開発中です。</p>
        </div>
      </div>
    </>
  );
};

export default ExecutiveReportsPage;