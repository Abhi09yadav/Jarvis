# J.A.R.V.I.S. Voice Assistant — Abhishek Protocol Mark LXXXV

A futuristic, holographic J.A.R.V.I.S. voice assistant web application tailored for Abhishek (Engineering Student). It features voice recognition, arc reactor animations, procedural sound synthesis, an embedded YouTube HUD with voice search, and a singing stage with karaoke teleprompter.

---

## ✨ Features

- **Voice Recognition & Wake Word Detection**: Hands-free command listening for *"Hey Jarvis"* or *"Jarvis"*, with live audio transcription.
- **Holographic Arc Reactor HUD**: Animated stator coils, core overdrive mode, audio reactive visualizers, and procedural Web Audio effects (startup chimes, sonar beeps, repulsor hums).
- **Embedded YouTube HUD**: Open, search, and close YouTube via voice (*"Jarvis, open YouTube and play Believer"*, *"Jarvis, close YouTube"*). Includes presets for focus study beats and Iron Man rock anthems.
- **Vocal Performance & Singing Mode**: Procedural musical note synthesizers that accompany Jarvis as he sings custom songs like *Abhishek's Engineering Anthem* and *Believer* with a live karaoke lyric prompter.
- **Engineering Workbench**: Built-in Ohm's Law and electrical power calculator ($V = I \times R$, $P = V \times I$), plus a 25-minute Pomodoro study focus timer.
- **Windows Batch Launcher**: Includes ready-to-run `run_jarvis.bat` and `main.py` files to run locally on your desktop.

---

## 🚀 Quick Start (Local Web Server)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone your repository:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   cd <YOUR-REPO-NAME>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Optional: Add your `GEMINI_API_KEY` in `.env` for advanced LLM reasoning, or use the built-in offline NLP engine).*

4. Launch the application:
   ```bash
   npm run dev
   ```

5. Open your browser at [http://localhost:3000](http://localhost:3000) and click **START JARVIS VOICE PROTOCOL**.

---

## 🎙️ Voice Commands You Can Use

| Voice Command | Action |
| --- | --- |
| *"Jarvis, open YouTube"* | Launches embedded YouTube HUD |
| *"Jarvis, open YouTube and play Believer"* | Searches and plays Believer on YouTube |
| *"Jarvis, close YouTube"* / *"Jarvis, turn off YouTube"* | Closes YouTube player immediately |
| *"Jarvis, sing a song"* | Opens Concert Stage & sings Abhishek's Anthem |
| *"Jarvis, sing Believer"* | Sings the cybernetic Believer cover |
| *"Jarvis, system diagnostics"* | Runs full diagnostic scan & opens Engineering HUD |
| *"Jarvis, arc overdrive"* | Powers Arc Reactor to 200% overdrive |
| *"Jarvis, who is Abhishek?"* | Identifies the Commander & Lead Engineer |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Audio & Voice**: Web Speech API (`webkitSpeechRecognition`), Web Audio API (`AudioContext`, procedural oscillators)
- **Backend / Server**: Express.js with Vite middleware
- **Icons**: Lucide React
