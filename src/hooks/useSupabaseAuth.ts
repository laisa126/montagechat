import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  is_private: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile after auth state change
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!error && !!data);
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username.toLowerCase().replace(/\s+/g, ''),
          display_name: displayName
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'An account with this email already exists' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const signIn = async (identifier: string, password: string) => {
    // Check if identifier is an email or username
    const isEmail = identifier.includes('@');
    
    let emailToUse = identifier;
    
    if (!isEmail) {
      // Username login - first find the user's email from profiles
      // We need to get the email associated with this username
      // Since profiles are linked to auth.users, we'll try a different approach
      // For now, we'll inform users to use email for login with username
      // In production, you'd create an edge function to handle this securely
      
      // Try to find a profile with this username and get associated email
      // This is a simplified approach - in production use an edge function
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', identifier.toLowerCase())
        .maybeSingle();

      if (profileError || !profileData) {
        return { error: 'Invalid username or password' };
      }

      // For username login, we need to find the email
      // Since we can't directly query auth.users from client, 
      // we'll ask user to use email or create an edge function
      // For this demo, we'll check if identifier looks like an email pattern
      return { error: 'Please use your email address to log in, or register with username @' + identifier.toLowerCase() };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      return { error: error.message };
    }

    // Refetch profile
    await fetchProfile(user.id);
    return { error: null };
  };

  const verifyUser = async (targetUserId: string, verified: boolean) => {
    if (!isAdmin) return { error: 'Not authorized' };

    const { error } = await supabase.rpc('verify_user', {
      target_user_id: targetUserId,
      verified: verified
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const getAllProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('username');

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Profile[], error: null };
  };

  return {
    user,
    session,
    profile,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    verifyUser,
    getAllProfiles,
    isAuthenticated: !!session
  };
};