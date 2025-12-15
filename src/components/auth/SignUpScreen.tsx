import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';

interface SignUpScreenProps {
  onSignUp: (username: string, displayName: string) => void;
}

export const SignUpScreen = ({ onSignUp }: SignUpScreenProps) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && displayName.trim()) {
      onSignUp(username.trim(), displayName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-foreground flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-background" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            Your data stays on this device
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 rounded-xl bg-secondary border-0 px-4"
              autoComplete="off"
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 rounded-xl bg-secondary border-0 px-4"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-semibold"
            disabled={!username.trim() || !displayName.trim()}
          >
            Get Started
          </Button>
        </form>
      </div>
    </div>
  );
};
