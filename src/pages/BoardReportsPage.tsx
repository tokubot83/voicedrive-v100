import Header from '../components/Header';

const BoardReportsPage = () => {
  return (
    <>
      <Header toggleSidebar={() => {}} />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">理事会レポート</h1>
          <p className="text-gray-400">理事会レポート機能は開発中です。</p>
        </div>
      </div>
    </>
  );
};

export default BoardReportsPage;