'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Globe, Languages } from 'lucide-react';
import { useOptimisticActions } from '@/hooks/useOptimisticActions';
import { backgroundFlusher } from '@/lib/background-flusher';
import { mutationQueue } from '@/lib/mutation-queue';

export default function TestCrossLanguagePage() {
  const [testEntityId, setTestEntityId] = useState('test-couplet-1:test-user-1');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'sd'>('en');
  const [isOnline, setIsOnline] = useState(true);
  const [queueStats, setQueueStats] = useState({ total: 0, pending: 0, failed: 0 });

  const {
    isLiked,
    isBookmarked,
    likeCount,
    isLoading,
    toggleLike,
    toggleBookmark,
    queueStats: hookQueueStats
  } = useOptimisticActions({
    entityId: testEntityId,
    entityType: 'couplet',
    initialLiked: false,
    initialBookmarked: false,
    initialLikeCount: 0,
    enableCrossLanguageSync: true,
    currentLanguage: currentLanguage,
    onStatusChange: (status) => {
      setIsOnline(status === 'online');
    }
  });

  useEffect(() => {
    const updateStats = () => {
      setQueueStats(mutationQueue.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const switchLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'sd' : 'en');
  };

  const clearQueue = () => {
    mutationQueue.clear();
    setQueueStats(mutationQueue.getStats());
  };

  const flushNow = () => {
    backgroundFlusher.flushImmediately();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cross-Language Sync Test
          </h1>
          <p className="text-gray-600">
            Test cross-language synchronization between English and Sindhi
          </p>
        </motion.div>

        {/* Language Switcher */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Language Switcher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={switchLanguage}
                className={`flex items-center gap-2 ${
                  currentLanguage === 'en' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                <Globe className="h-4 w-4" />
                Switch to {currentLanguage === 'en' ? 'Sindhi (سنڌي)' : 'English'}
              </Button>
              <div className="text-sm text-gray-600">
                Current: {currentLanguage === 'en' ? 'English' : 'Sindhi (سنڌي)'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Like Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={toggleLike}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isLiked ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isLiked ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-white' : ''}`} />
                    {isLiked ? 'Unlike' : 'Like'}
                  </motion.button>
                  <div className="text-sm text-gray-600">
                    Count: {likeCount}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Language: {currentLanguage === 'en' ? 'English' : 'Sindhi'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-blue-500" />
                Bookmark Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={toggleBookmark}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isBookmarked ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isBookmarked ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-white' : ''}`} />
                    {isBookmarked ? 'Unbookmark' : 'Bookmark'}
                  </motion.button>
                  <div className="text-sm text-gray-600">
                    {isBookmarked ? 'Bookmarked' : 'Not bookmarked'}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Language: {currentLanguage === 'en' ? 'English' : 'Sindhi'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Cross-Language Sync Test:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Open this page in two browser tabs</li>
                  <li>Set one tab to English and the other to Sindhi</li>
                  <li>Like or bookmark a couplet in one tab</li>
                  <li>Switch to the other tab - the action should be reflected</li>
                  <li>Try switching languages and see the state persist</li>
                </ol>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Animation Test:</h4>
                <ul className="list-disc list-inside space-y-1 text-green-800">
                  <li>Click like/bookmark buttons to see Framer Motion animations</li>
                  <li>Hover over buttons to see scale animations</li>
                  <li>Watch the loading spinners and state transitions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{queueStats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="p-4 bg-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-900">{queueStats.pending}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="p-4 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-900">{queueStats.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button onClick={flushNow} variant="outline" size="sm">
                Flush Now
              </Button>
              <Button onClick={clearQueue} variant="outline" size="sm">
                Clear Queue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Mutations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Mutations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto">
              {mutationQueue.getQueue().slice(-10).map((mutation, index) => (
                <motion.div
                  key={mutation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-xs p-3 bg-gray-100 rounded mb-2"
                >
                  <div className="font-mono">
                    {mutation.op} - {mutation.entityId} - {new Date(mutation.ts).toLocaleTimeString()}
                  </div>
                  <div className="text-gray-500">
                    Attempts: {mutation.attempts || 0} | Cross-language: {mutation.crossLanguage ? 'Yes' : 'No'}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
