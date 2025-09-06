import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-gray-500 text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8 text-lg">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/en"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
