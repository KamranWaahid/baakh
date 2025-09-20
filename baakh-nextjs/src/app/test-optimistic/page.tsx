'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useOptimisticActions } from '@/hooks/useOptimisticActions';
import { backgroundFlusher } from '@/lib/background-flusher';
import { mutationQueue } from '@/lib/mutation-queue';
import { Globe, Languages } from 'lucide-react';

export default function TestOptimisticPage() {
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

  const simulateOffline = () => {
    // Simulate offline by disabling network
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    window.dispatchEvent(new Event('offline'));
  };

  const simulateOnline = () => {
    // Simulate online by enabling network
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    window.dispatchEvent(new Event('online'));
  };

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
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Optimistic Actions Test
          </h1>
          <p className="text-gray-600">
            Test the optimistic like and bookmark functionality
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

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </p>
              <div className="mt-4 space-y-2">
                <Button
                  onClick={simulateOffline}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Simulate Offline
                </Button>
                <Button
                  onClick={simulateOnline}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Simulate Online
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-blue-500" />
                Queue Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>Total: {queueStats.total}</p>
                <p>Pending: {queueStats.pending}</p>
                <p>Failed: {queueStats.failed}</p>
              </div>
              <div className="mt-4 space-y-2">
                <Button
                  onClick={flushNow}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Flush Now
                </Button>
                <Button
                  onClick={clearQueue}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear Queue
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Entity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <input
                  type="text"
                  value={testEntityId}
                  onChange={(e) => setTestEntityId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="entityId:userId"
                />
                <p className="text-xs text-gray-500">
                  Format: coupletId:userId
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Like Actions</h3>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={toggleLike}
                    disabled={isLoading}
                    className={`flex items-center gap-2 ${
                      isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-white' : ''}`} />
                    {isLiked ? 'Unlike' : 'Like'}
                  </Button>
                  <div className="text-sm text-gray-600">
                    Count: {likeCount}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Bookmark Actions</h3>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={toggleBookmark}
                    disabled={isLoading}
                    className={`flex items-center gap-2 ${
                      isBookmarked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-white' : ''}`} />
                    {isBookmarked ? 'Unbookmark' : 'Bookmark'}
                  </Button>
                  <div className="text-sm text-gray-600">
                    {isBookmarked ? 'Bookmarked' : 'Not bookmarked'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Entity ID: {testEntityId}</p>
                <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
                <p>Hook Queue Stats: {JSON.stringify(hookQueueStats)}</p>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recent Mutations</h4>
                <div className="max-h-40 overflow-y-auto">
                  {mutationQueue.getQueue().slice(-10).map((mutation, index) => (
                    <div
                      key={mutation.id}
                      className="text-xs p-2 bg-gray-100 rounded mb-1"
                    >
                      <div className="font-mono">
                        {mutation.op} - {mutation.entityId} - {new Date(mutation.ts).toLocaleTimeString()}
                      </div>
                      <div className="text-gray-500">
                        Attempts: {mutation.attempts || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
