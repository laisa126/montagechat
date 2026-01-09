import { useState, useRef } from 'react';
import { ChevronLeft, Upload, CheckCircle, Clock, XCircle, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVerificationRequests } from '@/hooks/useVerificationRequests';
import { cn } from '@/lib/utils';

interface VerificationRequestScreenProps {
  onBack: () => void;
  userId: string;
}

const CATEGORIES = [
  { value: 'public-figure', label: 'Public Figure' },
  { value: 'celebrity', label: 'Celebrity' },
  { value: 'brand', label: 'Brand or Business' },
  { value: 'influencer', label: 'Content Creator / Influencer' },
  { value: 'journalist', label: 'Journalist / News' },
  { value: 'sports', label: 'Sports' },
  { value: 'government', label: 'Government / Politics' },
  { value: 'music', label: 'Music' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' }
];

export const VerificationRequestScreen = ({ onBack, userId }: VerificationRequestScreenProps) => {
  const { myRequest, submitRequest, uploadDocument, loading } = useVerificationRequests(userId);
  const [step, setStep] = useState<'info' | 'form' | 'submitted'>('info');
  const [fullName, setFullName] = useState('');
  const [knownAs, setKnownAs] = useState('');
  const [category, setCategory] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If user already has a request
  if (myRequest) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Verification Request</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          {myRequest.status === 'pending' && (
            <>
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Request Pending</h2>
              <p className="text-muted-foreground max-w-xs">
                Your verification request is being reviewed. We'll notify you once a decision has been made.
              </p>
            </>
          )}
          {myRequest.status === 'approved' && (
            <>
              <div className="w-20 h-20 rounded-full bg-verified/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-verified" />
              </div>
              <h2 className="text-xl font-bold mb-2">Request Approved</h2>
              <p className="text-muted-foreground max-w-xs">
                Congratulations! Your account has been verified.
              </p>
            </>
          )}
          {myRequest.status === 'rejected' && (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2">Request Declined</h2>
              <p className="text-muted-foreground max-w-xs">
                Unfortunately, your verification request was not approved at this time.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setDocumentFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let documentUrl: string | undefined;

      if (documentFile) {
        const { url, error: uploadError } = await uploadDocument(documentFile);
        if (uploadError) {
          setError(uploadError);
          setSubmitting(false);
          return;
        }
        documentUrl = url || undefined;
      }

      const { error: submitError } = await submitRequest({
        fullName,
        knownAs: knownAs || undefined,
        category,
        documentUrl,
        additionalInfo: additionalInfo || undefined
      });

      if (submitError) {
        setError(submitError);
      } else {
        setStep('submitted');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'submitted') {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Request Submitted</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Request Submitted!</h2>
          <p className="text-muted-foreground max-w-xs mb-6">
            We've received your verification request. You'll be notified once your account has been reviewed.
          </p>
          <Button onClick={onBack} className="rounded-xl">
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Request Verification</h1>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-verified/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-verified" />
              </div>
              <h2 className="text-xl font-bold mb-2">Verified Badge</h2>
              <p className="text-muted-foreground">
                A verified badge helps people know that your account is the authentic presence of the public figure, celebrity, or brand it represents.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Requirements</h3>
              <div className="space-y-3">
                {[
                  'Authentic: Your account must represent a real person, registered business, or entity.',
                  'Unique: Your account must be the unique presence of the person or business it represents.',
                  'Complete: Your account must have a bio, profile photo, and at least one post.',
                  'Notable: Your account must represent a well-known, highly searched person, brand, or entity.'
                ].map((req, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{req}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => setStep('form')} 
              className="w-full rounded-xl h-12"
            >
              Continue
            </Button>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('info')} className="active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Confirm Identity</h1>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name *</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full legal name"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Known As (Optional)</label>
              <Input
                value={knownAs}
                onChange={(e) => setKnownAs(e.target.value)}
                placeholder="Stage name, nickname, etc."
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ID Document (Optional)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload a government-issued ID to help verify your identity
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full rounded-xl h-12 justify-start gap-3",
                  documentFile && "border-primary"
                )}
              >
                <Upload className="w-5 h-5" />
                {documentFile ? documentFile.name : 'Upload Document'}
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Information (Optional)</label>
              <Textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Links to articles, websites, or other verification..."
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full rounded-xl h-12"
            disabled={submitting || !fullName || !category}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};
