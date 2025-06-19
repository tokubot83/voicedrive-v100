import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ComposeSection from '../components/ComposeSection';
import Timeline from '../components/Timeline';
import { PostType } from '../types';
import { useDemoMode } from '../components/demo/DemoModeController';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDemoMode } = useDemoMode();
  const [currentTab, setCurrentTab] = useState('improvement');
  const [currentFilter, setCurrentFilter] = useState('latest');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('improvement');
  // URLパラメータから初期状態を設定
  useEffect(() => {
    const tab = searchParams.get('tab') || 'improvement';
    const filter = searchParams.get('filter');

    setCurrentTab(tab);
    
    if (filter) {
      setCurrentFilter(filter);
    } else {
      // タブに応じたデフォルトフィルターを設定
      if (tab === 'improvement') {
        setCurrentFilter('new');
      } else if (tab === 'freevoice') {
        setCurrentFilter('new');
      } else {
        setCurrentFilter('latest');
      }
    }
  }, [searchParams]);
  
  // Update default filter when tab changes
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    // URLパラメータを更新
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
    
    // Set appropriate default filter for each tab
    if (tab === 'improvement') {
      setCurrentFilter('new');
    } else if (tab === 'freevoice') {
      setCurrentFilter('new');
    } else {
      setCurrentFilter('all');
    }
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    // URLパラメータを更新
    const newParams = new URLSearchParams(searchParams);
    newParams.set('filter', filter);
    setSearchParams(newParams);
  };

  return (
    <>
      <div className="overflow-y-auto">
        
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
        
        {/* Urgent tab content */}
        {currentTab === 'urgent' && (
          <>
            <Timeline activeTab="urgent" />
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;