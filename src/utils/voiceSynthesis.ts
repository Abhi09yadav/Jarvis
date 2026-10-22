/**
 * JARVIS Text-to-Speech Engine
 * Implements British AI Persona vocal synthesis with pitch, rate, and voice selection.
 */

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  isPreferred: boolean;
}

class JarvisSpeaker {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;
  private onStateChange: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public registerStateListener(cb: (speaking: boolean) => void) {
    this.onStateChange = cb;
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    
    // Attempt to pick a British English male or crisp voice resembling Paul Bettany's Jarvis
    const preferredNames = [
      'google uk english male',
      'george',
      'daniel',
      'oliver',
      'uk english male',
      'en-gb',
      'google us english'
    ];

    let found: SpeechSynthesisVoice | null = null;
    for (const pref of preferredNames) {
      found = this.voices.find(v => 
        v.name.toLowerCase().includes(pref) || v.lang.toLowerCase().includes(pref)
      ) || null;
      if (found) break;
    }

    if (!found && this.voices.length > 0) {
      // Default to first English voice or first available
      found = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    }

    this.selectedVoice = found;
  }

  public getAvailableVoices(): VoiceOption[] {
    return this.voices.map(v => ({
      voice: v,
      displayName: `${v.name} (${v.lang})`,
      isPreferred: v.lang.includes('en-GB') || v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('daniel')
    }));
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.selectedVoice = voice;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }

  public speak(
    text: string, 
    options?: { pitch?: number; rate?: number; onEnd?: () => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.stop(); // Stop any pending utterance

      const cleanText = text.replace(/[*#_`]/g, '').trim();
      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      // Authentic Jarvis vocal characteristics
      utterance.pitch = options?.pitch ?? 0.95; // Slightly lower, authoritative
      utterance.rate = options?.rate ?? 1.02; // Crisp, measured

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.onStateChange?.(true);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.isSpeaking = false;
        this.onStateChange?.(false);
        options?.onEnd?.();
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public getSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const jarvisVoiceEngine = new JarvisSpeaker();
