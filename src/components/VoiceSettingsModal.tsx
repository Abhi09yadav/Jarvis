import React, { useState, useEffect } from 'react';
import { Settings, Volume2, Sliders, Check, X, Sparkles } from 'lucide-react';
import { jarvisVoiceEngine, VoiceOption } from '../utils/voiceSynthesis';
import { playConfirmSound, playBeep } from '../utils/soundEffects';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wakeWordMode: boolean;
  onToggleWakeWord: (val: boolean) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  wakeWordMode,
  onToggleWakeWord,
}) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.02);
  const [speechPitch, setSpeechPitch] = useState<number>(0.95);

  useEffect(() => {
    if (isOpen) {
      const v = jarvisVoiceEngine.getAvailableVoices();
      setVoices(v);
      const pref = v.find((x) => x.isPreferred) || v[0];
      if (pref && !selectedVoiceName) {
        setSelectedVoiceName(pref.voice.name);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectVoice = (opt: VoiceOption) => {
    playBeep();
    setSelectedVoiceName(opt.voice.name);
    jarvisVoiceEngine.setVoice(opt.voice);
  };

  const handleTestVoice = () => {
    playConfirmSound();
    jarvisVoiceEngine.speak("Voice calibration nominal, Abhishek. All vocal synthesizers tuned to your specifications.", {
      pitch: speechPitch,
      rate: speechRate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.3)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950 to-slate-900 border-b border-cyan-500/40">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            <h2 className="text-sm font-orbitron font-bold tracking-wider text-cyan-200">
              JARVIS AUDIO & VOICE SYNTHESIS SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Wake Word Setting */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-orbitron font-bold text-cyan-200">
                WAKE WORD DETECTION ("JARVIS")
              </div>
              <div className="text-[11px] text-cyan-400/70 font-mono-tech">
                Continuously listen in background for "Jarvis" / "Hey Jarvis"
              </div>
            </div>
            <button
              onClick={() => onToggleWakeWord(!wakeWordMode)}
              className={`px-3 py-1 rounded-full text-xs font-orbitron transition-all border ${
                wakeWordMode
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-800 border-slate-600 text-slate-400'
              }`}
            >
              {wakeWordMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Voice Personality Selector */}
          <div>
            <label className="text-xs font-orbitron text-cyan-300 block mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              AVAILABLE SYNTHESIZER VOICES
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-1">
              {voices.map((opt) => {
                const isSelected = opt.voice.name === selectedVoiceName;
                return (
                  <button
                    key={opt.voice.name}
                    onClick={() => handleSelectVoice(opt)}
                    className={`w-full p-2 rounded-lg text-left text-xs font-mono-tech flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-slate-900/50 border-cyan-900/50 text-cyan-400/80 hover:bg-cyan-900/30'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <span className="font-semibold">{opt.voice.name}</span>
                      <span className="text-[10px] text-cyan-500/80 ml-2">({opt.voice.lang})</span>
                      {opt.isPreferred && (
                        <span className="ml-2 px-1.5 py-0.2 bg-cyan-900/70 text-cyan-300 text-[9px] rounded border border-cyan-400/30">
                          JARVIS RECOMMENDED
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 ml-2 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rate & Pitch controls */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono-tech text-cyan-300 mb-1">
                <span>Speech Speed</span>
                <span>{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-tech text-cyan-300 mb-1">
                <span>Vocal Pitch</span>
                <span>{speechPitch}</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Test Voice Button */}
          <button
            onClick={handleTestVoice}
            className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-xs font-orbitron font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <Volume2 className="w-4 h-4 text-cyan-300" />
            <span>CALIBRATE & TEST JARVIS VOICE</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-cyan-500/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron text-xs font-bold rounded-lg transition-colors"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
