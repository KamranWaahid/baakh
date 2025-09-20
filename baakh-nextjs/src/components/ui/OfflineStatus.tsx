'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { backgroundFlusher } from '@/lib/background-flusher';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineStatusProps {
  isSindhi?: boolean;
  className?: string;
}

export function OfflineStatus({ isSindhi = false, className = '' }: OfflineStatusProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'syncing' | 'error'>('online');
  const [queueStats, setQueueStats] = useState({ total: 0, pending: 0, failed: 0 });

  useEffect(() => {
    // Get initial status
    const initialStatus = backgroundFlusher.getStatus();
    setStatus(initialStatus.isOnline ? 'online' : 'offline');
    setQueueStats(initialStatus.queueStats);

    const intervalId = setInterval(() => {
      const current = backgroundFlusher.getStatus();
      // Only show offline status, not syncing
      setStatus((prev) => {
        const next = current.isOnline ? 'online' : 'offline';
        return prev !== next ? next : prev;
      });
      setQueueStats((prev) => {
        const qs = current.queueStats;
        const changed = prev.total !== qs.total || prev.pending !== qs.pending || prev.failed !== qs.failed;
        return changed ? qs : prev;
      });
    }, 1000);

    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show offline status
  if (status === 'online') {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'offline':
        return {
          icon: WifiOff,
          text: isSindhi ? 'آف لائن' : 'Offline',
          className: 'text-amber-600 bg-amber-50 border-amber-200',
          description: isSindhi ? 'ڪم آف لائن محفوظ ٿي رهيو آهي' : 'Work is being saved offline'
        };
      case 'error':
        return {
          icon: WifiOff,
          text: isSindhi ? 'خرابي' : 'Error',
          className: 'text-red-600 bg-red-50 border-red-200',
          description: isSindhi ? 'تبديلون محفوظ ڪرڻ ۾ مسئلو' : 'Error saving changes'
        };
      default:
        return {
          icon: Wifi,
          text: isSindhi ? 'آن لائن' : 'Online',
          className: 'text-green-600 bg-green-50 border-green-200',
          description: isSindhi ? 'تبديلون محفوظ ٿي ويون' : 'Changes saved'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 ${className}`}
      >
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium shadow-lg ${config.className}`}>
          <Icon className={`h-4 w-4 ${status === 'syncing' ? 'animate-spin' : ''}`} />
          <span>{config.text}</span>
          {queueStats.pending > 0 && (
            <span className="px-2 py-1 bg-white/50 rounded-full text-xs">
              {queueStats.pending}
            </span>
          )}
        </div>
        
        {/* Tooltip with description */}
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
          {config.description}
          {queueStats.pending > 0 && (
            <div className="mt-1">
              {isSindhi ? `${queueStats.pending} تبديلون بقي آهن` : `${queueStats.pending} changes pending`}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
