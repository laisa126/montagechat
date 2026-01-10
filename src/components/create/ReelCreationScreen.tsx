import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Video, Music2, Type, Check, X, Upload, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface ReelCreationScreenProps {
  onBack: () => void;
  onCreateReel: (reel: { 
    videoFile: File; 
    caption?: string; 
    audioName?: string;
    audioArtist?: string;
  }) => void;
}

type Step = 'select' | 'edit';

export const ReelCreationScreen = ({ onBack, onCreateReel }: ReelCreationScreenProps) => {
  const { trigger } = useHaptic();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [step, setStep] = useState<Step>('select');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [audioName, setAudioName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      trigger('medium');
      setSelectedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setStep('edit');
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVideo) return;
    
    setIsSubmitting(true);
    trigger('medium');
    
    onCreateReel({
      videoFile: selectedVideo,
      caption: caption.trim() || undefined,
      audioName: audioName.trim() || 'Original Audio',
    });
  };

  // Selection step
  if (step === 'select') {
    return (
      <div className="flex flex-col h-full bg-background animate-fade-in">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">Create Reel</h1>
            <div className="w-6" />
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-2xl bg-muted flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95 mb-6"
          >
            <Upload className="w-10 h-10 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Upload Video</span>
          </button>
          
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            Select a video from your device to create a reel
          </p>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Supported formats: MP4, MOV, WebM
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum duration: 60 seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Edit step
  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('select')} className="active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Edit Reel</h1>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="sm"
            className="rounded-xl"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Video Preview */}
          <div className="relative aspect-[9/16] max-h-[60vh] bg-black rounded-2xl overflow-hidden mx-auto">
            {videoPreviewUrl && (
              <>
                <video
                  ref={videoRef}
                  src={videoPreviewUrl}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <button
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
                >
                  {!isPlaying && (
                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Type className="w-4 h-4" />
              Caption
            </label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="rounded-xl resize-none"
              rows={3}
              maxLength={2200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {caption.length}/2200
            </p>
          </div>

          {/* Audio Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              Audio Name
            </label>
            <Input
              value={audioName}
              onChange={(e) => setAudioName(e.target.value)}
              placeholder="Original Audio"
              className="rounded-xl"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
