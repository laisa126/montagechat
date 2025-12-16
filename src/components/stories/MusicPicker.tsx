import { useState } from 'react';
import { Search, Play, Pause, Check, Music, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  name: string;
  artist: string;
  duration: string;
  cover?: string;
  preview?: string;
}

interface MusicPickerProps {
  onSelect: (track: Track | null) => void;
  selectedTrack: Track | null;
}

const SAMPLE_TRACKS: Track[] = [
  { id: '1', name: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', cover: '' },
  { id: '2', name: 'Levitating', artist: 'Dua Lipa', duration: '3:23', cover: '' },
  { id: '3', name: 'Stay', artist: 'Kid LAROI & Justin Bieber', duration: '2:21', cover: '' },
  { id: '4', name: 'Good 4 U', artist: 'Olivia Rodrigo', duration: '2:58', cover: '' },
  { id: '5', name: 'Montero', artist: 'Lil Nas X', duration: '2:17', cover: '' },
  { id: '6', name: 'Peaches', artist: 'Justin Bieber', duration: '3:18', cover: '' },
  { id: '7', name: 'Kiss Me More', artist: 'Doja Cat ft. SZA', duration: '3:28', cover: '' },
  { id: '8', name: 'Drivers License', artist: 'Olivia Rodrigo', duration: '4:02', cover: '' },
  { id: '9', name: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', cover: '' },
  { id: '10', name: 'Butter', artist: 'BTS', duration: '2:44', cover: '' },
];

const CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'recent', label: 'Recent', icon: Clock },
];

export const MusicPicker = ({ onSelect, selectedTrack }: MusicPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { trigger } = useHaptic();

  const filteredTracks = SAMPLE_TRACKS.filter(
    track =>
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayPreview = (trackId: string) => {
    trigger('light');
    setPlayingId(playingId === trackId ? null : trackId);
  };

  const handleSelect = (track: Track) => {
    trigger('medium');
    onSelect(selectedTrack?.id === track.id ? null : track);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs..."
            className="pl-10 bg-muted border-0 rounded-xl"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pb-2">
        <div className="flex gap-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                trigger('light');
                setActiveCategory(id);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Track List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                selectedTrack?.id === track.id
                  ? "bg-primary/10 ring-1 ring-primary"
                  : "bg-muted/50 active:bg-muted"
              )}
            >
              {/* Album Cover / Play Button */}
              <button
                onClick={() => handlePlayPreview(track.id)}
                className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              >
                {playingId === track.id ? (
                  <Pause className="w-5 h-5 text-white" fill="white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                )}
                {/* Playing animation */}
                {playingId === track.id && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full animate-pulse"
                        style={{
                          height: `${4 + i * 2}px`,
                          animationDelay: `${i * 100}ms`
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>

              {/* Track Info */}
              <div className="flex-1 min-w-0" onClick={() => handleSelect(track)}>
                <p className="font-medium text-sm truncate">{track.name}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>

              {/* Duration & Select */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{track.duration}</span>
                <button
                  onClick={() => handleSelect(track)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90",
                    selectedTrack?.id === track.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {selectedTrack?.id === track.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Music className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {filteredTracks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No songs found</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Selected Track Preview */}
      {selectedTrack && (
        <div className="p-4 border-t border-border bg-background animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{selectedTrack.name}</p>
              <p className="text-xs text-muted-foreground truncate">{selectedTrack.artist}</p>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-xs text-destructive font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};