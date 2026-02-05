 import { useState } from 'react';
 import { Plus, Check, Key, Loader2, Shield, X, Fingerprint } from 'lucide-react';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Switch } from '@/components/ui/switch';
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
     clearStoredPassword,
     removeAccount
   } = useAccountSwitcher();
   
   const [showLogin, setShowLogin] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [saveLoginInfo, setSaveLoginInfo] = useState(true);
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
   const [managingAccount, setManagingAccount] = useState<string | null>(null);
 
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
     
     if (hasStoredPassword(account.id)) {
       setLoading(true);
       setSelectedAccountId(account.id);
       
       const { error } = await quickSwitch(account.id);
       
       if (error) {
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
       if (!saveLoginInfo && userId && selectedAccountId) {
         clearStoredPassword(selectedAccountId);
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
 
   const handleRemoveAccount = (accountId: string) => {
     removeAccount(accountId);
     setManagingAccount(null);
   };
 
   const handleToggleSavedLogin = (accountId: string) => {
     if (hasStoredPassword(accountId)) {
       clearStoredPassword(accountId);
     }
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
         setManagingAccount(null);
       }
       onOpenChange(isOpen);
     }}>
       <DialogContent className="sm:max-w-md rounded-3xl">
         <DialogHeader>
           <DialogTitle className="text-center">
             {showLogin ? 'Log In to Account' : 'Switch Account'}
           </DialogTitle>
         </DialogHeader>
 
         {showLogin ? (
           <div className="space-y-4 py-4">
             {/* Modern Login Header */}
             <div className="flex justify-center mb-2">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                 <Fingerprint className="w-8 h-8 text-primary" />
               </div>
             </div>
             
             <div className="space-y-3">
               <Input
                 type="email"
                 placeholder="Email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="rounded-xl h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                 disabled={!!selectedAccountId}
               />
               <Input
                 type="password"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="rounded-xl h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                 autoFocus
               />
             </div>
             
             {/* Modern Save Login Toggle */}
             <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Shield className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                   <p className="font-medium text-sm">Remember me</p>
                   <p className="text-xs text-muted-foreground">Switch accounts instantly</p>
                 </div>
               </div>
               <Switch
                 checked={saveLoginInfo}
                 onCheckedChange={setSaveLoginInfo}
                 className="data-[state=checked]:bg-primary"
               />
             </div>
             
             {error && (
               <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                 <p className="text-destructive text-sm text-center">{error}</p>
               </div>
             )}
 
             <div className="flex gap-2 pt-2">
               <Button
                 variant="outline"
                 onClick={() => {
                   setShowLogin(false);
                   setEmail('');
                   setPassword('');
                   setError('');
                   setSelectedAccountId(null);
                 }}
                 className="flex-1 rounded-xl h-12"
               >
                 Back
               </Button>
               <Button
                 onClick={handleLogin}
                 disabled={loading}
                 className="flex-1 rounded-xl h-12 font-semibold"
               >
                 {loading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   'Log In'
                 )}
               </Button>
             </div>
           </div>
         ) : (
           <div className="space-y-2 py-4">
             {/* Current Account */}
             <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
               <Avatar className="w-14 h-14 ring-2 ring-primary/30">
                 {currentAvatarUrl && <AvatarImage src={currentAvatarUrl} />}
                 <AvatarFallback className="bg-muted text-muted-foreground">
                   {currentDisplayName[0]?.toUpperCase()}
                 </AvatarFallback>
               </Avatar>
               <div className="flex-1">
                 <p className="font-semibold">{currentDisplayName}</p>
                 <p className="text-sm text-muted-foreground">@{currentUsername}</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                 <Check className="w-4 h-4 text-primary-foreground" />
               </div>
             </div>
 
             {/* Other Saved Accounts */}
             {otherAccounts.map(account => (
               <div
                 key={account.id}
                 className={cn(
                   "flex items-center gap-3 p-4 rounded-2xl transition-all",
                   loading && selectedAccountId === account.id && "opacity-50",
                   managingAccount === account.id 
                     ? "bg-muted border border-border" 
                     : "hover:bg-muted/50"
                 )}
               >
                 {managingAccount === account.id ? (
                   <div className="flex-1 space-y-3">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <Avatar className="w-10 h-10">
                           {account.avatarUrl && <AvatarImage src={account.avatarUrl} />}
                           <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                             {account.displayName[0]?.toUpperCase()}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="font-medium text-sm">{account.displayName}</p>
                           <p className="text-xs text-muted-foreground">@{account.username}</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => setManagingAccount(null)}
                         className="p-1.5 rounded-full hover:bg-background"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                     
                     <div className="flex items-center justify-between py-2 border-t border-border">
                       <div className="flex items-center gap-2">
                         <Key className="w-4 h-4 text-muted-foreground" />
                         <span className="text-sm">Login saved</span>
                       </div>
                       <Switch
                         checked={hasStoredPassword(account.id)}
                         onCheckedChange={() => handleToggleSavedLogin(account.id)}
                         disabled={!hasStoredPassword(account.id)}
                       />
                     </div>
                     
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleRemoveAccount(account.id)}
                       className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                     >
                       Remove from device
                     </Button>
                   </div>
                 ) : (
                   <>
                     <button
                       onClick={() => handleSwitchAccount(account)}
                       disabled={loading && selectedAccountId === account.id}
                       className="flex items-center gap-3 flex-1"
                     >
                       <Avatar className="w-12 h-12">
                         {account.avatarUrl && <AvatarImage src={account.avatarUrl} />}
                         <AvatarFallback className="bg-muted text-muted-foreground">
                           {account.displayName[0]?.toUpperCase()}
                         </AvatarFallback>
                       </Avatar>
                       <div className="flex-1 text-left">
                         <div className="flex items-center gap-1.5">
                           <p className="font-semibold">{account.displayName}</p>
                           {hasStoredPassword(account.id) && (
                             <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10">
                               <Key className="w-2.5 h-2.5 text-primary" />
                               <span className="text-[10px] text-primary font-medium">Saved</span>
                             </div>
                           )}
                         </div>
                         <p className="text-sm text-muted-foreground">@{account.username}</p>
                       </div>
                     </button>
                     
                     {loading && selectedAccountId === account.id ? (
                       <Loader2 className="w-5 h-5 animate-spin text-primary" />
                     ) : (
                       <button
                         onClick={() => setManagingAccount(account.id)}
                         className="p-2 rounded-full hover:bg-muted transition-colors"
                       >
                         <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted-foreground" fill="currentColor">
                           <circle cx="12" cy="6" r="2" />
                           <circle cx="12" cy="12" r="2" />
                           <circle cx="12" cy="18" r="2" />
                         </svg>
                       </button>
                     )}
                   </>
                 )}
               </div>
             ))}
 
             {/* Add Account */}
             <button
               onClick={handleAddNewAccount}
               className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-muted/50 transition-colors border-2 border-dashed border-muted-foreground/20"
             >
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                 <Plus className="w-6 h-6 text-primary" />
               </div>
               <div className="text-left">
                 <span className="font-semibold text-primary">Add Account</span>
                 <p className="text-xs text-muted-foreground">Log in to another account</p>
               </div>
             </button>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 };