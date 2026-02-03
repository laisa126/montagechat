import React from 'react';
import { ShieldX, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface BannedUserScreenProps {
  reason: string;
  banType: string;
  expiresAt?: string;
  onSignOut: () => void;
}

export const BannedUserScreen: React.FC<BannedUserScreenProps> = ({
  reason,
  banType,
  expiresAt,
  onSignOut
}) => {
  const isPermanent = banType === 'permanent' || !expiresAt;
  const expiryDate = expiresAt ? new Date(expiresAt) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10 text-destructive" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Account Suspended</h1>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        Your Montage account has been {isPermanent ? 'permanently' : 'temporarily'} suspended 
        due to a violation of our Community Guidelines.
      </p>

      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Reason for suspension</p>
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>
        </div>

        {!isPermanent && expiryDate && (
          <div className="flex items-start gap-3 text-left mt-4 pt-4 border-t border-border">
            <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">Suspension ends</p>
              <p className="text-sm text-muted-foreground">
                {format(expiryDate, 'MMMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
          </div>
        )}
      </div>

      {isPermanent && (
        <p className="text-xs text-muted-foreground mb-6 max-w-sm">
          This decision was made after a careful review of your account activity. 
          If you believe this was a mistake, you can appeal this decision by contacting our support team.
        </p>
      )}

      <div className="space-y-3 w-full max-w-sm">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.open('mailto:support@montage.app', '_blank')}
        >
          Contact Support
        </Button>
        <Button 
          variant="ghost" 
          className="w-full text-muted-foreground"
          onClick={onSignOut}
        >
          Sign Out
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Learn more about our{' '}
        <button className="text-primary hover:underline">Community Guidelines</button>
      </p>
    </div>
  );
};
