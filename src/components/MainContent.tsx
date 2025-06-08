import { useState } from 'react';
import Header from './Header';
import ComposeSection from './ComposeSection';
import Timeline from './Timeline';
import EnhancedTimeline from './EnhancedTimeline';
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
  
  // Update default filter when tab changes
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    // Set appropriate default filter for each tab
    if (tab === 'improvement') {
      setCurrentFilter('proposals');
    } else if (tab === 'home') {
      setCurrentFilter('latest');
    } else {
      setCurrentFilter('all');
    }
  };

  return (
    <main className="flex-1 border-r border-gray-800/50 max-w-[600px] bg-black/20 backdrop-blur-lg">
      <Header 
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="overflow-y-auto">
        {/* Home tab content */}
        {currentTab === 'home' && (
          <>
            <ComposeSection 
              selectedPostType={selectedPostType}
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline />
          </>
        )}
        
        {/* Improvement tab content with sub-filters */}
        {currentTab === 'improvement' && (
          <>
            <ComposeSection 
              selectedPostType="improvement"
              setSelectedPostType={setSelectedPostType}
            />
            <EnhancedTimeline filter={currentFilter} />
          </>
        )}
        
        {/* Community tab content */}
        {currentTab === 'community' && (
          <>
            <ComposeSection 
              selectedPostType="community"
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline />
          </>
        )}
        
        {/* Report tab content */}
        {currentTab === 'report' && (
          <>
            <ComposeSection 
              selectedPostType="report"
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline />
          </>
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