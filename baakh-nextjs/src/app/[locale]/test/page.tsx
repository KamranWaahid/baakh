'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Test Page - UI is Working!
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        If you can see this page, your Next.js application is working correctly.
      </p>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong>Success!</strong> Your application is running properly.
      </div>
    </div>
  );
}


