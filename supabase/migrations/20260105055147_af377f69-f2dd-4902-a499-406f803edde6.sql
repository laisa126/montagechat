-- Drop the security definer view and create a regular view instead
DROP VIEW IF EXISTS public.conversations;

-- Create a regular view without SECURITY DEFINER
-- This view will use the invoker's permissions
CREATE VIEW public.conversations
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (conversation_partner)
  m.id,
  m.sender_id,
  m.receiver_id,
  m.content as last_message,
  m.created_at as last_message_time,
  CASE 
    WHEN m.sender_id = auth.uid() THEN m.receiver_id
    ELSE m.sender_id
  END as conversation_partner
FROM public.messages m
WHERE m.sender_id = auth.uid() OR m.receiver_id = auth.uid()
ORDER BY conversation_partner, m.created_at DESC;