import React, { useState, useEffect } from 'react';
import { Youtube, Search, ExternalLink, X, Minimize2, Maximize2, Play, Music, Sparkles } from 'lucide-react';
import { playConfirmSound } from '../utils/soundEffects';

interface YouTubeHUDProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onVoiceSearchRequest?: (query: string) => void;
}

interface QuickSong {
  title: string;
  artist: string;
  videoId: string;
  tag: string;
}

const FEATURED_TRACKS: QuickSong[] = [
  {
    title: 'Back in Black (Iron Man Theme)',
    artist: 'AC/DC',
    videoId: 'pAgnJDJN4VA',
    tag: 'Tony Stark Classic',
  },
  {
    title: 'Believer',
    artist: 'Imagine Dragons',
    videoId: '7wtfhZwyrcc',
    tag: 'Energy Workout',
  },
  {
    title: 'Iron Man 3 Original Soundtrack',
    artist: 'Brian Tyler',
    videoId: 'Wp_K8PrEP3Y',
    tag: 'Marvel Cinematic',
  },
  {
    title: 'Engineering & Coding Lo-Fi Study Beats',
    artist: 'Lofi Girl / Tech Beats',
    videoId: 'jfKfPfyJRdk',
    tag: 'Deep Focus',
  },
  {
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    videoId: '34Na4j8AVgA',
    tag: 'Synthwave',
  },
];

export const YouTubeHUD: React.FC<YouTubeHUDProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onVoiceSearchRequest,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeVideoId, setActiveVideoId] = useState<string>(FEATURED_TRACKS[0].videoId);
  const [activeTitle, setActiveTitle] = useState<string>(FEATURED_TRACKS[0].title);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      // Check if it matches any quick preset
      const match = FEATURED_TRACKS.find(
        (t) => t.title.toLowerCase().includes(initialQuery.toLowerCase()) || initialQuery.toLowerCase().includes(t.title.toLowerCase())
      );
      if (match) {
        setActiveVideoId(match.videoId);
        setActiveTitle(match.title);
      }
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    playConfirmSound();
    // If it's a direct youtube link or video ID
    if (searchQuery.includes('youtube.com/watch?v=') || searchQuery.includes('youtu.be/')) {
      const match = searchQuery.match(/(?:youtu\.be\/|watch\?v=)([\w-]{11})/);
      if (match && match[1]) {
        setActiveVideoId(match[1]);
        setActiveTitle('Custom Video Link');
        return;
      }
    }

    // Try finding matching keyword
    const found = FEATURED_TRACKS.find(
      (t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.toLowerCase().includes(t.artist.toLowerCase())
    );

    if (found) {
      setActiveVideoId(found.videoId);
      setActiveTitle(found.title);
    } else {
      // Use YouTube embed search or open
      setActiveTitle(`YouTube Search: ${searchQuery}`);
      // Open YouTube in new tab or search query
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const handleOpenExternal = () => {
    const url = searchQuery
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
      : activeVideoId 
        ? `https://www.youtube.com/watch?v=${activeVideoId}`
        : 'https://www.youtube.com';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isMinimized
          ? 'bottom-4 right-4 w-80 h-16'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[540px] md:w-[620px] max-h-[85vh]'
      } bg-slate-950/95 border border-cyan-400/50 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.25)] backdrop-blur-md flex flex-col overflow-hidden`}
    >
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-red-950/40 via-cyan-950/40 to-slate-900 border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-red-600/30 text-red-400 border border-red-500/40">
            <Youtube className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-orbitron font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span>YOUTUBE HUD TERMINAL</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-400 font-mono-tech border border-cyan-500/30">
                ACTIVE
              </span>
            </div>
            {!isMinimized && (
              <p className="text-[10px] text-cyan-400/70 font-mono-tech truncate max-w-[260px]">
                {activeTitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenExternal}
            title="Open on YouTube.com"
            className="p-1.5 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
            className="p-1.5 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            title="Close YouTube HUD"
            className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isMinimized && (
        <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(85vh-50px)]">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Voice command: 'Play Believer on YouTube' or search..."
                className="w-full bg-slate-900/80 border border-cyan-500/40 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-cyan-100 placeholder:text-cyan-600 focus:outline-none focus:border-cyan-300 font-mono-tech"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 rounded-lg text-xs font-orbitron text-red-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3 h-3" />
              <span className="hidden sm:inline">SEARCH</span>
            </button>
          </form>

          {/* Video Player Frame */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-cyan-500/40 bg-black shadow-inner">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&enablejsapi=1&rel=0`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* Quick Preset Songs for Abhishek */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-orbitron text-cyan-300 tracking-wider flex items-center gap-1">
                <Music className="w-3 h-3 text-cyan-400" />
                COMMAND PRESETS FOR ABHISHEK
              </span>
              <button
                onClick={handleOpenExternal}
                className="text-[10px] text-cyan-400/80 hover:text-cyan-200 underline font-mono-tech"
              >
                Launch YouTube Full Tab →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEATURED_TRACKS.map((track) => (
                <button
                  key={track.videoId}
                  onClick={() => {
                    playConfirmSound();
                    setActiveVideoId(track.videoId);
                    setActiveTitle(track.title);
                    setSearchQuery(track.title);
                  }}
                  className={`p-2 rounded-lg text-left transition-all border flex items-center gap-2.5 ${
                    activeVideoId === track.videoId
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900/60 border-cyan-900/60 text-cyan-400/80 hover:bg-cyan-900/30 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-red-600/30 border border-red-500/40 flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 text-red-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate text-cyan-100">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-cyan-400/60 truncate flex items-center gap-1 font-mono-tech">
                      <span>{track.artist}</span>
                      <span>•</span>
                      <span className="text-cyan-300/80">{track.tag}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Command Hint */}
          <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-cyan-300/90 font-mono-tech leading-relaxed">
              <span className="text-cyan-200 font-semibold">Voice Shortcuts:</span> Say <span className="text-amber-300">"Jarvis, play Believer on YouTube"</span> or <span className="text-amber-300">"Jarvis, open YouTube and search study music"</span>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
