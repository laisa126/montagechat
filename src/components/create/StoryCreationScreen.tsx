import { useState, useRef } from 'react';
import { ChevronLeft, Image, Camera, Type, Smile, Sparkles, PenTool, Music, MapPin, AtSign, Hash, Sun, Contrast, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { MusicPicker } from '@/components/stories/MusicPicker';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  name: string;
  artist: string;
  duration: string;
}

interface StoryCreationScreenProps {
  onBack: () => void;
  onPost: (story: { image: string; text?: string; music?: { name: string; artist: string } }) => void;
}

type EditTool = 'text' | 'draw' | 'stickers' | 'filters' | 'adjust' | 'music' | null;

const STORY_FILTERS = [
  { id: 'none', name: 'Normal', style: {} },
  { id: 'vintage', name: 'Vintage', style: { filter: 'sepia(0.4) contrast(1.1)' } },
  { id: 'dramatic', name: 'Dramatic', style: { filter: 'contrast(1.3) saturate(0.8)' } },
  { id: 'warm', name: 'Warm', style: { filter: 'sepia(0.2) saturate(1.3)' } },
  { id: 'cool', name: 'Cool', style: { filter: 'saturate(0.9) hue-rotate(10deg)' } },
  { id: 'mono', name: 'Mono', style: { filter: 'grayscale(1)' } },
  { id: 'fade', name: 'Fade', style: { filter: 'contrast(0.9) brightness(1.1) saturate(0.8)' } },
  { id: 'pop', name: 'Pop', style: { filter: 'saturate(1.5) contrast(1.1)' } },
];

const STICKERS = ['❤️', '🔥', '😂', '😍', '🎉', '✨', '💯', '🙌', '👏', '💪', '🌟', '💫'];

const TEXT_COLORS = [
  'hsl(0, 0%, 100%)',
  'hsl(0, 0%, 0%)',
  'hsl(0, 84%, 60%)',
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(47, 100%, 50%)',
  'hsl(280, 100%, 70%)',
  'hsl(330, 100%, 71%)',
];

export const StoryCreationScreen = ({ onBack, onPost }: StoryCreationScreenProps) => {
  const [step, setStep] = useState<'select' | 'edit'>('select');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditTool>(null);
  const [activeFilter, setActiveFilter] = useState('none');
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('hsl(0, 0%, 100%)');
  const [placedStickers, setPlacedStickers] = useState<string[]>([]);
  const [adjustments, setAdjustments] = useState({ brightness: 100, contrast: 100 });
  const [selectedMusic, setSelectedMusic] = useState<Track | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trigger } = useHaptic();
  const { t } = useLanguage();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      trigger('medium');
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setStep('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = () => {
    if (!selectedImage) return;
    trigger('success');
    onPost({
      image: selectedImage,
      text: overlayText || undefined,
      music: selectedMusic ? { name: selectedMusic.name, artist: selectedMusic.artist } : undefined
    });
  };

  const getFilterStyle = () => {
    const filter = STORY_FILTERS.find(f => f.id === activeFilter);
    const baseFilter = filter?.style.filter || '';
    const adjustFilter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%)`;
    return {
      filter: baseFilter ? `${baseFilter} ${adjustFilter}` : adjustFilter
    };
  };

  const handleAddSticker = (sticker: string) => {
    trigger('light');
    setPlacedStickers(prev => [...prev, sticker]);
  };

  if (step === 'select') {
    return (
      <div className="flex flex-col h-full bg-background animate-fade-in">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">{t('createStory')}</h1>
            <div className="w-6" />
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center">
            <Camera className="w-16 h-16 text-muted-foreground" />
          </div>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              onClick={() => {
                trigger('light');
                fileInputRef.current?.click();
              }}
              className="w-full rounded-xl h-12 gap-2"
            >
              <Image className="w-5 h-5" />
              {t('gallery')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                trigger('light');
                fileInputRef.current?.click();
              }}
              className="w-full rounded-xl h-12 gap-2"
            >
              <Camera className="w-5 h-5" />
              {t('camera')}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black animate-fade-in">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              trigger('light');
              setStep('select');
            }} 
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={handleShare}
            className="px-6 py-2 rounded-full bg-white text-black font-semibold active:scale-95 transition-transform"
          >
            {t('share')}
          </button>
        </div>
      </header>

      {/* Story Preview */}
      <div className="flex-1 relative overflow-hidden">
        {selectedImage && (
          <div className="absolute inset-0">
            <img
              src={selectedImage}
              alt="Story"
              className="w-full h-full object-cover transition-all duration-300"
              style={getFilterStyle()}
            />
            
            {/* Text Overlay */}
            {overlayText && (
              <div 
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <p 
                  className="text-3xl font-bold text-center drop-shadow-lg"
                  style={{ color: textColor }}
                >
                  {overlayText}
                </p>
              </div>
            )}

            {/* Placed Stickers */}
            <div className="absolute inset-0 pointer-events-none">
              {placedStickers.map((sticker, i) => (
                <span 
                  key={i} 
                  className="absolute text-5xl"
                  style={{ 
                    top: `${20 + (i * 15) % 60}%`, 
                    left: `${20 + (i * 20) % 60}%` 
                  }}
                >
                  {sticker}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Tools Bar */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        {[
          { tool: 'text' as EditTool, icon: Type },
          { tool: 'draw' as EditTool, icon: PenTool },
          { tool: 'stickers' as EditTool, icon: Smile },
          { tool: 'filters' as EditTool, icon: Sparkles },
          { tool: 'adjust' as EditTool, icon: Sun },
          { tool: 'music' as EditTool, icon: Music },
        ].map(({ tool, icon: Icon }) => (
          <button
            key={tool}
            onClick={() => {
              trigger('light');
              setActiveTool(activeTool === tool ? null : tool);
            }}
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
              activeTool === tool 
                ? "bg-white text-black" 
                : "bg-black/30 backdrop-blur-sm text-white",
              tool === 'music' && selectedMusic && "ring-2 ring-primary"
            )}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Selected Music Indicator */}
      {selectedMusic && !activeTool && (
        <div className="absolute bottom-24 left-4 right-4 safe-area-bottom animate-fade-in">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{selectedMusic.name}</p>
              <p className="text-white/60 text-xs truncate">{selectedMusic.artist}</p>
            </div>
            <button
              onClick={() => {
                trigger('light');
                setSelectedMusic(null);
              }}
              className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Active Tool Panel */}
      {activeTool && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl safe-area-bottom animate-fade-in">
          {activeTool === 'text' && (
            <div className="p-4 space-y-4">
              <Input
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder={t('text')}
                className="bg-white/10 border-0 text-white placeholder:text-white/50 rounded-xl"
              />
              <div className="flex gap-2 justify-center">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      trigger('light');
                      setTextColor(color);
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform",
                      textColor === color ? "border-white scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTool === 'stickers' && (
            <div className="p-4">
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-2">
                  {STICKERS.map((sticker) => (
                    <button
                      key={sticker}
                      onClick={() => handleAddSticker(sticker)}
                      className="text-4xl active:scale-75 transition-transform"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTool === 'filters' && (
            <div className="p-4">
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {STORY_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        trigger('light');
                        setActiveFilter(filter.id);
                      }}
                      className="flex flex-col items-center gap-2 min-w-[64px]"
                    >
                      <div 
                        className={cn(
                          "w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                          activeFilter === filter.id ? "border-white" : "border-transparent"
                        )}
                      >
                        {selectedImage && (
                          <img
                            src={selectedImage}
                            alt={filter.name}
                            className="w-full h-full object-cover"
                            style={filter.style}
                          />
                        )}
                      </div>
                      <span className="text-xs text-white/70">{filter.name}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTool === 'adjust' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-white/70" />
                <Slider
                  value={[adjustments.brightness]}
                  onValueChange={(v) => setAdjustments(prev => ({ ...prev, brightness: v[0] }))}
                  min={50}
                  max={150}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <Contrast className="w-5 h-5 text-white/70" />
                <Slider
                  value={[adjustments.contrast]}
                  onValueChange={(v) => setAdjustments(prev => ({ ...prev, contrast: v[0] }))}
                  min={50}
                  max={150}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {activeTool === 'draw' && (
            <div className="p-4 text-center">
              <p className="text-white/50 text-sm">{t('draw')} - Coming soon</p>
            </div>
          )}

          {activeTool === 'music' && (
            <div className="h-80">
              <MusicPicker
                selectedTrack={selectedMusic}
                onSelect={(track) => {
                  setSelectedMusic(track);
                  if (track) {
                    trigger('success');
                    setActiveTool(null);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom Quick Actions */}
      {!activeTool && !selectedMusic && (
        <div className="absolute bottom-0 left-0 right-0 p-4 safe-area-bottom">
          <div className="flex justify-center gap-6">
            <button 
              onClick={() => {
                trigger('light');
                setActiveTool('music');
              }}
              className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/70">Music</span>
            </button>
            <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/70">Location</span>
            </button>
            <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <AtSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/70">Mention</span>
            </button>
            <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/70">Hashtag</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
