/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Youtube, 
  Music, 
  Cpu, 
  Activity, 
  Settings, 
  Zap, 
  Volume2, 
  VolumeX, 
  Send, 
  Radio, 
  Sparkles,
  ShieldAlert,
  Play
} from 'lucide-react';

import { ArcReactor } from './components/ArcReactor';
import { YouTubeHUD } from './components/YouTubeHUD';
import { SingingStage } from './components/SingingStage';
import { EngineeringHUD } from './components/EngineeringHUD';
import { CommandLog } from './components/CommandLog';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { SetupGuideModal } from './components/SetupGuideModal';

import { useJarvisVoice, VoiceCommandAction } from './hooks/useJarvisVoice';
import { playStartupChime, playConfirmSound, playArcReactorPower, playBeep } from './utils/soundEffects';
import { jarvisVoiceEngine } from './utils/voiceSynthesis';

export default function App() {
  // Modal states
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeQuery, setYoutubeQuery] = useState('');
  const [singingOpen, setSingingOpen] = useState(false);
  const [requestedSong, setRequestedSong] = useState<string | undefined>(undefined);
  const [engineeringOpen, setEngineeringOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Manual command text input state
  const [typedInput, setTypedInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Handle action triggered from voice
  const handleAction = useCallback((action: VoiceCommandAction) => {
    switch (action.type) {
      case 'OPEN_YOUTUBE':
        setYoutubeQuery(action.query || '');
        setYoutubeOpen(true);
        break;
      case 'CLOSE_YOUTUBE':
        setYoutubeOpen(false);
        break;
      case 'SING_SONG':
        setRequestedSong(action.songTitle);
        setSingingOpen(true);
        break;
      case 'SYSTEM_DIAGNOSTICS':
      case 'ENGINEERING_ASSIST':
        setEngineeringOpen(true);
        break;
      case 'ARC_OVERDRIVE':
        playArcReactorPower();
        break;
      case 'STOP_ALL':
        setSingingOpen(false);
        setYoutubeOpen(false);
        break;
      default:
        break;
    }
  }, []);

  const {
    isListening,
    wakeWordMode,
    setWakeWordMode,
    interimTranscript,
    jarvisStatus,
    setJarvisStatus,
    isSpeaking,
    messages,
    speechSupported,
    errorNotice,
    toggleListening,
    handleVoiceInput,
  } = useJarvisVoice(handleAction);

  // Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // System Welcome sequence on user initiation
  const handleInitializeJarvis = () => {
    setHasStarted(true);
    playStartupChime();
    // Turn microphone listening on immediately to capture user's voice
    if (!isListening) {
      toggleListening();
    }
    const welcome = "J.A.R.V.I.S. is online. Welcome back, Abhishek. Standing by for your voice command.";
    jarvisVoiceEngine.speak(welcome);
  };

  // Keyboard shortcut: Spacebar to toggle voice listening (when not typing in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    handleVoiceInput(typedInput.trim());
    setTypedInput('');
  };

  const handleTriggerOverdrive = () => {
    playArcReactorPower();
    setJarvisStatus('OVERDRIVE');
    jarvisVoiceEngine.speak("Arc Reactor output rerouted to two hundred percent. Overdrive protocol active, Abhishek.");
    setTimeout(() => {
      setJarvisStatus(isListening ? 'LISTENING' : 'STANDBY');
    }, 4000);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between text-cyan-400 bg-slate-950 scanlines selection:bg-cyan-500 selection:text-black">
      {/* Background Stark Geometric HUD Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* Top Holographic Navigation Bar */}
      <header className="relative z-30 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-cyan-500/30 bg-slate-950/90 backdrop-blur-md flex items-center justify-between shadow-lg">
        {/* Left: Jarvis Branding & Abhishek Protocol */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-cyan-200 hud-glow">
                J.A.R.V.I.S.
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-400/40 text-cyan-300 font-mono-tech tracking-wider hidden sm:inline-block">
                MARK LXXXV
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 font-mono-tech flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>COMMANDER:</span>
              <span className="text-cyan-200 font-semibold uppercase">ABHISHEK (ENGINEER)</span>
            </div>
          </div>
        </div>

        {/* Center: Live Telemetry Clock & Reactor Status */}
        <div className="hidden md:flex items-center gap-6 font-mono-tech text-xs">
          <div className="px-3 py-1 rounded bg-slate-900/80 border border-cyan-500/20 text-cyan-300 flex items-center gap-2">
            <span className="text-cyan-500">SYS_TIME:</span>
            <span className="font-bold text-cyan-100 font-orbitron">{currentTime || '12:00:00'}</span>
          </div>

          <div className="px-3 py-1 rounded bg-slate-900/80 border border-cyan-500/20 text-cyan-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-cyan-500">ARC CORE:</span>
            <span className="font-bold text-emerald-300">100% OPTIMAL</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* YouTube Quick Button */}
          <button
            onClick={() => {
              playConfirmSound();
              setYoutubeOpen(true);
            }}
            title="Open YouTube HUD"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-orbitron flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Youtube className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">YOUTUBE</span>
          </button>

          {/* Sing Song Quick Button */}
          <button
            onClick={() => {
              playConfirmSound();
              setSingingOpen(true);
            }}
            title="Jarvis Sing a Song"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-orbitron flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Music className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">SING SONG</span>
          </button>

          {/* Engineering HUD Button */}
          <button
            onClick={() => {
              playConfirmSound();
              setEngineeringOpen(true);
            }}
            title="Engineering Tools for Abhishek"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 text-cyan-300 text-xs font-orbitron flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">ENGINEERING</span>
          </button>

          {/* Help / Run Files Guide */}
          <button
            onClick={() => {
              playBeep();
              setGuideOpen(true);
            }}
            title="How to run your files (.bat & python)"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-orbitron flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">RUN FILES / BAT</span>
          </button>

          {/* Voice Settings */}
          <button
            onClick={() => {
              playBeep();
              setSettingsOpen(true);
            }}
            title="Voice & Audio Settings"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-400 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notice Banner if Mic Blocked or Speech Not Supported */}
      {errorNotice && (
        <div className="relative z-30 mx-3 sm:mx-6 mt-2 px-4 py-2 rounded-lg bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-mono-tech flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={toggleListening}
            className="px-2 py-0.5 rounded bg-red-800 text-white font-orbitron text-[10px]"
          >
            RETRY MIC
          </button>
        </div>
      )}

      {/* Main Center Content HUD */}
      <main className="relative z-20 flex-1 px-3 sm:px-6 py-4 flex flex-col lg:flex-row items-stretch justify-center gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Command & Voice Transcript Telemetry */}
        <section className="w-full lg:w-5/12 flex flex-col gap-4 order-2 lg:order-1">
          <div className="flex-1">
            <CommandLog
              messages={messages}
              interimTranscript={interimTranscript}
              onExecuteAction={handleAction}
            />
          </div>

          {/* Quick Voice Command Hints Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 font-mono-tech text-xs space-y-2">
            <div className="text-[11px] font-orbitron font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>VOICE DIRECTIVES READY FOR YOU:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => handleVoiceInput("Jarvis, open YouTube and play song")}
                className="text-left px-2 py-1.5 rounded bg-slate-900/60 border border-cyan-900/60 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-400 transition-all flex items-center gap-1"
              >
                <Youtube className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate">"Open YouTube"</span>
              </button>
              <button
                onClick={() => handleVoiceInput("Jarvis, sing a song")}
                className="text-left px-2 py-1.5 rounded bg-slate-900/60 border border-cyan-900/60 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-400 transition-all flex items-center gap-1"
              >
                <Music className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">"Sing a song"</span>
              </button>
              <button
                onClick={() => handleVoiceInput("Jarvis, sing Believer")}
                className="text-left px-2 py-1.5 rounded bg-slate-900/60 border border-cyan-900/60 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-400 transition-all flex items-center gap-1"
              >
                <Music className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">"Sing Believer"</span>
              </button>
              <button
                onClick={() => handleVoiceInput("Jarvis, system diagnostics")}
                className="text-left px-2 py-1.5 rounded bg-slate-900/60 border border-cyan-900/60 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-400 transition-all flex items-center gap-1"
              >
                <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">"System Diagnostics"</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Central Arc Reactor & Voice Activation Core */}
        <section className="w-full lg:w-7/12 flex flex-col items-center justify-center p-2 sm:p-6 order-1 lg:order-2">
          {!hasStarted ? (
            <div className="text-center p-6 max-w-md bg-slate-950/90 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.25)] space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                <Zap className="w-8 h-8 text-cyan-300 animate-pulse" />
              </div>

              <div>
                <h1 className="text-xl font-orbitron font-extrabold text-cyan-200 hud-glow tracking-wider">
                  INITIALIZE J.A.R.V.I.S.
                </h1>
                <p className="text-xs text-cyan-400/80 font-mono-tech mt-1">
                  Personalized Voice Protocol for Engineer Abhishek
                </p>
              </div>

              <p className="text-xs text-cyan-300/80 leading-relaxed font-mono-tech">
                Command your terminal with your voice to open YouTube, play music, sing songs, and assist with engineering calculations.
              </p>

              <button
                onClick={handleInitializeJarvis}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-orbitron font-bold text-sm rounded-xl transition-all shadow-[0_0_25px_rgba(0,240,255,0.6)] cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START JARVIS VOICE PROTOCOL</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center space-y-6">
              {/* Interactive Arc Reactor Core */}
              <ArcReactor
                status={jarvisStatus}
                isListening={isListening}
                isSpeaking={isSpeaking}
                onToggleListen={toggleListening}
                onTriggerOverdrive={handleTriggerOverdrive}
              />

              {/* Status & Speech hint */}
              <div className="text-center space-y-1">
                <div className="text-xs sm:text-sm font-orbitron text-cyan-200 font-semibold tracking-wider flex items-center justify-center gap-2">
                  <span className="text-cyan-500">[WAKE PROTOCOL]:</span>
                  <span>Say <span className="text-amber-300">"Hey Jarvis"</span> or press <kbd className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono-tech">SPACE</kbd></span>
                </div>
                <p className="text-[11px] text-cyan-400/60 font-mono-tech">
                  Examples: "Open YouTube and play Iron Man", "Sing a song for Abhishek", "Calculate circuit"
                </p>
              </div>

              {/* Fast Action Dock */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                <button
                  onClick={() => handleVoiceInput("Jarvis, open YouTube and search songs")}
                  className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-orbitron flex items-center gap-2 transition-all shadow-sm"
                >
                  <Youtube className="w-4 h-4 text-red-400" />
                  <span>OPEN YOUTUBE</span>
                </button>

                <button
                  onClick={() => handleVoiceInput("Jarvis, sing Abhishek's engineering anthem")}
                  className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-orbitron flex items-center gap-2 transition-all shadow-sm"
                >
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>SING A SONG</span>
                </button>

                <button
                  onClick={handleTriggerOverdrive}
                  className="px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs font-orbitron flex items-center gap-2 transition-all shadow-sm"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>ARC OVERDRIVE</span>
                </button>

                <button
                  onClick={() => handleVoiceInput("Jarvis, status report and engineering diagnostics")}
                  className="px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-400/40 text-cyan-200 text-xs font-orbitron flex items-center gap-2 transition-all shadow-sm"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>DIAGNOSTICS</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Command Console Bar */}
      <footer className="relative z-30 px-3 sm:px-6 py-3 border-t border-cyan-500/30 bg-slate-950/95 backdrop-blur-md">
        <form
          onSubmit={handleManualSubmit}
          className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3"
        >
          {/* Mic Toggle Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Mute Microphone" : "Activate Voice Listening"}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse'
                : 'bg-slate-900 border-cyan-500/40 text-cyan-400 hover:bg-cyan-950 hover:border-cyan-300'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Text Command Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Speak aloud or type command: 'Open YouTube and play music' or 'Sing a song'..."
              className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-cyan-100 placeholder:text-cyan-600 focus:outline-none focus:border-cyan-300 font-mono-tech shadow-inner"
            />
          </div>

          {/* Submit / Transmit Button */}
          <button
            type="submit"
            disabled={!typedInput.trim()}
            className="px-4 sm:px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-orbitron font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span className="hidden sm:inline">TRANSMIT</span>
          </button>
        </form>
      </footer>

      {/* Floating / Embedded Modals */}
      <YouTubeHUD
        isOpen={youtubeOpen}
        onClose={() => setYoutubeOpen(false)}
        initialQuery={youtubeQuery}
      />

      <SingingStage
        isOpen={singingOpen}
        onClose={() => setSingingOpen(false)}
        requestedSongTitle={requestedSong}
      />

      <EngineeringHUD
        isOpen={engineeringOpen}
        onClose={() => setEngineeringOpen(false)}
      />

      <VoiceSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        wakeWordMode={wakeWordMode}
        onToggleWakeWord={setWakeWordMode}
      />

      <SetupGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
