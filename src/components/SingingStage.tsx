import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Play, Square, Mic, Volume2, Sparkles, X, FastForward, Disc3 } from 'lucide-react';
import { JARVIS_SONGS, Song } from '../utils/songs';
import { playMusicalNote, playConfirmSound } from '../utils/soundEffects';
import { jarvisVoiceEngine } from '../utils/voiceSynthesis';

interface SingingStageProps {
  isOpen: boolean;
  onClose: () => void;
  requestedSongTitle?: string;
}

export const SingingStage: React.FC<SingingStageProps> = ({
  isOpen,
  onClose,
  requestedSongTitle,
}) => {
  const [selectedSong, setSelectedSong] = useState<Song>(JARVIS_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  const [customTopic, setCustomTopic] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customSong, setCustomSong] = useState<Song | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelSingingRef = useRef(false);

  const stopSinging = useCallback(() => {
    cancelSingingRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    jarvisVoiceEngine.stop();
    setIsPlaying(false);
    setCurrentLineIndex(-1);
  }, []);

  const startSingingSong = useCallback(async (song: Song) => {
    stopSinging();
    cancelSingingRef.current = false;
    setIsPlaying(true);
    setCurrentLineIndex(0);

    // Initial voice introduction
    await jarvisVoiceEngine.speak(
      `Commencing vocal performance for ${song.title}. Synthesizers engaged.`,
      { pitch: 1.0, rate: 1.05 }
    );

    if (cancelSingingRef.current) return;

    // Loop through song lines
    for (let i = 0; i < song.lines.length; i++) {
      if (cancelSingingRef.current) break;

      setCurrentLineIndex(i);
      const line = song.lines[i];

      // Play musical note chord accompaniment procedurally
      line.notes.forEach((freq, noteIdx) => {
        setTimeout(() => {
          if (!cancelSingingRef.current) {
            playMusicalNote(freq, 0.45, 'triangle');
          }
        }, noteIdx * 180);
      });

      // Sing line with melodious pitch modulation
      const notePitch = 0.9 + (i % 3) * 0.12;
      await jarvisVoiceEngine.speak(line.text, {
        pitch: notePitch,
        rate: 0.98,
      });

      // Short breath delay
      if (i < song.lines.length - 1 && !cancelSingingRef.current) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!cancelSingingRef.current) {
      await jarvisVoiceEngine.speak("Thank you, Sir. Hope that meets Stark engineering standards.");
    }

    setIsPlaying(false);
    setCurrentLineIndex(-1);
  }, [stopSinging]);

  // If a song title was requested via voice command (e.g. "sing believer")
  useEffect(() => {
    if (requestedSongTitle) {
      const match = JARVIS_SONGS.find(
        (s) =>
          s.title.toLowerCase().includes(requestedSongTitle.toLowerCase()) ||
          s.id.toLowerCase().includes(requestedSongTitle.toLowerCase())
      );
      if (match) {
        setSelectedSong(match);
        startSingingSong(match);
      } else {
        // If not found, start current selected song
        startSingingSong(selectedSong);
      }
    }
  }, [requestedSongTitle, selectedSong, startSingingSong]);

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      stopSinging();
    };
  }, [stopSinging]);

  if (!isOpen) return null;

  // Generate Custom Song with Gemini AI
  const handleGenerateCustomSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim() || isGeneratingCustom) return;

    setIsGeneratingCustom(true);
    playConfirmSound();

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write 4 rhyming upbeat song lines for Jarvis to sing to Abhishek (an engineering student) specifically about: "${customTopic}". Make each line concise and rhythmic.`,
        }),
      });

      const data = await res.json();
      const text = data.replyText || '';
      const lines = text
        .split('\n')
        .map((l: string) => l.replace(/^[-*0-9.]+\s*/, '').trim())
        .filter((l: string) => l.length > 5)
        .slice(0, 5);

      const generatedSong: Song = {
        id: `custom-${Date.now()}`,
        title: `Song of ${customTopic.toUpperCase()}`,
        subtitle: `Custom AI Composition for Abhishek`,
        genre: 'AI Freestyle',
        tempoBpm: 120,
        description: `Procedurally generated song about ${customTopic}`,
        lines: lines.map((l: string, idx: number) => ({
          text: l,
          notes: [261.63 + idx * 40, 329.63 + idx * 30, 392.00 + idx * 25],
          delayMs: 3000,
        })),
      };

      setCustomSong(generatedSong);
      setSelectedSong(generatedSong);
      startSingingSong(generatedSong);
    } catch (err) {
      console.warn('Failed to generate song:', err);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const allSongs = customSong ? [customSong, ...JARVIS_SONGS] : JARVIS_SONGS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-cyan-400 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.35)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 border-b border-cyan-500/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Disc3 className={`w-5 h-5 ${isPlaying ? 'spin-medium' : ''}`} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-orbitron font-bold tracking-wider text-cyan-200 flex items-center gap-2">
                <span>JARVIS VOCAL CONCERT STAGE</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 font-mono-tech border border-cyan-400/30">
                  {isPlaying ? 'LIVE PERFORMANCE' : 'READY'}
                </span>
              </h2>
              <p className="text-[11px] text-cyan-400/70 font-mono-tech">
                Synthesized harmonics & lyrical performance for Abhishek
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSinging();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer & Stage Center */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* Animated Equalizer Visualizer */}
          <div className="h-28 sm:h-32 rounded-xl bg-slate-900/90 border border-cyan-500/30 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />
            
            {/* Equalizer Frequency Bars */}
            <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-16 w-full z-10 px-4">
              {Array.from({ length: 24 }).map((_, i) => {
                const height = isPlaying
                  ? Math.sin(i * 0.4 + (currentLineIndex + 1) * 2) * 45 + 50
                  : 15;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-150 bg-gradient-to-t from-cyan-600 via-sky-400 to-cyan-200"
                    style={{
                      height: `${height}%`,
                      opacity: isPlaying ? 0.9 : 0.25,
                      boxShadow: isPlaying ? '0 0 8px rgba(0,240,255,0.5)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            <div className="mt-2 text-center z-10">
              <span className="text-xs font-orbitron tracking-widest text-cyan-300 font-semibold">
                {selectedSong.title}
              </span>
              <span className="text-[11px] text-cyan-400/70 font-mono-tech ml-2">
                [{selectedSong.genre} • {selectedSong.tempoBpm} BPM]
              </span>
            </div>
          </div>

          {/* Karaoke Teleprompter Screen */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 min-h-[140px] flex flex-col justify-center">
            <div className="text-[10px] font-orbitron text-cyan-400/80 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>LIVE LYRIC PROMPTER</span>
              <span>{isPlaying ? `VERSE ${currentLineIndex + 1} / ${selectedSong.lines.length}` : 'STANDBY'}</span>
            </div>

            <div className="space-y-2">
              {selectedSong.lines.map((line, idx) => {
                const isActive = currentLineIndex === idx;
                const isPast = currentLineIndex > idx;
                return (
                  <div
                    key={idx}
                    className={`transition-all duration-300 px-3 py-1.5 rounded-lg text-sm sm:text-base font-semibold flex items-center gap-2 ${
                      isActive
                        ? 'bg-cyan-500/25 border-l-4 border-cyan-400 text-cyan-100 hud-glow scale-[1.02]'
                        : isPast
                        ? 'text-cyan-600/70 line-through text-xs'
                        : 'text-cyan-400/50 text-xs sm:text-sm'
                    }`}
                  >
                    {isActive && <Mic className="w-4 h-4 text-cyan-300 animate-pulse shrink-0" />}
                    <span>{line.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Song Selector Buttons */}
          <div>
            <div className="text-xs font-orbitron text-cyan-300 mb-2 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              SELECT REPERTOIRE
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allSongs.map((song) => {
                const isCurrent = selectedSong.id === song.id;
                return (
                  <button
                    key={song.id}
                    onClick={() => {
                      playConfirmSound();
                      setSelectedSong(song);
                      if (isPlaying) {
                        startSingingSong(song);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-left transition-all border flex flex-col gap-1 ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                        : 'bg-slate-900/60 border-cyan-900/60 text-cyan-400/80 hover:bg-cyan-900/40 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="text-xs font-orbitron font-bold flex items-center justify-between">
                      <span className="truncate">{song.title}</span>
                      {isCurrent && isPlaying && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-cyan-300/70 font-mono-tech truncate">
                      {song.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Song on Demand Prompt */}
          <form onSubmit={handleGenerateCustomSong} className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row gap-2 items-center">
            <div className="flex-1 w-full relative">
              <Sparkles className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Ask Jarvis to sing about anything (e.g., 'thermodynamics exam', 'coffee')..."
                className="w-full bg-slate-900/90 border border-purple-500/40 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-purple-100 placeholder:text-purple-400/60 focus:outline-none focus:border-purple-300 font-mono-tech"
              />
            </div>
            <button
              type="submit"
              disabled={isGeneratingCustom || !customTopic.trim()}
              className="w-full sm:w-auto px-4 py-1.5 bg-purple-600/40 hover:bg-purple-600/60 disabled:opacity-50 border border-purple-400/50 rounded-lg text-xs font-orbitron font-semibold text-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingCustom ? 'COMPOSING...' : 'COMPOSE & SING'}</span>
            </button>
          </form>
        </div>

        {/* Footer Playback Control Bar */}
        <div className="px-5 py-3 bg-slate-900 border-t border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={() => startSingingSong(selectedSong)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START SINGING</span>
              </button>
            ) : (
              <button
                onClick={stopSinging}
                className="px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white font-orbitron font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>STOP VOCALS</span>
              </button>
            )}

            <button
              onClick={() => {
                if (isPlaying) {
                  const nextIdx = (allSongs.findIndex(s => s.id === selectedSong.id) + 1) % allSongs.length;
                  const nextSong = allSongs[nextIdx];
                  setSelectedSong(nextSong);
                  startSingingSong(nextSong);
                }
              }}
              disabled={!isPlaying}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-400 transition-colors"
              title="Next Song"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-cyan-400/80 font-mono-tech block">
              Say: <span className="text-amber-300">"Jarvis, sing a song"</span> or <span className="text-amber-300">"sing Believer"</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
