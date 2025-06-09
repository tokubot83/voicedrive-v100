import { useState } from 'react';
import Header from '../components/Header';
import Timeline from '../components/Timeline';
import { useDemoMode } from '../components/demo/DemoModeController';

const MyPostsPage = () => {
  const [currentTab, setCurrentTab] = useState('my-posts');
  const [currentFilter, setCurrentFilter] = useState('all');
  const { currentUser } = useDemoMode();
  
  return (
    <>
      <Header 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        toggleSidebar={() => {}}
      />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">マイ投稿</h1>
          <p className="text-gray-400 mb-6">
            {currentUser.name}さんの投稿履歴
          </p>
          
          {/* Filter posts by current user */}
          <Timeline activeTab="all" filterByUser={currentUser.id} />
        </div>
      </div>
    </>
  );
};

export default MyPostsPage;