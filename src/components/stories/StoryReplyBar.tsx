import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

interface StoryReplyBarProps {
  storyUserId: string;
  storyUserName: string;
  onReply: (message: string) => void;
  onReaction: (emoji: string) => void;
  isPaused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const QUICK_REACTIONS = ['❤️', '🔥', '👏', '😂', '😮', '😢'];

export const StoryReplyBar = ({
  storyUserName,
  onReply,
  onReaction,
  onFocus,
  onBlur,
}: StoryReplyBarProps) => {
  const [message, setMessage] = useState('');
  const [showReactions, setShowReactions] = useState(true);
  const { trigger } = useHaptic();

  const handleSend = () => {
    if (!message.trim()) return;
    trigger('light');
    onReply(message.trim());
    setMessage('');
  };

  const handleReaction = (emoji: string) => {
    trigger('medium');
    onReaction(emoji);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-12 bg-gradient-to-t from-black/60 to-transparent safe-area-bottom">
      {/* Quick Reactions */}
      {showReactions && (
        <div className="flex justify-center gap-4 mb-4 animate-fade-in">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform hover:bg-white/20"
            >
              <span className="text-xl">{emoji}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reply Input */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setShowReactions(false);
              onFocus();
            }}
            onBlur={() => {
              setShowReactions(true);
              onBlur();
            }}
            placeholder={`Reply to ${storyUserName}...`}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 pr-12 rounded-full h-12"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
              message.trim() 
                ? "text-primary active:scale-90" 
                : "text-white/30"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
