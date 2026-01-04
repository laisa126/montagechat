import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const usernameSchema = z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(30, { message: "Username must be less than 30 characters" }).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" });

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string, username: string, displayName: string) => Promise<{ error: string | null }>;
  isLoading?: boolean;
}

export const AuthScreen = ({ onLogin, onSignUp, isLoading = false }: AuthScreenProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (mode === 'signup') {
        usernameSchema.parse(username);
        if (!displayName.trim()) {
          setError('Please enter your name');
          return false;
        }
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const result = await onLogin(email, password);
        if (result.error) {
          setError(result.error);
        }
      } else {
        const result = await onSignUp(email, password, username, displayName);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || isLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-10">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-serif italic">
            Montage
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
          {mode === 'signup' && (
            <>
              <Input
                type="text"
                placeholder="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 rounded-sm bg-secondary/50 border border-border/50 px-3 text-sm placeholder:text-muted-foreground/60"
                autoComplete="name"
                disabled={isSubmitting}
              />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="h-12 rounded-sm bg-secondary/50 border border-border/50 px-3 text-sm placeholder:text-muted-foreground/60"
                autoComplete="username"
                disabled={isSubmitting}
              />
            </>
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-sm bg-secondary/50 border border-border/50 px-3 text-sm placeholder:text-muted-foreground/60"
            autoComplete="email"
            disabled={isSubmitting}
          />
          
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-sm bg-secondary/50 border border-border/50 px-3 pr-12 text-sm placeholder:text-muted-foreground/60"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSubmitting || !email || !password || (mode === 'signup' && (!username || !displayName))}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Log In'
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full max-w-sm my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="px-4 text-xs text-muted-foreground font-semibold">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Switch mode link */}
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
          }}
          className="text-sm text-primary font-semibold"
          disabled={isSubmitting}
        >
          {mode === 'login' ? 'Create new account' : 'Already have an account? Log in'}
        </button>
      </div>

      {/* Bottom section */}
      <div className="border-t border-border py-5">
        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="text-primary font-semibold"
                disabled={isSubmitting}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-primary font-semibold"
                disabled={isSubmitting}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
