import { useState } from 'react';
import Header from './Header';
import ComposeSection from './ComposeSection';
import Timeline from './Timeline';
import { PostType } from '../types';

interface MainContentProps {
  currentPage: string;
  selectedPostType: PostType;
  setSelectedPostType: (type: PostType) => void;
  toggleSidebar: () => void;
}

const MainContent = ({ currentPage, selectedPostType, setSelectedPostType, toggleSidebar }: MainContentProps) => {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentFilter, setCurrentFilter] = useState('latest');

  return (
    <main className="flex-1 border-r border-gray-800/50 max-w-[600px] bg-black/20 backdrop-blur-lg">
      <Header 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="overflow-y-auto">
        {currentPage === 'home' && (
          <>
            <ComposeSection 
              selectedPostType={selectedPostType}
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline />
          </>
        )}
        
        {currentPage === 'improvement' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">改善提案</h2>
            <p className="text-gray-400">改善提案の一覧がここに表示されます</p>
          </div>
        )}
        
        {currentPage === 'community' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">コミュニティ</h2>
            <p className="text-gray-400">コミュニティ投稿がここに表示されます</p>
          </div>
        )}
        
        {currentPage === 'report' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">公益通報</h2>
            <p className="text-gray-400">公益通報の一覧がここに表示されます</p>
          </div>
        )}
        
        {currentPage === 'projects' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">プロジェクト</h2>
            <p className="text-gray-400">進行中のプロジェクトがここに表示されます</p>
          </div>
        )}
        
        {currentPage === 'analytics' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">分析</h2>
            <p className="text-gray-400">統計と分析データがここに表示されます</p>
          </div>
        )}
        
        {currentPage === 'notifications' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">通知</h2>
            <p className="text-gray-400">通知がここに表示されます</p>
          </div>
        )}
        
        {currentPage === 'profile' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">プロフィール</h2>
            <p className="text-gray-400">プロフィール情報がここに表示されます</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;