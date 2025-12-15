import { useState, useRef } from 'react';
import { ChevronLeft, Image, Camera, Type, Smile, Sparkles, Sun, Contrast, Droplets, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useHaptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface PostCreationScreenProps {
  onBack: () => void;
  onPost: (post: { image?: string; caption: string }) => void;
}

type EditTab = 'filters' | 'adjust';

const FILTERS = [
  { id: 'none', name: 'Normal', style: {} },
  { id: 'clarendon', name: 'Clarendon', style: { filter: 'contrast(1.2) saturate(1.35)' } },
  { id: 'gingham', name: 'Gingham', style: { filter: 'brightness(1.05) hue-rotate(-10deg)' } },
  { id: 'moon', name: 'Moon', style: { filter: 'grayscale(1) contrast(1.1) brightness(1.1)' } },
  { id: 'lark', name: 'Lark', style: { filter: 'contrast(0.9) brightness(1.1) saturate(1.1)' } },
  { id: 'reyes', name: 'Reyes', style: { filter: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)' } },
  { id: 'juno', name: 'Juno', style: { filter: 'saturate(1.4) contrast(1.15)' } },
  { id: 'slumber', name: 'Slumber', style: { filter: 'saturate(0.66) brightness(1.05)' } },
  { id: 'crema', name: 'Crema', style: { filter: 'sepia(0.5) contrast(0.9) brightness(1.1)' } },
  { id: 'ludwig', name: 'Ludwig', style: { filter: 'saturate(0.85) contrast(1.05)' } },
  { id: 'aden', name: 'Aden', style: { filter: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)' } },
  { id: 'perpetua', name: 'Perpetua', style: { filter: 'contrast(1.1) brightness(1.25) saturate(1.1)' } },
];

export const PostCreationScreen = ({ onBack, onPost }: PostCreationScreenProps) => {
  const [step, setStep] = useState<'select' | 'edit' | 'caption'>('select');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [activeFilter, setActiveFilter] = useState('none');
  const [editTab, setEditTab] = useState<EditTab>('filters');
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0
  });
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

  const handlePost = () => {
    trigger('success');
    onPost({
      image: selectedImage || undefined,
      caption
    });
  };

  const getFilterStyle = () => {
    const filter = FILTERS.find(f => f.id === activeFilter);
    const baseFilter = filter?.style.filter || '';
    const adjustFilter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
    return {
      filter: baseFilter ? `${baseFilter} ${adjustFilter}` : adjustFilter
    };
  };

  if (step === 'select') {
    return (
      <div className="flex flex-col h-full bg-background animate-fade-in">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">{t('createPost')}</h1>
            <div className="w-6" />
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center">
            <Image className="w-16 h-16 text-muted-foreground" />
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

  if (step === 'edit') {
    return (
      <div className="flex flex-col h-full bg-background animate-fade-in">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('select')} className="active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">{t('edit')}</h1>
            <button
              onClick={() => {
                trigger('light');
                setStep('caption');
              }}
              className="text-primary font-semibold active:scale-95 transition-transform"
            >
              {t('next')}
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          {/* Image Preview */}
          <div className="aspect-square w-full bg-muted overflow-hidden">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-full object-cover transition-all duration-300"
                style={getFilterStyle()}
              />
            )}
          </div>

          {/* Edit Tabs */}
          <div className="border-b border-border">
            <div className="flex">
              <button
                onClick={() => {
                  trigger('light');
                  setEditTab('filters');
                }}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors",
                  editTab === 'filters' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground'
                )}
              >
                {t('filters')}
              </button>
              <button
                onClick={() => {
                  trigger('light');
                  setEditTab('adjust');
                }}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors",
                  editTab === 'adjust' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground'
                )}
              >
                {t('adjust')}
              </button>
            </div>
          </div>

          {/* Edit Content */}
          <ScrollArea className="flex-1">
            {editTab === 'filters' ? (
              <div className="p-4">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        trigger('light');
                        setActiveFilter(filter.id);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 min-w-[72px]",
                        activeFilter === filter.id && "opacity-100" 
                      )}
                    >
                      <div 
                        className={cn(
                          "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                          activeFilter === filter.id ? "border-foreground" : "border-transparent"
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
                      <span className="text-xs text-muted-foreground">{filter.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm w-20">{t('brightness')}</span>
                    <Slider
                      value={[adjustments.brightness]}
                      onValueChange={(v) => setAdjustments(prev => ({ ...prev, brightness: v[0] }))}
                      min={50}
                      max={150}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8">{adjustments.brightness}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Contrast className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm w-20">{t('contrast')}</span>
                    <Slider
                      value={[adjustments.contrast]}
                      onValueChange={(v) => setAdjustments(prev => ({ ...prev, contrast: v[0] }))}
                      min={50}
                      max={150}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8">{adjustments.contrast}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm w-20">{t('saturation')}</span>
                    <Slider
                      value={[adjustments.saturation]}
                      onValueChange={(v) => setAdjustments(prev => ({ ...prev, saturation: v[0] }))}
                      min={0}
                      max={200}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8">{adjustments.saturation}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm w-20">{t('warmth')}</span>
                    <Slider
                      value={[adjustments.warmth]}
                      onValueChange={(v) => setAdjustments(prev => ({ ...prev, warmth: v[0] }))}
                      min={-50}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8">{adjustments.warmth}</span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    );
  }

  // Caption step
  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('edit')} className="active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">{t('createPost')}</h1>
          <button
            onClick={handlePost}
            className="text-primary font-semibold active:scale-95 transition-transform"
          >
            {t('share')}
          </button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex gap-4 mb-6">
            {selectedImage && (
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  style={getFilterStyle()}
                />
              </div>
            )}
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('addCaption')}
              className="flex-1 border-0 bg-transparent resize-none focus-visible:ring-0 p-0 text-base"
              rows={4}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 py-4 border-t border-border">
            <button className="flex items-center gap-2 text-muted-foreground active:scale-95 transition-transform">
              <Type className="w-5 h-5" />
              <span className="text-sm">{t('text')}</span>
            </button>
            <button className="flex items-center gap-2 text-muted-foreground active:scale-95 transition-transform">
              <Smile className="w-5 h-5" />
              <span className="text-sm">{t('stickers')}</span>
            </button>
            <button className="flex items-center gap-2 text-muted-foreground active:scale-95 transition-transform">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">{t('filters')}</span>
            </button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
