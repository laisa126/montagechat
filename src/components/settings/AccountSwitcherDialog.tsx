import { useState } from 'react';
import { Plus, Check, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAccountSwitcher } from '@/hooks/useAccountSwitcher';
import { cn } from '@/lib/utils';

interface AccountSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  currentUsername: string;
  currentDisplayName: string;
  currentAvatarUrl?: string;
  currentEmail: string;
  onSwitchSuccess?: () => void;
}

export const AccountSwitcherDialog = ({
  open,
  onOpenChange,
  currentUserId,
  currentUsername,
  currentDisplayName,
  currentAvatarUrl,
  currentEmail,
  onSwitchSuccess
}: AccountSwitcherDialogProps) => {
  const { savedAccounts, removeAccount, switchAccount, saveCurrentAccount } = useAccountSwitcher();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Save current account when dialog opens
  const handleOpen = () => {
    if (currentUserId && currentEmail) {
      saveCurrentAccount({
        user_id: currentUserId,
        username: currentUsername,
        display_name: currentDisplayName,
        avatar_url: currentAvatarUrl
      }, currentEmail);
    }
  };

  const handleSwitchAccount = async (accountEmail: string) => {
    if (accountEmail === currentEmail) {
      onOpenChange(false);
      return;
    }
    
    setShowLogin(true);
    setEmail(accountEmail);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await switchAccount(email, password);
    
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setLoading(false);
      onOpenChange(false);
      onSwitchSuccess?.();
    }
  };

  const handleAddNewAccount = () => {
    setShowLogin(true);
    setEmail('');
    setPassword('');
  };

  const otherAccounts = savedAccounts.filter(acc => acc.id !== currentUserId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isOpen) handleOpen();
      else {
        setShowLogin(false);
        setEmail('');
        setPassword('');
        setError('');
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showLogin ? 'Log In to Account' : 'Switch Account'}
          </DialogTitle>
        </DialogHeader>

        {showLogin ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLogin(false);
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
                className="flex-1 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 rounded-xl"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            {/* Current Account */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Avatar className="w-12 h-12">
                {currentAvatarUrl && <AvatarImage src={currentAvatarUrl} />}
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {currentDisplayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{currentDisplayName}</p>
                <p className="text-sm text-muted-foreground">@{currentUsername}</p>
              </div>
              <Check className="w-5 h-5 text-primary" />
            </div>

            {/* Other Saved Accounts */}
            {otherAccounts.map(account => (
              <button
                key={account.id}
                onClick={() => handleSwitchAccount(account.email)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  {account.avatarUrl && <AvatarImage src={account.avatarUrl} />}
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {account.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium">{account.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{account.username}</p>
                </div>
              </button>
            ))}

            {/* Add Account */}
            <button
              onClick={handleAddNewAccount}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-primary"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Add Account</span>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
