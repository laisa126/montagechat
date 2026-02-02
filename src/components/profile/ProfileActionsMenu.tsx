import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  UserX, 
  VolumeX, 
  ShieldAlert, 
  Flag, 
  Link2, 
  Share2,
  Bell,
  BellOff,
  Star,
  QrCode
} from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';
import { toast } from 'sonner';

interface ProfileActionsMenuProps {
  userId: string;
  username: string;
  isBlocked?: boolean;
  isMuted?: boolean;
  isRestricted?: boolean;
  notificationsOn?: boolean;
  isFavorite?: boolean;
  onBlock?: () => void;
  onMute?: () => void;
  onRestrict?: () => void;
  onReport?: () => void;
  onToggleNotifications?: () => void;
  onToggleFavorite?: () => void;
}

export const ProfileActionsMenu: React.FC<ProfileActionsMenuProps> = ({
  userId,
  username,
  isBlocked = false,
  isMuted = false,
  isRestricted = false,
  notificationsOn = false,
  isFavorite = false,
  onBlock,
  onMute,
  onRestrict,
  onReport,
  onToggleNotifications,
  onToggleFavorite
}) => {
  const { trigger } = useHaptic();

  const handleCopyLink = async () => {
    trigger('light');
    await navigator.clipboard.writeText(`https://app.example.com/${username}`);
    toast.success('Profile link copied');
  };

  const handleShare = async () => {
    trigger('light');
    if (navigator.share) {
      await navigator.share({
        title: `${username}'s Profile`,
        url: `https://app.example.com/${username}`
      });
    } else {
      handleCopyLink();
    }
  };

  const handleShowQR = () => {
    trigger('light');
    toast.info('QR code feature coming soon');
  };

  const handleBlock = () => {
    trigger('medium');
    onBlock?.();
    toast.success(isBlocked ? `Unblocked @${username}` : `Blocked @${username}`);
  };

  const handleMute = () => {
    trigger('light');
    onMute?.();
    toast.success(isMuted ? `Unmuted @${username}` : `Muted @${username}`);
  };

  const handleRestrict = () => {
    trigger('light');
    onRestrict?.();
    toast.success(isRestricted ? `Unrestricted @${username}` : `Restricted @${username}`);
  };

  const handleReport = () => {
    trigger('medium');
    onReport?.();
  };

  const handleToggleNotifications = () => {
    trigger('light');
    onToggleNotifications?.();
    toast.success(notificationsOn ? 'Notifications turned off' : 'Notifications turned on');
  };

  const handleToggleFavorite = () => {
    trigger('light');
    onToggleFavorite?.();
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 active:scale-90 transition-transform">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleToggleFavorite}>
          <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleToggleNotifications}>
          {notificationsOn ? (
            <>
              <BellOff className="w-4 h-4 mr-2" />
              Turn off notifications
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Turn on notifications
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleMute}>
          <VolumeX className="w-4 h-4 mr-2" />
          {isMuted ? 'Unmute' : 'Mute'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleRestrict}>
          <ShieldAlert className="w-4 h-4 mr-2" />
          {isRestricted ? 'Unrestrict' : 'Restrict'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="w-4 h-4 mr-2" />
          Copy profile link
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share this profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShowQR}>
          <QrCode className="w-4 h-4 mr-2" />
          QR code
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleBlock} className="text-destructive focus:text-destructive">
          <UserX className="w-4 h-4 mr-2" />
          {isBlocked ? 'Unblock' : 'Block'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleReport} className="text-destructive focus:text-destructive">
          <Flag className="w-4 h-4 mr-2" />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
