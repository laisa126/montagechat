import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchHistoryItem {
  id: string;
  search_type: 'account' | 'hashtag' | 'audio' | 'post';
  search_value: string;
  result_id: string | null;
  result_title: string;
  result_subtitle: string | null;
  searched_at: string;
}

export const useSearchHistory = (userId?: string) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('searched_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory((data as SearchHistoryItem[]) || []);
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToHistory = useCallback(async (item: {
    search_type: 'account' | 'hashtag' | 'audio' | 'post';
    search_value: string;
    result_id?: string;
    result_title: string;
    result_subtitle?: string;
  }) => {
    if (!userId) return;

    try {
      // Remove duplicate if exists
      await supabase
        .from('search_history')
        .delete()
        .eq('user_id', userId)
        .eq('search_type', item.search_type)
        .eq('result_title', item.result_title);

      // Add new entry
      const { data, error } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          search_type: item.search_type,
          search_value: item.search_value,
          result_id: item.result_id || null,
          result_title: item.result_title,
          result_subtitle: item.result_subtitle || null
        } as any)
        .select()
        .single();

      if (error) throw error;
      
      const typedData = data as SearchHistoryItem;
      setHistory(prev => [typedData, ...prev.filter(h => 
        !(h.search_type === item.search_type && h.result_title === item.result_title)
      )].slice(0, 20));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }, [userId]);

  const removeFromHistory = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }, [userId]);

  const clearHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      setHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    refetch: fetchHistory
  };
};
