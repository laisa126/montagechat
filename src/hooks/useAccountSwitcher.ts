import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SavedAccount {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

const SAVED_ACCOUNTS_KEY = 'montage-saved-accounts';

export const useAccountSwitcher = () => {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(savedAccounts));
  }, [savedAccounts]);

  const addAccount = (account: SavedAccount) => {
    setSavedAccounts(prev => {
      // Don't add duplicates
      if (prev.some(a => a.id === account.id)) {
        return prev.map(a => a.id === account.id ? account : a);
      }
      return [...prev, account];
    });
  };

  const removeAccount = (accountId: string) => {
    setSavedAccounts(prev => prev.filter(a => a.id !== accountId));
  };

  const switchAccount = async (email: string, password: string) => {
    // First sign out current user
    await supabase.auth.signOut();
    
    // Then sign in with new account
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error: error?.message || null };
  };

  const saveCurrentAccount = async (profile: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string | null;
  }, email: string) => {
    addAccount({
      id: profile.user_id,
      email,
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url || undefined
    });
  };

  return {
    savedAccounts,
    addAccount,
    removeAccount,
    switchAccount,
    saveCurrentAccount
  };
};
