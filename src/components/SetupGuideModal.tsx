import React, { useState } from 'react';
import { Terminal, Download, FileCode, Check, Copy, ExternalLink, Play, HelpCircle, X, ShieldCheck } from 'lucide-react';
import { playConfirmSound, playBeep } from '../utils/soundEffects';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'web' | 'bat' | 'python' | 'github'>('github');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    playConfirmSound();
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const batContent = `@echo off
setlocal EnableExtensions EnableDelayedExpansion
title JARVIS Voice Assistant Launcher
color 0B

echo =========================================================
echo       Starting J.A.R.V.I.S. Voice Assistant
echo       Personalized for Abhishek (Engineering Student)
echo =========================================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found on your system!
    echo Please install Python 3.11 or 3.12 from https://www.python.org/downloads/
    echo Make sure to check "Add python.exe to PATH" during installation.
    pause
    exit /b 1
)

echo [OK] Python is available.
python --version

if not exist "venv\\Scripts\\activate.bat" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Found existing virtual environment.
)

echo [2/3] Activating virtual environment...
call "venv\\Scripts\\activate.bat"

if not exist ".env" (
    if exist ".env.example" (
        echo [NOTICE] .env not found. Creating from .env.example...
        copy /Y ".env.example" ".env" >nul
        echo [ACTION REQUIRED] Open .env and paste your GEMINI_API_KEY.
    )
)

echo [3/3] Installing dependencies...
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [WARN] Some packages had issues. Trying PyAudio helper...
    pip install pipwin --quiet
    pipwin install pyaudio
)

echo.
echo =========================================================
echo    Launching JARVIS...
echo =========================================================
echo.

python main.py

echo.
echo Press any key to exit...
pause >nul`;

  const pythonScript = `import speech_recognition as sr
import pyttsx3
import webbrowser
import os
import sys
import time
from dotenv import load_dotenv

# Load optional GEMINI_API_KEY
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

# Initialize Text-To-Speech engine
engine = pyttsx3.init()
voices = engine.getProperty('voices')
# Try to set a British or male voice for JARVIS
for v in voices:
    if "david" in v.name.lower() or "george" in v.name.lower() or "uk" in v.name.lower() or "english" in v.name.lower():
        engine.setProperty('voice', v.id)
        break

engine.setProperty('rate', 175)    # Speed of speech
engine.setProperty('volume', 1.0)  # Volume level (0.0 to 1.0)

def speak(text):
    print(f"\\n[J.A.R.V.I.S.]: {text}")
    engine.say(text)
    engine.runAndWait()

def listen_command():
    recognizer = sr.Recognizer()
    recognizer.dynamic_energy_threshold = True
    with sr.Microphone() as source:
        print("\\n[LISTENING...] Standing by for command, Abhishek...")
        recognizer.adjust_for_ambient_noise(source, duration=0.8)
        audio = recognizer.listen(source, phrase_time_limit=8)

    try:
        print("[PROCESSING...] Decrypting vocal stream...")
        query = recognizer.recognize_google(audio, language='en-in')
        print(f"[YOU SAID]: {query}")
        return query.lower()
    except sr.UnknownValueError:
        return ""
    except sr.RequestError as e:
        print(f"[ERROR]: Speech service error: {e}")
        return ""

def sing_song():
    speak("Synthesizing melody for Engineer Abhishek.")
    lines = [
        "Midnight in the lab, circuits burning bright!",
        "Abhishek is engineering the future through the night!",
        "Ohm's law, digital code, semiconductors gear in gear,",
        "No semester exam or bug shall ever strike us fear!"
    ]
    for line in lines:
        speak(line)
        time.sleep(0.4)
    speak("Hope that meets Stark Industries standards, Sir.")

def main():
    speak("J.A.R.V.I.S. online. Welcome back, Abhishek. Standing by for your voice command.")
    while True:
        command = listen_command()
        if not command:
            continue

        if "open youtube" in command or "youtube" in command:
            # Extract search query if any
            clean = command.replace("open youtube and play", "").replace("open youtube", "").replace("youtube", "").replace("jarvis", "").strip()
            if clean:
                speak(f"Opening YouTube and searching for {clean}, Sir.")
                webbrowser.open(f"https://www.youtube.com/results?search_query={clean}")
            else:
                speak("Opening YouTube now, Sir.")
                webbrowser.open("https://www.youtube.com")

        elif "sing" in command or "song" in command:
            sing_song()

        elif "who are you" in command or "who made you" in command:
            speak("I am J.A.R.V.I.S., your dedicated engineering AI assistant, Commander Abhishek.")

        elif "diagnostics" in command or "status" in command:
            speak("All systems running at one hundred percent efficiency. Arc Reactor core temperature nominal.")

        elif "stop" in command or "exit" in command or "quit" in command:
            speak("Shutting down voice protocol. Good luck with your engineering studies, Abhishek.")
            sys.exit(0)

if __name__ == "__main__":
    main()`;

  const requirementsTxt = `SpeechRecognition>=3.10.0
pyttsx3>=2.90
python-dotenv>=1.0.0
pyaudio>=0.2.13`;

  const downloadFile = (filename: string, content: string) => {
    playConfirmSound();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950 border-2 border-cyan-400 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-cyan-500/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-orbitron font-bold tracking-wider text-cyan-200 flex items-center gap-2">
                <span>HOW TO RUN & IMPLEMENT YOUR FILES</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 font-mono-tech border border-cyan-400/30">
                  STEP-BY-STEP
                </span>
              </h2>
              <p className="text-[11px] text-cyan-400/70 font-mono-tech">
                Run both in this web app or execute your local Windows batch script (.bat)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cyan-500/20 text-cyan-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center px-5 pt-3 border-b border-cyan-500/20 bg-slate-900/50 gap-2 overflow-x-auto">
          <button
            onClick={() => {
              playBeep();
              setActiveTab('github');
            }}
            className={`px-4 py-2 text-xs font-orbitron font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'github'
                ? 'border-cyan-400 text-cyan-200 bg-cyan-950/40'
                : 'border-transparent text-cyan-500/70 hover:text-cyan-300'
            }`}
          >
            PUSH TO GITHUB
          </button>

          <button
            onClick={() => {
              playBeep();
              setActiveTab('web');
            }}
            className={`px-4 py-2 text-xs font-orbitron font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'web'
                ? 'border-cyan-400 text-cyan-200 bg-cyan-950/40'
                : 'border-transparent text-cyan-500/70 hover:text-cyan-300'
            }`}
          >
            1. WEB APP
          </button>

          <button
            onClick={() => {
              playBeep();
              setActiveTab('bat');
            }}
            className={`px-4 py-2 text-xs font-orbitron font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'bat'
                ? 'border-cyan-400 text-cyan-200 bg-cyan-950/40'
                : 'border-transparent text-cyan-500/70 hover:text-cyan-300'
            }`}
          >
            2. .BAT SCRIPT
          </button>

          <button
            onClick={() => {
              playBeep();
              setActiveTab('python');
            }}
            className={`px-4 py-2 text-xs font-orbitron font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'python'
                ? 'border-cyan-400 text-cyan-200 bg-cyan-950/40'
                : 'border-transparent text-cyan-500/70 hover:text-cyan-300'
            }`}
          >
            3. PYTHON SCRIPT
          </button>
        </div>

        {/* Tab content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'github' && (
            <div className="space-y-4 text-xs sm:text-sm font-mono-tech text-cyan-200">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/50 space-y-2">
                <div className="flex items-center gap-2 text-cyan-100 font-orbitron font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Push J.A.R.V.I.S. to Your Personal GitHub Account</span>
                </div>
                <p className="text-cyan-300/80 leading-relaxed text-xs">
                  Your project already has git initialized and the initial commit prepared on the <code className="text-amber-300">main</code> branch! Follow these 3 simple steps to link and push it to your GitHub profile.
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-cyan-500/20 space-y-2">
                <div className="flex items-center gap-2 text-cyan-100 font-orbitron text-xs font-semibold">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold">1</span>
                  <span>Create a New Repository on GitHub</span>
                </div>
                <p className="text-cyan-400/70 text-xs">
                  Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline font-semibold">github.com/new</a> and name it <code className="text-amber-300">jarvis-voice-assistant</code>.
                </p>
                <div className="text-[11px] text-amber-300/80 bg-amber-950/30 p-2 rounded border border-amber-500/20">
                  Tip: Leave "Add a README file" <strong>unchecked</strong> since this project already has a customized README and .gitignore.
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-100 font-orbitron text-xs font-semibold">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold">2</span>
                    <span>Link and Push with Terminal</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('git remote add origin https://github.com/YOUR_GITHUB_USERNAME/jarvis-voice-assistant.git\ngit branch -M main\ngit push -u origin main', 'gitpush')}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-100 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40"
                  >
                    {copiedKey === 'gitpush' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'gitpush' ? 'COPIED' : 'COPY COMMANDS'}</span>
                  </button>
                </div>

                <p className="text-cyan-400/70 text-xs">
                  Replace <code className="text-amber-300">YOUR_GITHUB_USERNAME</code> with your GitHub username:
                </p>

                <div className="p-3 rounded-lg bg-black/80 border border-cyan-500/30 font-mono-tech text-xs space-y-1.5 text-cyan-300">
                  <div className="text-cyan-500"># 1. Add your repository remote URL</div>
                  <div>git remote add origin https://github.com/<span className="text-amber-300">YOUR_GITHUB_USERNAME</span>/jarvis-voice-assistant.git</div>
                  <div className="text-cyan-500 mt-2"># 2. Push all code to main branch</div>
                  <div>git branch -M main</div>
                  <div>git push -u origin main</div>
                </div>
              </div>

              {/* Step 3 (SSH Option) */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-orbitron text-xs">Using SSH key instead?</span>
                  <button
                    onClick={() => copyToClipboard('git remote add origin git@github.com:YOUR_GITHUB_USERNAME/jarvis-voice-assistant.git\ngit branch -M main\ngit push -u origin main', 'gitssh')}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-100 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40"
                  >
                    {copiedKey === 'gitssh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'gitssh' ? 'COPIED' : 'COPY SSH'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded bg-black/60 border border-cyan-900/60 font-mono-tech text-[11px] text-cyan-400">
                  git remote add origin git@github.com:YOUR_GITHUB_USERNAME/jarvis-voice-assistant.git<br/>
                  git push -u origin main
                </div>
              </div>
            </div>
          )}

          {activeTab === 'web' && (
            <div className="space-y-4 text-xs sm:text-sm font-mono-tech text-cyan-200">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
                <div className="flex items-center gap-2 text-cyan-100 font-orbitron font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>The Web App is Already Live and Listening!</span>
                </div>
                <p className="text-cyan-300/80 leading-relaxed">
                  You don't even need to install Python if you want to use it right now. This full-stack AI Studio app has the complete audio visualizer, Arc Reactor, and voice engine embedded.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-orbitron text-cyan-300 font-semibold">How to start it in this browser:</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0 font-bold">1</span>
                    <div>
                      <span className="font-semibold text-cyan-100">Click the Center Arc Reactor or "START JARVIS VOICE PROTOCOL"</span>
                      <p className="text-cyan-400/70 text-xs mt-0.5">When your browser asks for Microphone permission, click <strong className="text-emerald-400">"Allow"</strong>.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0 font-bold">2</span>
                    <div>
                      <span className="font-semibold text-cyan-100">Speak your voice command aloud:</span>
                      <p className="text-amber-300 text-xs mt-0.5">• "Jarvis, open YouTube and play Believer"</p>
                      <p className="text-amber-300 text-xs mt-0.5">• "Jarvis, sing a song for Abhishek"</p>
                      <p className="text-amber-300 text-xs mt-0.5">• "Jarvis, sing Believer"</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center shrink-0 font-bold">3</span>
                    <div>
                      <span className="font-semibold text-cyan-100">Or type at the bottom:</span>
                      <p className="text-cyan-400/70 text-xs mt-0.5">If you are in a quiet room, type in the bottom box and hit <strong className="text-cyan-300">TRANSMIT</strong> or press Enter.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bat' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono-tech text-cyan-300/90 leading-relaxed">
                Your <code className="text-amber-300">run_jarvis.bat</code> script looks for <code className="text-cyan-200">main.py</code> and <code className="text-cyan-200">requirements.txt</code> in the same folder.
                Download the 3 files below, put them into a single folder on your PC, and double-click the <code className="text-amber-300">.bat</code> file!
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => downloadFile('run_jarvis.bat', batContent)}
                  className="p-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/50 text-cyan-200 text-xs font-orbitron flex flex-col items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>DOWNLOAD run_jarvis.bat</span>
                  <span className="text-[10px] text-cyan-400/60 font-mono-tech">Windows Launcher</span>
                </button>

                <button
                  onClick={() => downloadFile('main.py', pythonScript)}
                  className="p-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/50 text-purple-200 text-xs font-orbitron flex flex-col items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>DOWNLOAD main.py</span>
                  <span className="text-[10px] text-purple-400/60 font-mono-tech">Voice Code</span>
                </button>

                <button
                  onClick={() => downloadFile('requirements.txt', requirementsTxt)}
                  className="p-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/50 text-blue-200 text-xs font-orbitron flex flex-col items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>DOWNLOAD requirements.txt</span>
                  <span className="text-[10px] text-blue-400/60 font-mono-tech">Dependencies</span>
                </button>
              </div>

              {/* Code viewer for run_jarvis.bat */}
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-900/90">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-cyan-500/20 text-xs font-mono-tech">
                  <span className="text-cyan-400">run_jarvis.bat</span>
                  <button
                    onClick={() => copyToClipboard(batContent, 'bat')}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-100"
                  >
                    {copiedKey === 'bat' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bat' ? 'COPIED' : 'COPY SCRIPT'}</span>
                  </button>
                </div>
                <pre className="p-3 text-[11px] font-mono-tech text-cyan-300 overflow-x-auto max-h-52">
                  {batContent}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron text-cyan-300">
                  PYTHON IMPLEMENTATION (main.py)
                </span>
                <button
                  onClick={() => copyToClipboard(pythonScript, 'py')}
                  className="flex items-center gap-1 text-xs font-mono-tech text-cyan-300 hover:text-cyan-100 px-2 py-1 rounded bg-cyan-950 border border-cyan-500/40"
                >
                  {copiedKey === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'py' ? 'COPIED SCRIPT' : 'COPY main.py'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-900/90">
                <pre className="p-3 text-[11px] font-mono-tech text-cyan-200 overflow-x-auto max-h-60 leading-relaxed">
                  {pythonScript}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20 text-xs font-mono-tech text-cyan-300 space-y-1">
                <div className="text-cyan-100 font-bold font-orbitron">Requirements (requirements.txt):</div>
                <pre className="text-amber-300">{requirementsTxt}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-cyan-500/30 flex justify-between items-center">
          <span className="text-xs text-cyan-400/80 font-mono-tech">
            Abhishek Protocol • Windows & Web Deployment
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            CLOSE GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
