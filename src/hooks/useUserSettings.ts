import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserSettings {
  language: string;
  push_notifications: boolean;
  email_notifications: boolean;
  private_account: boolean;
  show_activity_status: boolean;
  allow_mentions: boolean;
  allow_tags: boolean;
  hide_like_count: boolean;
}

const defaultSettings: UserSettings = {
  language: 'en',
  push_notifications: true,
  email_notifications: true,
  private_account: false,
  show_activity_status: true,
  allow_mentions: true,
  allow_tags: true,
  hide_like_count: false
};

export const useUserSettings = (userId?: string) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching settings:', error);
        }

        if (data) {
          setSettings({
            language: data.language || 'en',
            push_notifications: data.push_notifications ?? true,
            email_notifications: data.email_notifications ?? true,
            private_account: data.private_account ?? false,
            show_activity_status: data.show_activity_status ?? true,
            allow_mentions: data.allow_mentions ?? true,
            allow_tags: data.allow_tags ?? true,
            hide_like_count: data.hide_like_count ?? false
          });
        }
      } catch (err) {
        console.error('Settings fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!userId) return { error: 'No user ID' };

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          ...updates,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      return { error: null };
    } catch (err: any) {
      console.error('Settings update error:', err);
      return { error: err.message };
    }
  }, [userId, settings]);

  return { settings, isLoading, updateSettings };
};
