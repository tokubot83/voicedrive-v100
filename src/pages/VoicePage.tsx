import { useState } from 'react';
import Header from '../components/Header';
import ComposeSection from '../components/ComposeSection';
import Timeline from '../components/Timeline';
import { PostType } from '../types';

const VoicePage = () => {
  const [currentTab, setCurrentTab] = useState('voice');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('improvement');
  
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
          <h1 className="text-3xl font-bold mb-6 gradient-text">ボイス</h1>
          <p className="text-gray-400 mb-6">
            組織全体の声を集約し、改善提案や課題を共有するプラットフォームです。
          </p>
          
          <ComposeSection 
            selectedPostType={selectedPostType}
            setSelectedPostType={setSelectedPostType}
          />
          
          <Timeline activeTab="all" />
        </div>
      </div>
    </>
  );
};

export default VoicePage;