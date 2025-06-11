import { Link } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const UnauthorizedPage = () => {
  const { userLevel, userRole, accountType } = usePermissions();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-9xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-white mb-4">アクセス権限がありません</h1>
        <p className="text-gray-400 mb-2">
          このページにアクセスするには適切な権限が必要です。
        </p>
        <p className="text-gray-500 text-sm mb-8">
          現在の権限レベル: {accountType} (Level {userLevel})
        </p>
        <Link 
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ホームに戻る
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;