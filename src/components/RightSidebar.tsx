import React from 'react';
import ModeAwareRightSidebar from './sidebar/ModeAwareRightSidebar';

/**
 * 右サイドバーコンポーネント
 * システムモードに応じて適切なサイドバー内容を表示
 */
const RightSidebar: React.FC = () => {
  return <ModeAwareRightSidebar />;
};

export default RightSidebar;