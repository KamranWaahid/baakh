'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface NonceContextType {
  nonce: string | null;
}

const NonceContext = createContext<NonceContextType>({ nonce: null });

export function NonceProvider({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  const [clientNonce, setClientNonce] = useState<string | null>(nonce || null);

  useEffect(() => {
    // If no nonce is provided, try to get it from the server
    if (!clientNonce) {
      // This is a fallback - in production, the nonce should be provided by the server
      setClientNonce('fallback-nonce');
    }
  }, [clientNonce]);

  return (
    <NonceContext.Provider value={{ nonce: clientNonce }}>
      {children}
    </NonceContext.Provider>
  );
}

export function useNonce() {
  const context = useContext(NonceContext);
  if (context === undefined) {
    throw new Error('useNonce must be used within a NonceProvider');
  }
  return context.nonce;
}
