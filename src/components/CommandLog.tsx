import React from 'react';
import { Terminal, User, Bot, Volume2, Youtube, Music, Sparkles } from 'lucide-react';
import { ChatMessage, VoiceCommandAction } from '../hooks/useJarvisVoice';
import { jarvisVoiceEngine } from '../utils/voiceSynthesis';

interface CommandLogProps {
  messages: ChatMessage[];
  interimTranscript: string;
  onExecuteAction?: (action: VoiceCommandAction) => void;
}

export const CommandLog: React.FC<CommandLogProps> = ({
  messages,
  interimTranscript,
  onExecuteAction,
}) => {
  const getActionBadge = (action?: VoiceCommandAction) => {
    if (!action || action.type === 'SPEAK_ONLY') return null;

    if (action.type === 'OPEN_YOUTUBE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-[10px] text-red-300 font-mono-tech">
          <Youtube className="w-3 h-3" />
          <span>YouTube: {action.query || 'Launch'}</span>
        </span>
      );
    }

    if (action.type === 'CLOSE_YOUTUBE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-red-500/40 text-[10px] text-red-300 font-mono-tech">
          <Youtube className="w-3 h-3 text-red-400" />
          <span>YouTube Closed</span>
        </span>
      );
    }

    if (action.type === 'SING_SONG') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] text-purple-300 font-mono-tech">
          <Music className="w-3 h-3" />
          <span>Singing: {action.songTitle || 'Anthem'}</span>
        </span>
      );
    }

    if (action.type === 'SYSTEM_DIAGNOSTICS') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono-tech">
          <Sparkles className="w-3 h-3" />
          <span>Diagnostics Executed</span>
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border border-cyan-500/30 rounded-xl overflow-hidden backdrop-blur-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-cyan-500/20">
        <div className="flex items-center gap-1.5 text-xs font-orbitron text-cyan-300 font-semibold">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>NEURAL COMMAND TRANSCRIPT</span>
        </div>
        <span className="text-[10px] text-cyan-400/60 font-mono-tech">
          {messages.length} ENTRIES
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-[300px] sm:max-h-[360px]">
        {messages.length === 0 && !interimTranscript && (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-cyan-600/80 space-y-2">
            <Bot className="w-8 h-8 text-cyan-500/30" />
            <p className="text-xs font-mono-tech">
              Command feed standing by.
            </p>
            <p className="text-[11px] text-cyan-500/60 font-mono-tech">
              Try saying: <span className="text-cyan-400">"Jarvis, open YouTube"</span> or <span className="text-cyan-400">"Jarvis, sing a song"</span>
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2.5 rounded-lg border text-xs sm:text-sm font-mono-tech transition-all ${
              msg.sender === 'user'
                ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200 ml-4'
                : 'bg-slate-900/80 border-cyan-400/40 text-cyan-100 mr-4 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-[10px] font-orbitron font-semibold">
                {msg.sender === 'user' ? (
                  <>
                    <User className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300">ABHISHEK</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-cyan-300" />
                    <span className="text-cyan-400">J.A.R.V.I.S.</span>
                  </>
                )}
              </div>
              <span className="text-[9px] text-cyan-500/60">{msg.timestamp}</span>
            </div>

            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

            {/* Action Badges & Re-run */}
            {msg.action && (
              <div className="mt-2 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between">
                <div>{getActionBadge(msg.action)}</div>
                {msg.sender === 'jarvis' && (
                  <button
                    onClick={() => jarvisVoiceEngine.speak(msg.text)}
                    className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center gap-1"
                    title="Repeat speech"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Repeat</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Interim / Live Voice stream preview */}
        {interimTranscript && (
          <div className="p-2.5 rounded-lg border border-dashed border-emerald-400/50 bg-emerald-950/20 text-emerald-200 text-xs font-mono-tech ml-4 animate-pulse">
            <div className="text-[9px] font-orbitron text-emerald-400 mb-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              VOICE DETECTED...
            </div>
            <span>"{interimTranscript}"</span>
          </div>
        )}
      </div>
    </div>
  );
};
