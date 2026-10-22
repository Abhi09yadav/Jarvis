import { useState, useEffect, useRef, useCallback } from 'react';
import { playWakeSound, playConfirmSound, playProcessingSound, playStartupChime } from '../utils/soundEffects';
import { jarvisVoiceEngine } from '../utils/voiceSynthesis';

// Type definitions for Web Speech API
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

export interface VoiceCommandAction {
  type: 'OPEN_YOUTUBE' | 'CLOSE_YOUTUBE' | 'SING_SONG' | 'SYSTEM_DIAGNOSTICS' | 'ENGINEERING_ASSIST' | 'SPEAK_ONLY' | 'ARC_OVERDRIVE' | 'STOP_ALL';
  query?: string;
  songTitle?: string;
  genre?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  action?: VoiceCommandAction;
}

export function useJarvisVoice(onActionTriggered?: (action: VoiceCommandAction, spokenReply: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [wakeWordMode, setWakeWordMode] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [jarvisStatus, setJarvisStatus] = useState<'STANDBY' | 'LISTENING' | 'PROCESSING' | 'VOCALIZING' | 'OVERDRIVE'>('STANDBY');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const wakeWordModeRef = useRef(wakeWordMode);
  const isSpeakingRef = useRef(isSpeaking);
  const isListeningRef = useRef(isListening);
  const processingRef = useRef(false);

  wakeWordModeRef.current = wakeWordMode;
  isSpeakingRef.current = isSpeaking;
  isListeningRef.current = isListening;

  // Sync speaking state & automatically resume voice listening after speech ends
  useEffect(() => {
    jarvisVoiceEngine.registerStateListener((speaking) => {
      setIsSpeaking(speaking);
      if (speaking) {
        setJarvisStatus('VOCALIZING');
      } else {
        setJarvisStatus(isListeningRef.current ? 'LISTENING' : 'STANDBY');
        // Resume recognition cleanly if wakeWordMode is active
        if (wakeWordModeRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Already started or active
          }
        }
      }
    });
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setErrorNotice('Web Speech API not supported on this browser. You can type commands below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        if (!isSpeakingRef.current) {
          setJarvisStatus('LISTENING');
        }
        setErrorNotice(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        // If Jarvis is currently speaking, avoid self-listening loop
        if (isSpeakingRef.current || processingRef.current) {
          return;
        }

        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalTranscript) {
          const trimmed = finalTranscript.trim();
          setTranscript(trimmed);
          setInterimTranscript('');
          handleVoiceInput(trimmed);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setErrorNotice('Microphone access blocked. Click the microphone icon to grant permission.');
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically restart if wake word mode is active and not stopped intentionally
        if (wakeWordModeRef.current && !isSpeakingRef.current && !processingRef.current) {
          try {
            recognition.start();
          } catch {
            // Ignore if already active
          }
        } else {
          setJarvisStatus(isSpeakingRef.current ? 'VOCALIZING' : 'STANDBY');
        }
      };

      recognitionRef.current = recognition;
    } catch (e: any) {
      console.warn('Failed to init speech recognition:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Handle incoming voice command (or typed command)
  const handleVoiceInput = useCallback(async (rawText: string) => {
    if (!rawText.trim() || processingRef.current) return;

    processingRef.current = true;
    setJarvisStatus('PROCESSING');
    playProcessingSound();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Add user message to log
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawText,
      timestamp,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Local pattern check for instant responses
    const lower = rawText.toLowerCase();

    // Check wake word / command stripping
    let cleaned = rawText
      .replace(/hey\s*jarvis/i, '')
      .replace(/ok\s*jarvis/i, '')
      .replace(/jarvis/i, '')
      .trim();

    if (!cleaned) {
      // Just called "Jarvis"
      playConfirmSound();
      const reply = "Yes, Sir? I am listening. Abhishek Protocol is standing by.";
      jarvisVoiceEngine.speak(reply);
      setMessages((prev) => [
        ...prev,
        { id: `jarvis-${Date.now()}`, sender: 'jarvis', text: reply, timestamp },
      ]);
      processingRef.current = false;
      setJarvisStatus('STANDBY');
      return;
    }

    // Call server endpoint /api/jarvis/chat
    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleaned || rawText }),
      });

      if (!res.ok) {
        throw new Error('Server returned ' + res.status);
      }

      const data = await res.json();
      const spokenReply = data.replyText || "Right away, Sir.";
      const action = data.action || { type: 'SPEAK_ONLY' };

      playConfirmSound();

      // Add Jarvis message
      setMessages((prev) => [
        ...prev,
        {
          id: `jarvis-${Date.now()}`,
          sender: 'jarvis',
          text: spokenReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          action,
        },
      ]);

      // Fire callback for parent components (e.g. open YouTube, start singing, etc.)
      if (onActionTriggered) {
        onActionTriggered(action, spokenReply);
      }

      // Speak Jarvis response
      await jarvisVoiceEngine.speak(spokenReply);
    } catch (err) {
      console.warn('Error in voice chat fetch, executing local command fallback:', err);
      // Robust offline execution
      executeLocalFallback(cleaned || rawText, timestamp);
    } finally {
      processingRef.current = false;
      setJarvisStatus(isListeningRef.current ? 'LISTENING' : 'STANDBY');
    }
  }, [onActionTriggered]);

  // Local fallback command execution
  const executeLocalFallback = (text: string, timestamp: string) => {
    const lower = text.toLowerCase();
    let spokenReply = "Understood, Sir. Protocol updated.";
    let action: VoiceCommandAction = { type: 'SPEAK_ONLY' };

    // Close / Off YouTube command
    if (
      (lower.includes('close') || lower.includes('off') || lower.includes('shut') || lower.includes('hide') || lower.includes('exit')) &&
      lower.includes('youtube')
    ) {
      spokenReply = "Closing YouTube HUD right away, Sir.";
      action = { type: 'CLOSE_YOUTUBE' };
    } else if (lower.includes('youtube')) {
      const query = text.replace(/open\s*youtube/i, '').replace(/youtube/i, '').trim();
      spokenReply = query ? `Opening YouTube and searching for ${query}, Sir.` : "Opening YouTube interface, Sir.";
      action = { type: 'OPEN_YOUTUBE', query: query || 'Tony Stark Iron Man Theme' };
    } else if (lower.includes('sing') || lower.includes('song')) {
      spokenReply = "Tuning vocal resonators, Sir. Initiating performance protocol for Engineer Abhishek.";
      let songTitle = "Abhishek's Engineering Anthem";
      if (lower.includes('believer')) songTitle = 'Believer';
      if (lower.includes('iron man') || lower.includes('suit') || lower.includes('back in black')) songTitle = 'Iron Man Arc Repulsor Beat';
      action = { type: 'SING_SONG', songTitle };
    } else if (lower.includes('diagnostic') || lower.includes('status')) {
      spokenReply = "System scan complete, Sir. All cores operational at one hundred percent capacity. Arc reactor nominal.";
      action = { type: 'SYSTEM_DIAGNOSTICS' };
    } else if (lower.includes('who is abhishek') || lower.includes('who am i')) {
      spokenReply = "You are Abhishek, the chief engineer and Commander of this terminal. Destined for greatness, Sir.";
      action = { type: 'SPEAK_ONLY' };
    } else if (lower.includes('stop') || lower.includes('mute') || lower.includes('quiet')) {
      spokenReply = "All audio streams terminated, Sir.";
      jarvisVoiceEngine.stop();
      action = { type: 'STOP_ALL' };
    } else {
      spokenReply = `Command noted: "${text}". Standing by for your directive, Abhishek.`;
    }

    playConfirmSound();
    setMessages((prev) => [
      ...prev,
      {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: spokenReply,
        timestamp,
        action,
      },
    ]);

    if (onActionTriggered) {
      onActionTriggered(action, spokenReply);
    }
    jarvisVoiceEngine.speak(spokenReply);
  };

  // Start or Stop listening manually
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorNotice('Microphone is not initialized in this browser.');
      return;
    }

    if (isListening) {
      setWakeWordMode(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
      setIsListening(false);
      setJarvisStatus('STANDBY');
    } else {
      playWakeSound();
      setWakeWordMode(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn(e);
      }
      setIsListening(true);
      setJarvisStatus('LISTENING');
    }
  };

  const manualSpeakCommand = (text: string) => {
    handleVoiceInput(text);
  };

  return {
    isListening,
    wakeWordMode,
    setWakeWordMode,
    transcript,
    interimTranscript,
    jarvisStatus,
    setJarvisStatus,
    isSpeaking,
    messages,
    speechSupported,
    errorNotice,
    toggleListening,
    handleVoiceInput: manualSpeakCommand,
  };
}
