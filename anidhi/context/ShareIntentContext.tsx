import React, { createContext, useContext, ReactNode } from 'react';
import { useShareIntent, ShareIntent } from 'expo-share-intent';

interface ShareIntentContextType {
  hasShareIntent: boolean;
  shareIntent: ShareIntent | null;
  resetShareIntent: () => void;
  error: string | null;
}

const ShareIntentContext = createContext<ShareIntentContextType>({
  hasShareIntent: false,
  shareIntent: null,
  resetShareIntent: () => {},
  error: null,
});

interface ShareIntentProviderProps {
  children: ReactNode;
}

export const ShareIntentProvider: React.FC<ShareIntentProviderProps> = ({ children }) => {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();

  return (
    <ShareIntentContext.Provider
      value={{
        hasShareIntent,
        shareIntent,
        resetShareIntent,
        error,
      }}
    >
      {children}
    </ShareIntentContext.Provider>
  );
};

export const useShareIntentContext = () => {
  const context = useContext(ShareIntentContext);
  if (context === undefined) {
    throw new Error('useShareIntentContext must be used within a ShareIntentProvider');
  }
  return context;
};
