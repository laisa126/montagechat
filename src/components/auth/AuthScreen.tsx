import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, ChevronDown } from 'lucide-react';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const usernameSchema = z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(30, { message: "Username must be less than 30 characters" }).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" });

interface AuthScreenProps {
  onLogin: (identifier: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string, username: string, displayName: string, birthday?: string, gender?: string) => Promise<{ error: string | null }>;
  isLoading?: boolean;
}

export const AuthScreen = ({ onLogin, onSignUp, isLoading = false }: AuthScreenProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'credentials' | 'details'>('credentials');
  const [identifier, setIdentifier] = useState(() => localStorage.getItem('saved_login_email') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('saved_login_email'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    try {
      passwordSchema.parse(password);
      if (mode === 'signup') {
        emailSchema.parse(email);
        usernameSchema.parse(username);
        if (!displayName.trim()) {
          setError('Please enter your name');
          return false;
        }
        if (step === 'details') {
          if (!birthday) {
            setError('Please enter your birthday');
            return false;
          }
          // Check if user is at least 13 years old
          const birthDate = new Date(birthday);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 13) {
            setError('You must be at least 13 years old to use Montage');
            return false;
          }
          if (!gender) {
            setError('Please select your gender');
            return false;
          }
          if (!termsAccepted) {
            setError('Please accept the Terms and Conditions');
            return false;
          }
        }
      } else {
        if (!identifier.trim()) {
          setError('Please enter your email or username');
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

    if (mode === 'signup' && step === 'credentials') {
      setStep('details');
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === 'login') {
        if (rememberMe) {
          localStorage.setItem('saved_login_email', identifier);
        } else {
          localStorage.removeItem('saved_login_email');
        }
        const result = await onLogin(identifier, password);
        if (result.error) {
          setError(result.error);
        }
      } else {
        const result = await onSignUp(email, password, username, displayName, birthday, gender);
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

  const handleBack = () => {
    if (step === 'details') {
      setStep('credentials');
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-10">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-5xl font-display font-normal tracking-tight text-foreground">
            Montage
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
          {mode === 'signup' && step === 'credentials' && (
            <>
              <Input
                type="text"
                placeholder="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border border-border/50 px-4 text-sm placeholder:text-muted-foreground/60"
                autoComplete="name"
                disabled={isSubmitting}
              />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="h-12 rounded-xl bg-secondary/50 border border-border/50 px-4 text-sm placeholder:text-muted-foreground/60"
                autoComplete="username"
                disabled={isSubmitting}
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border border-border/50 px-4 text-sm placeholder:text-muted-foreground/60"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </>
          )}

          {mode === 'signup' && step === 'details' && (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="text-primary text-sm font-medium mb-2"
              >
                ← Back
              </button>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Birthday</label>
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="h-12 rounded-xl bg-secondary/50 border border-border/50 px-4 text-sm"
                    disabled={isSubmitting}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Gender</label>
                  <Select value={gender} onValueChange={setGender} disabled={isSubmitting}>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border border-border/50 px-4 text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 rounded border-border bg-muted mt-0.5"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-muted-foreground leading-tight">
                    By tapping Continue, you agree to Montage's{' '}
                    <button type="button" className="text-primary font-medium">Terms and Conditions</button>
                    {' '}and{' '}
                    <button type="button" className="text-primary font-medium">Privacy Policy</button>
                  </span>
                </label>
              </div>
            </>
          )}

          {mode === 'login' && (
            <Input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="h-12 rounded-xl bg-secondary/50 border border-border/50 px-4 text-sm placeholder:text-muted-foreground/60"
              autoComplete="username"
              disabled={isSubmitting}
            />
          )}
          
          {(mode === 'login' || step === 'credentials') && (
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border border-border/50 px-4 pr-12 text-sm placeholder:text-muted-foreground/60"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-muted"
              />
              <span className="text-sm text-muted-foreground">Remember my email</span>
            </label>
          )}

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground border-0"
            disabled={isSubmitting || 
              (mode === 'login' && (!identifier || !password)) || 
              (mode === 'signup' && step === 'credentials' && (!username || !displayName || !email || !password)) ||
              (mode === 'signup' && step === 'details' && (!birthday || !gender || !termsAccepted))
            }
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Log In'
            ) : step === 'credentials' ? (
              'Continue'
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full max-w-sm my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="px-4 text-xs text-muted-foreground font-medium">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Switch mode link */}
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setStep('credentials');
            setError('');
          }}
          className="text-sm text-primary font-semibold hover:opacity-80 transition-opacity"
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
                  setStep('credentials');
                  setError('');
                }}
                className="text-primary font-semibold hover:opacity-80 transition-opacity"
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
                  setStep('credentials');
                  setError('');
                }}
                className="text-primary font-semibold hover:opacity-80 transition-opacity"
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
