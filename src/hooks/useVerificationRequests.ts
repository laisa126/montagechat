import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VerificationRequest {
  id: string;
  user_id: string;
  full_name: string;
  known_as: string | null;
  category: string;
  id_document_url: string | null;
  additional_info: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
}

export const useVerificationRequests = (currentUserId?: string, isAdmin?: boolean) => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [myRequest, setMyRequest] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUserId) {
      fetchMyRequest();
      if (isAdmin) {
        fetchAllRequests();
      }
    }
  }, [currentUserId, isAdmin]);

  const fetchMyRequest = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (!error && data) {
      setMyRequest(data as VerificationRequest);
    }
    setLoading(false);
  };

  const fetchAllRequests = async () => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select(`
        *,
        profiles!verification_requests_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedRequests = data.map((req: any) => ({
        ...req,
        username: req.profiles?.username,
        display_name: req.profiles?.display_name,
        avatar_url: req.profiles?.avatar_url
      }));
      setRequests(mappedRequests);
    }
    setLoading(false);
  };

  const submitRequest = async (data: {
    fullName: string;
    knownAs?: string;
    category: string;
    documentUrl?: string;
    additionalInfo?: string;
  }) => {
    if (!currentUserId) return { error: 'Not authenticated' };

    const { error } = await supabase.from('verification_requests').insert({
      user_id: currentUserId,
      full_name: data.fullName,
      known_as: data.knownAs || null,
      category: data.category,
      id_document_url: data.documentUrl || null,
      additional_info: data.additionalInfo || null
    });

    if (error) {
      if (error.code === '23505') {
        return { error: 'You already have a pending verification request' };
      }
      return { error: error.message };
    }

    await fetchMyRequest();
    return { error: null };
  };

  const updateRequestStatus = async (
    requestId: string, 
    status: 'approved' | 'rejected',
    reviewerId: string
  ) => {
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (!error) {
      // If approved, also update the user's verified status
      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          await supabase.rpc('verify_user', {
            target_user_id: request.user_id,
            verified: true
          });
        }
      }
      await fetchAllRequests();
    }

    return { error: error?.message || null };
  };

  const uploadDocument = async (file: File): Promise<{ url: string | null; error: string | null }> => {
    if (!currentUserId) return { url: null, error: 'Not authenticated' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(fileName, file);

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    // For private buckets, we store the path, not public URL
    return { url: fileName, error: null };
  };

  return {
    requests,
    myRequest,
    loading,
    submitRequest,
    updateRequestStatus,
    uploadDocument,
    refetch: isAdmin ? fetchAllRequests : fetchMyRequest
  };
};
