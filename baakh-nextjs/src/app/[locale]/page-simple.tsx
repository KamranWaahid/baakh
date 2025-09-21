'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SimpleHomePage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  
  const [stats, setStats] = useState({
    totalPoetry: 0,
    totalPoets: 0,
    totalCategories: 0,
    totalTopics: 0,
    loading: true
  });

  // Simple stats fetch
  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/poetry/count');
        const data = await response.json();
        setStats({
          totalPoetry: data.totalPoetry || 0,
          totalPoets: data.totalPoets || 0,
          totalCategories: data.totalCategories || 0,
          totalTopics: data.totalTopics || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          {isSindhi ? 'سنڌي شاعري جو آرڪائيو' : 'Sindhi Poetry Archive'}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPoetry}</div>
            <div className="text-sm text-blue-800">{isSindhi ? 'شاعري' : 'Poetry'}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalPoets}</div>
            <div className="text-sm text-green-800">{isSindhi ? 'شاعر' : 'Poets'}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalCategories}</div>
            <div className="text-sm text-purple-800">{isSindhi ? 'صنفون' : 'Categories'}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalTopics}</div>
            <div className="text-sm text-orange-800">{isSindhi ? 'موضوع' : 'Topics'}</div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            {isSindhi 
              ? 'سنڌي ادب ۽ ثقافت جي حفاظت ۽ فروغ لاءِ' 
              : 'Preserving and promoting Sindhi literature and culture'
            }
          </p>
          <div className="space-x-4">
            <a href="/poets" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              {isSindhi ? 'شاعر ڏسو' : 'View Poets'}
            </a>
            <a href="/poetry" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              {isSindhi ? 'شاعري ڏسو' : 'View Poetry'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
