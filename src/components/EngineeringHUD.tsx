import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Clock, Zap, Calculator, Terminal, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { playConfirmSound, playBeep } from '../utils/soundEffects';
import { jarvisVoiceEngine } from '../utils/voiceSynthesis';

interface EngineeringHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineeringHUD: React.FC<EngineeringHUDProps> = ({ isOpen, onClose }) => {
  // Ohm's Law Calculator State
  const [voltage, setVoltage] = useState('12');
  const [current, setCurrent] = useState('2');
  const [resistance, setResistance] = useState('6');
  const [power, setPower] = useState('24');

  // Study Focus Pomodoro State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);

  // Live Telemetry Simulation
  const [cpuClock, setCpuClock] = useState('4.82 GHz');
  const [arcThermal, setArcThermal] = useState('38.4 °C');
  const [memoryUsage, setMemoryUsage] = useState('32%');

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuClock((4.7 + Math.random() * 0.4).toFixed(2) + ' GHz');
      setArcThermal((37.5 + Math.random() * 2.2).toFixed(1) + ' °C');
      setMemoryUsage((30 + Math.floor(Math.random() * 8)) + '%');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Pomodoro countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomodoroActive && pomodoroSeconds > 0) {
      timer = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && pomodoroActive) {
      setPomodoroActive(false);
      jarvisVoiceEngine.speak("Abhishek, your engineering study cycle is complete. Take a well-earned break, Sir.");
      playConfirmSound();
    }
    return () => clearInterval(timer);
  }, [pomodoroActive, pomodoroSeconds]);

  if (!isOpen) return null;

  const handleCalculateOhms = (changedField: 'v' | 'i' | 'r', val: string) => {
    const num = parseFloat(val) || 0;
    if (changedField === 'v') {
      setVoltage(val);
      const r = parseFloat(resistance) || 1;
      const calcI = num / r;
      setCurrent(calcI.toFixed(2));
      setPower((num * calcI).toFixed(2));
    } else if (changedField === 'i') {
      setCurrent(val);
      const r = parseFloat(resistance) || 1;
      const calcV = num * r;
      setVoltage(calcV.toFixed(2));
      setPower((calcV * num).toFixed(2));
    } else if (changedField === 'r') {
      setResistance(val);
      const v = parseFloat(voltage) || 0;
      const calcI = num !== 0 ? v / num : 0;
      setCurrent(calcI.toFixed(2));
      setPower((v * calcI).toFixed(2));
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950 border-2 border-cyan-400 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-cyan-500/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-orbitron font-bold tracking-wider text-cyan-200 flex items-center gap-2">
                <span>ABHISHEK PROTOCOL: ENGINEERING SUITE</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 font-mono-tech border border-cyan-400/30">
                  SYSTEM ACTIVE
                </span>
              </h2>
              <p className="text-[11px] text-cyan-400/70 font-mono-tech">
                Dedicated engineering workbench for circuits, formulas, and deep study
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/40 rounded-lg text-xs font-orbitron text-cyan-300 transition-colors"
          >
            DISMISS HUD
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-cyan-500/30">
              <div className="text-[10px] font-orbitron text-cyan-400/70 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                NEURAL CORE CLOCK
              </div>
              <div className="text-lg font-orbitron font-bold text-cyan-200 mt-1 hud-glow">
                {cpuClock}
              </div>
              <div className="text-[9px] text-emerald-400 font-mono-tech">100% HEALTHY</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-cyan-500/30">
              <div className="text-[10px] font-orbitron text-cyan-400/70 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                ARC THERMAL
              </div>
              <div className="text-lg font-orbitron font-bold text-amber-300 mt-1">
                {arcThermal}
              </div>
              <div className="text-[9px] text-cyan-400/70 font-mono-tech">LIQUID NITROGEN COOL</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-cyan-500/30">
              <div className="text-[10px] font-orbitron text-cyan-400/70 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-cyan-400" />
                MEMORY LOAD
              </div>
              <div className="text-lg font-orbitron font-bold text-cyan-200 mt-1">
                {memoryUsage}
              </div>
              <div className="text-[9px] text-cyan-400/70 font-mono-tech">64 GB QUANTUM RAM</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-cyan-500/30">
              <div className="text-[10px] font-orbitron text-cyan-400/70 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                COMMANDER
              </div>
              <div className="text-lg font-orbitron font-bold text-cyan-100 mt-1 truncate">
                Abhishek
              </div>
              <div className="text-[9px] text-cyan-400/70 font-mono-tech">LEAD ENGINEER</div>
            </div>
          </div>

          {/* Section: Ohm's Law & Circuit Quick Calculator */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-orbitron text-cyan-200 font-bold flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>CIRCUIT CALCULATOR (OHM'S LAW: V = I × R)</span>
              </div>
              <span className="text-[10px] font-mono-tech text-cyan-400/60">
                P = V × I = I²R
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-cyan-400/80 font-mono-tech block mb-1">
                  Voltage (V - Volts)
                </label>
                <input
                  type="number"
                  value={voltage}
                  onChange={(e) => handleCalculateOhms('v', e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-sm font-mono-tech text-cyan-100 focus:outline-none focus:border-cyan-300"
                />
              </div>

              <div>
                <label className="text-[10px] text-cyan-400/80 font-mono-tech block mb-1">
                  Current (I - Amperes)
                </label>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => handleCalculateOhms('i', e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-sm font-mono-tech text-cyan-100 focus:outline-none focus:border-cyan-300"
                />
              </div>

              <div>
                <label className="text-[10px] text-cyan-400/80 font-mono-tech block mb-1">
                  Resistance (R - Ohms Ω)
                </label>
                <input
                  type="number"
                  value={resistance}
                  onChange={(e) => handleCalculateOhms('r', e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-sm font-mono-tech text-cyan-100 focus:outline-none focus:border-cyan-300"
                />
              </div>

              <div>
                <label className="text-[10px] text-amber-400/90 font-mono-tech block mb-1">
                  Calculated Power (P - Watts)
                </label>
                <div className="w-full bg-slate-900/80 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-sm font-mono-tech text-amber-300">
                  {power} W
                </div>
              </div>
            </div>
          </div>

          {/* Section: Study & Coding Focus Timer (Pomodoro) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-orbitron font-bold text-cyan-200">
                  ENGINEERING STUDY FOCUS TIMER
                </div>
                <div className="text-[11px] text-cyan-400/70 font-mono-tech">
                  25-minute deep focus cycle with Jarvis vocal checkpoints
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-3xl font-orbitron font-extrabold text-cyan-100 tracking-widest hud-glow">
                {formatTimer(pomodoroSeconds)}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playBeep();
                    setPomodoroActive(!pomodoroActive);
                  }}
                  className={`p-2 rounded-lg font-orbitron text-xs flex items-center gap-1 cursor-pointer transition-all ${
                    pomodoroActive
                      ? 'bg-amber-600/40 border border-amber-500 text-amber-200'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                  }`}
                >
                  {pomodoroActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{pomodoroActive ? 'PAUSE' : 'START FOCUS'}</span>
                </button>

                <button
                  onClick={() => {
                    playBeep();
                    setPomodoroActive(false);
                    setPomodoroSeconds(25 * 60);
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 transition-colors"
                  title="Reset 25 mins"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Voice Commands for Engineering */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
            <div className="text-[11px] font-orbitron text-cyan-300 uppercase tracking-wider mb-2">
              VOICE DIRECTIVES ABHISHEK CAN SAY:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-tech text-cyan-200/90">
              <div className="p-1.5 rounded bg-slate-900/60 border border-cyan-900/60">
                • <span className="text-amber-300">"Jarvis, open YouTube and play study beats"</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-cyan-900/60">
                • <span className="text-amber-300">"Jarvis, sing an engineering anthem"</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-cyan-900/60">
                • <span className="text-amber-300">"Jarvis, what is Kirchoff's voltage law?"</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-cyan-900/60">
                • <span className="text-amber-300">"Jarvis, run system diagnostics"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
