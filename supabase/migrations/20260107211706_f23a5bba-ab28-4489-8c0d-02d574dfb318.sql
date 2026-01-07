-- Add simulated_followers column to profiles for fake follower display
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS simulated_followers integer DEFAULT 0;

-- Create a function for admin to set simulated followers
CREATE OR REPLACE FUNCTION public.set_simulated_followers(
  target_user_id uuid,
  follower_count integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can set simulated followers';
  END IF;
  
  UPDATE public.profiles
  SET simulated_followers = follower_count
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;