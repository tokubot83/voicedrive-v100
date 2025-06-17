import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-500/20 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">ページが見つかりません</h2>
        <p className="text-gray-400 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link 
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ← ホーム
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;