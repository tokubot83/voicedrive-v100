import { useState } from 'react';
import Header from '../components/Header';
import ComposeSection from '../components/ComposeSection';
import Timeline from '../components/Timeline';
import { PostType } from '../types';

const HomePage = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentFilter, setCurrentFilter] = useState('latest');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('improvement');
  
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
    <>
      <Header 
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        toggleSidebar={() => {}} // Not needed in router version
      />
      
      <div className="overflow-y-auto">
        {/* Home tab content */}
        {currentTab === 'home' && (
          <>
            <ComposeSection 
              selectedPostType={selectedPostType}
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline activeTab="all" />
          </>
        )}
        
        {/* Improvement tab content with sub-filters */}
        {currentTab === 'improvement' && (
          <>
            <ComposeSection 
              selectedPostType="improvement"
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline activeTab="improvement" />
          </>
        )}
        
        {/* Community tab content */}
        {currentTab === 'community' && (
          <>
            <ComposeSection 
              selectedPostType="community"
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline activeTab="community" />
          </>
        )}
        
        {/* Report tab content */}
        {currentTab === 'report' && (
          <>
            <ComposeSection 
              selectedPostType="report"
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline activeTab="report" />
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;