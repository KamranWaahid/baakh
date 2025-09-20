import { useState } from 'react';
import { useE2EEAuth } from './useE2EEAuth-new';

export function useAuthRequired() {
  const { isAuthenticated, user } = useE2EEAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authContext, setAuthContext] = useState<'like' | 'bookmark' | 'general'>('general');

  const requireAuth = (callback: () => void, context: 'like' | 'bookmark' | 'general' = 'general') => {
    if (!isAuthenticated) {
      setAuthContext(context);
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return {
    isAuthenticated,
    user,
    showAuthModal,
    authContext,
    requireAuth,
    closeAuthModal
  };
}
