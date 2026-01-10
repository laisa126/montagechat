import { useState } from 'react';
import { Plus, Check, Key, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  const { 
    savedAccounts, 
    switchAccount, 
    quickSwitch, 
    saveCurrentAccount, 
    hasStoredPassword,
    savePassword
  } = useAccountSwitcher();
  
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveLoginInfo, setSaveLoginInfo] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

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

  const handleSwitchAccount = async (account: { id: string; email: string }) => {
    if (account.email === currentEmail) {
      onOpenChange(false);
      return;
    }
    
    // Check if we have stored password for quick switch
    if (hasStoredPassword(account.id)) {
      setLoading(true);
      setSelectedAccountId(account.id);
      
      const { error } = await quickSwitch(account.id);
      
      if (error) {
        // Password might be wrong, ask for new password
        setShowLogin(true);
        setEmail(account.email);
        setSelectedAccountId(account.id);
        setError('Session expired. Please enter your password.');
      } else {
        onOpenChange(false);
        onSwitchSuccess?.();
      }
      setLoading(false);
      setSelectedAccountId(null);
    } else {
      // No stored password, show login form
      setShowLogin(true);
      setEmail(account.email);
      setSelectedAccountId(account.id);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    const { error, userId } = await switchAccount(email, password);
    
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      // If save login info is checked, password is already saved in switchAccount
      // If not checked, we need to clear it
      if (!saveLoginInfo && userId) {
        // Password won't be saved (it's only saved in switchAccount if successful)
      }
      
      setLoading(false);
      onOpenChange(false);
      onSwitchSuccess?.();
    }
  };

  const handleAddNewAccount = () => {
    setShowLogin(true);
    setEmail('');
    setPassword('');
    setSelectedAccountId(null);
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
        setSelectedAccountId(null);
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
                disabled={!!selectedAccountId}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
            </div>
            
            {/* Save login info checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="save-login"
                checked={saveLoginInfo}
                onCheckedChange={(checked) => setSaveLoginInfo(!!checked)}
              />
              <label 
                htmlFor="save-login" 
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Save login info for quick switching
              </label>
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
                  setSelectedAccountId(null);
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
                onClick={() => handleSwitchAccount(account)}
                disabled={loading && selectedAccountId === account.id}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors",
                  loading && selectedAccountId === account.id && "opacity-50"
                )}
              >
                <Avatar className="w-12 h-12">
                  {account.avatarUrl && <AvatarImage src={account.avatarUrl} />}
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {account.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium">{account.displayName}</p>
                    {hasStoredPassword(account.id) && (
                      <Key className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{account.username}</p>
                </div>
                {loading && selectedAccountId === account.id && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
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
