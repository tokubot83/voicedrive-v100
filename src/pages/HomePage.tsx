import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ComposeSection from '../components/ComposeSection';
import ComposeForm from '../components/ComposeForm';
import Timeline from '../components/Timeline';
import { PostType } from '../types';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState('home');
  const [currentFilter, setCurrentFilter] = useState('latest');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('improvement');
  const [showComposeForm, setShowComposeForm] = useState(false);

  // URLパラメータから初期状態を設定
  useEffect(() => {
    const tab = searchParams.get('tab') || 'home';
    const filter = searchParams.get('filter');
    const action = searchParams.get('action');

    setCurrentTab(tab);
    
    if (filter) {
      setCurrentFilter(filter);
    } else {
      // タブに応じたデフォルトフィルターを設定
      if (tab === 'improvement') {
        setCurrentFilter('new');
      } else if (tab === 'community') {
        setCurrentFilter('new');
      } else {
        setCurrentFilter('latest');
      }
    }

    // 投稿フォーム表示の判定
    if (action === 'compose' && (tab === 'improvement' || tab === 'community')) {
      setSelectedPostType(tab as PostType);
      setShowComposeForm(true);
    }
  }, [searchParams]);
  
  // Update default filter when tab changes
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    // URLパラメータを更新
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'home') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', tab);
    }
    setSearchParams(newParams);
    
    // Set appropriate default filter for each tab
    if (tab === 'improvement') {
      setCurrentFilter('new');
    } else if (tab === 'community') {
      setCurrentFilter('new');
    } else if (tab === 'home') {
      setCurrentFilter('latest');
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
      <Header 
        toggleSidebar={() => {}} // Not needed in router version
      />
      
      <div className="overflow-y-auto">
        {/* 投稿フォーム表示 */}
        {showComposeForm && (
          <ComposeForm 
            selectedType={selectedPostType}
            onCancel={() => {
              setShowComposeForm(false);
              // URLパラメータからactionを削除
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('action');
              setSearchParams(newParams);
            }}
          />
        )}

        {/* Home tab content */}
        {currentTab === 'home' && !showComposeForm && (
          <>
            <ComposeSection 
              selectedPostType={selectedPostType}
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline activeTab="all" />
          </>
        )}
        
        {/* Improvement tab content with sub-filters */}
        {currentTab === 'improvement' && !showComposeForm && (
          <>
            <ComposeSection 
              selectedPostType="improvement"
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline activeTab="improvement" />
          </>
        )}
        
        {/* Community tab content */}
        {currentTab === 'community' && !showComposeForm && (
          <>
            <ComposeSection 
              selectedPostType="community"
              setSelectedPostType={setSelectedPostType}
            />
            <Timeline activeTab="community" />
          </>
        )}
        
        {/* Urgent tab content */}
        {currentTab === 'urgent' && !showComposeForm && (
          <>
            <Timeline activeTab="urgent" />
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;