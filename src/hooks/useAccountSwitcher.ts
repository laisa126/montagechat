import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SavedAccount {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  // Encrypted password for quick switching (stored locally only)
  encryptedPassword?: string;
}

const SAVED_ACCOUNTS_KEY = 'montage-saved-accounts';

// Simple obfuscation for local storage (not real encryption, just base64)
const obfuscate = (text: string): string => {
  return btoa(text.split('').reverse().join(''));
};

const deobfuscate = (text: string): string => {
  try {
    return atob(text).split('').reverse().join('');
  } catch {
    return '';
  }
};

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
        return prev.map(a => a.id === account.id ? { ...a, ...account } : a);
      }
      return [...prev, account];
    });
  };

  const removeAccount = (accountId: string) => {
    setSavedAccounts(prev => prev.filter(a => a.id !== accountId));
  };

  const savePassword = (accountId: string, password: string) => {
    setSavedAccounts(prev => 
      prev.map(a => a.id === accountId 
        ? { ...a, encryptedPassword: obfuscate(password) } 
        : a
      )
    );
  };

  const getStoredPassword = (accountId: string): string | null => {
    const account = savedAccounts.find(a => a.id === accountId);
    if (account?.encryptedPassword) {
      return deobfuscate(account.encryptedPassword);
    }
    return null;
  };

  const hasStoredPassword = (accountId: string): boolean => {
    const account = savedAccounts.find(a => a.id === accountId);
    return !!account?.encryptedPassword;
  };

  const switchAccount = async (email: string, password: string) => {
    // First sign out current user
    await supabase.auth.signOut();
    
    // Then sign in with new account
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // If successful, save the password for quick switching next time
    if (!error && data.user) {
      const account = savedAccounts.find(a => a.email === email);
      if (account) {
        savePassword(account.id, password);
      }
    }

    return { error: error?.message || null, userId: data?.user?.id };
  };

  const quickSwitch = async (accountId: string) => {
    const account = savedAccounts.find(a => a.id === accountId);
    if (!account) return { error: 'Account not found' };
    
    const password = getStoredPassword(accountId);
    if (!password) return { error: 'Password not saved', needsPassword: true };
    
    return switchAccount(account.email, password);
  };

  const saveCurrentAccount = async (profile: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string | null;
  }, email: string, password?: string) => {
    const existingAccount = savedAccounts.find(a => a.id === profile.user_id);
    
    addAccount({
      id: profile.user_id,
      email,
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url || undefined,
      encryptedPassword: password ? obfuscate(password) : existingAccount?.encryptedPassword
    });
  };

  const clearStoredPassword = (accountId: string) => {
    setSavedAccounts(prev => 
      prev.map(a => a.id === accountId 
        ? { ...a, encryptedPassword: undefined } 
        : a
      )
    );
  };

  return {
    savedAccounts,
    addAccount,
    removeAccount,
    switchAccount,
    quickSwitch,
    saveCurrentAccount,
    hasStoredPassword,
    clearStoredPassword,
    savePassword
  };
};
