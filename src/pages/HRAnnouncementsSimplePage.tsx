import React from 'react';

const HRAnnouncementsSimplePage: React.FC = () => {
  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0f1419' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>人事お知らせページ（テスト）</h1>
      <p>このページが表示されれば、ルーティングは正常に動作しています。</p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1a1a2e', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', color: '#10b981' }}>✅ ルーティング：正常</h2>
        <p style={{ marginTop: '10px', color: '#71767b' }}>
          次は実際の人事お知らせコンポーネントを表示します。
        </p>
      </div>
    </div>
  );
};

export default HRAnnouncementsSimplePage;