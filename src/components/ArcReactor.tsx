import React from 'react';
import { Mic, MicOff, Volume2, Zap } from 'lucide-react';

interface ArcReactorProps {
  status: 'STANDBY' | 'LISTENING' | 'PROCESSING' | 'VOCALIZING' | 'OVERDRIVE';
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListen: () => void;
  onTriggerOverdrive?: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  status,
  isListening,
  isSpeaking,
  onToggleListen,
  onTriggerOverdrive,
}) => {
  const getCoreColor = () => {
    switch (status) {
      case 'OVERDRIVE':
        return 'from-amber-400 via-orange-500 to-red-500';
      case 'VOCALIZING':
        return 'from-cyan-300 via-sky-400 to-blue-600';
      case 'PROCESSING':
        return 'from-purple-400 via-indigo-500 to-cyan-400';
      case 'LISTENING':
        return 'from-emerald-300 via-teal-400 to-cyan-500';
      default:
        return 'from-cyan-400 via-sky-500 to-blue-700';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'OVERDRIVE':
        return 'ARC CORE 200% OVERDRIVE';
      case 'VOCALIZING':
        return 'JARVIS VOCAL SYNTHESIZER ACTIVE';
      case 'PROCESSING':
        return 'NEURAL QUANTUM COMPUTE ACTIVE';
      case 'LISTENING':
        return 'VOICE RECOGNITION ENGAGED';
      default:
        return 'SYSTEM NOMINAL • READY FOR COMMAND';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Outer telemetry circle */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        
        {/* Subtle holographic ambient ring */}
        <div 
          className={`absolute inset-0 rounded-full border border-cyan-500/20 transition-all duration-700 ${
            status === 'OVERDRIVE' ? 'border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.3)]' : 'shadow-[0_0_50px_rgba(0,240,255,0.2)]'
          }`}
        />

        {/* Outer Stator Ring with segmented markings */}
        <div 
          className={`absolute w-full h-full rounded-full border border-dashed border-cyan-400/40 ${
            isSpeaking ? 'spin-medium' : isListening ? 'spin-slow' : 'spin-slow'
          }`}
        />

        {/* Counter-rotating segmented ring */}
        <div 
          className={`absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-cyan-500/40 border-l-transparent ${
            isSpeaking ? 'spin-reverse-medium' : 'spin-reverse-slow'
          }`}
        />

        {/* Coil inductors ring (Iron Man 10 copper inductor blocks) */}
        <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full flex items-center justify-center pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 36) * (Math.PI / 180);
            const radius = 95; // px
            const x = Math.sin(angle) * radius;
            const y = -Math.cos(angle) * radius;
            const isActive = isSpeaking || isListening || status === 'OVERDRIVE';

            return (
              <div
                key={i}
                className="absolute w-4 h-6 sm:w-5 sm:h-7 rounded-sm transition-all duration-300 flex items-center justify-center"
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${i * 36}deg)`,
                  backgroundColor: isActive ? 'rgba(0, 240, 255, 0.4)' : 'rgba(15, 45, 60, 0.7)',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.9)' : '1px solid rgba(0, 180, 210, 0.3)',
                  boxShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.6)' : 'none',
                }}
              >
                <div className="w-1 h-3 bg-cyan-300/80 rounded-full" />
              </div>
            );
          })}
        </div>

        {/* Inner ring */}
        <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-cyan-400/60 flex items-center justify-center">
          <div className="w-full h-full rounded-full border border-dashed border-cyan-300/30 spin-slow" />
        </div>

        {/* Central Core Button & Pulse */}
        <button
          onClick={onToggleListen}
          title={isListening ? "Click to mute microphone" : "Click to activate voice command"}
          className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 focus:outline-none bg-gradient-to-tr ${getCoreColor()} shadow-[0_0_35px_rgba(0,240,255,0.7)] hover:scale-105 active:scale-95`}
        >
          {/* Internal crystalline reflection */}
          <div className="absolute inset-1 rounded-full bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-2 border border-cyan-300/60">
            {isSpeaking ? (
              <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 animate-pulse" />
            ) : isListening ? (
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300 animate-bounce" />
            ) : (
              <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500/70" />
            )}

            <span className="mt-1 text-[10px] sm:text-xs font-orbitron font-bold tracking-widest text-cyan-200">
              {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : 'TAP TO TALK'}
            </span>

            <span className="text-[9px] text-cyan-400/70 font-mono-tech">
              {isListening ? '"Hey Jarvis"' : 'MIC MUTED'}
            </span>
          </div>

          {/* Glowing pulse aura */}
          <div className={`absolute inset-0 rounded-full arc-pulse pointer-events-none opacity-60`} />
        </button>

        {/* Overdrive quick boost button badge */}
        {onTriggerOverdrive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTriggerOverdrive();
            }}
            className="absolute -bottom-3 z-20 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 text-xs font-orbitron hover:bg-cyan-500/20 transition-all flex items-center gap-1 shadow-md hover:border-cyan-300"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>BOOST CORE</span>
          </button>
        )}
      </div>

      {/* Real-time Status Readout */}
      <div className="mt-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30">
          <div 
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-600'
            }`} 
          />
          <span className="text-xs font-orbitron tracking-wider text-cyan-300 uppercase">
            {getStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
};
