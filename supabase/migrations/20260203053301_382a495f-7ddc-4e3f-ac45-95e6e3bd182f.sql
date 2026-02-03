-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_user_id UUID,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'mention', 'story_reaction', 'dm'
  post_id UUID,
  reel_id UUID,
  story_id UUID,
  comment_id UUID,
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  language TEXT DEFAULT 'en',
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  private_account BOOLEAN DEFAULT false,
  show_activity_status BOOLEAN DEFAULT true,
  allow_mentions BOOLEAN DEFAULT true,
  allow_tags BOOLEAN DEFAULT true,
  hide_like_count BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create restricted_users table
CREATE TABLE public.restricted_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  restricted_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, restricted_id)
);

-- Create muted_users table
CREATE TABLE public.muted_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  muted_id UUID NOT NULL,
  mute_stories BOOLEAN DEFAULT true,
  mute_posts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, muted_id)
);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricted_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications for others" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can mark their notifications as read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Blocked users policies
CREATE POLICY "Users can view their blocked list" ON public.blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others" ON public.blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others" ON public.blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);

-- Restricted users policies
CREATE POLICY "Users can view their restricted list" ON public.restricted_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can restrict others" ON public.restricted_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unrestrict others" ON public.restricted_users
  FOR DELETE USING (auth.uid() = user_id);

-- Muted users policies
CREATE POLICY "Users can view their muted list" ON public.muted_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mute others" ON public.muted_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmute others" ON public.muted_users
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update mute settings" ON public.muted_users
  FOR UPDATE USING (auth.uid() = user_id);

-- Add indexes for faster lookups
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_restricted_users_user ON public.restricted_users(user_id);
CREATE INDEX idx_muted_users_user ON public.muted_users(user_id);
CREATE INDEX idx_user_bans_user_id ON public.user_bans(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_is_verified ON public.profiles(is_verified);

-- Trigger for user_settings updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();