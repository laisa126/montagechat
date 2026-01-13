import { useState } from 'react';
import { Edit2, Trash2, Share2, Link2, Flag, UserX } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useHaptic } from '@/hooks/useHaptic';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PostOptionsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onShareToStory?: () => void;
}

export const PostOptionsMenu = ({
  open,
  onOpenChange,
  postId,
  isOwner,
  onEdit,
  onDelete,
  onShareToStory,
}: PostOptionsMenuProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { trigger } = useHaptic();
  const { toast } = useToast();

  const handleCopyLink = async () => {
    trigger('light');
    const link = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied',
      description: 'Post link has been copied to clipboard',
    });
    onOpenChange(false);
  };

  const handleEdit = () => {
    trigger('light');
    onEdit?.();
    onOpenChange(false);
  };

  const handleDelete = () => {
    trigger('medium');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    trigger('heavy');
    onDelete?.();
    setShowDeleteConfirm(false);
    onOpenChange(false);
    toast({
      title: 'Post deleted',
      description: 'Your post has been deleted',
    });
  };

  const handleShareToStory = () => {
    trigger('light');
    onShareToStory?.();
    onOpenChange(false);
    toast({
      title: 'Shared to story',
      description: 'Post has been shared to your story',
    });
  };

  const handleReport = () => {
    trigger('light');
    onOpenChange(false);
    toast({
      title: 'Report submitted',
      description: 'Thank you for helping keep our community safe',
    });
  };

  const options = isOwner
    ? [
        { icon: Edit2, label: 'Edit', onClick: handleEdit, destructive: false },
        { icon: Trash2, label: 'Delete', onClick: handleDelete, destructive: true },
        { icon: Share2, label: 'Share to Story', onClick: handleShareToStory, destructive: false },
        { icon: Link2, label: 'Copy Link', onClick: handleCopyLink, destructive: false },
      ]
    : [
        { icon: Share2, label: 'Share to Story', onClick: handleShareToStory, destructive: false },
        { icon: Link2, label: 'Copy Link', onClick: handleCopyLink, destructive: false },
        { icon: Flag, label: 'Report', onClick: handleReport, destructive: true },
        { icon: UserX, label: 'Unfollow', onClick: () => onOpenChange(false), destructive: true },
      ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Post options</SheetTitle>
          </SheetHeader>
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
          <div className="space-y-1 pb-safe">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={option.onClick}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-colors active:scale-[0.98]",
                  option.destructive 
                    ? "text-destructive hover:bg-destructive/10" 
                    : "text-foreground hover:bg-muted"
                )}
              >
                <option.icon className="w-5 h-5" />
                <span className="text-base font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
