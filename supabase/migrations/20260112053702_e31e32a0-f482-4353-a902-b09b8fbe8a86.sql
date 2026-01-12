-- Create post_saves table for saved posts
CREATE TABLE public.post_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own saves" 
ON public.post_saves 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
ON public.post_saves 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" 
ON public.post_saves 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create reels table for video content
CREATE TABLE public.reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  caption TEXT,
  audio_name TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reels
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- Policies for reels
CREATE POLICY "Reels are viewable by everyone" 
ON public.reels 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reels" 
ON public.reels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels" 
ON public.reels 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reels" 
ON public.reels 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create reel_likes table
CREATE TABLE public.reel_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reel_id, user_id)
);

-- Enable RLS for reel_likes
ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;

-- Policies for reel_likes
CREATE POLICY "Reel likes are viewable by everyone" 
ON public.reel_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can like reels" 
ON public.reel_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike reels" 
ON public.reel_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create reel_saves table
CREATE TABLE public.reel_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reel_id, user_id)
);

-- Enable RLS for reel_saves
ALTER TABLE public.reel_saves ENABLE ROW LEVEL SECURITY;

-- Policies for reel_saves
CREATE POLICY "Users can view their own reel saves" 
ON public.reel_saves 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save reels" 
ON public.reel_saves 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave reels" 
ON public.reel_saves 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for reels
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reels', 'reels', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for reels bucket
CREATE POLICY "Reel videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reels');

CREATE POLICY "Users can upload reel videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own reel videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for reels updated_at
CREATE TRIGGER update_reels_updated_at
BEFORE UPDATE ON public.reels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();