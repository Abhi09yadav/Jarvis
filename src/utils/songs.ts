/**
 * Song Library for JARVIS Performance Mode
 * Includes note frequencies, lyrics, and tempo for synchronized vocal & musical playback.
 */

export interface SongLine {
  text: string;
  notes: number[]; // Frequencies in Hz for procedural synth accompaniment
  delayMs: number;
}

export interface Song {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  tempoBpm: number;
  lines: SongLine[];
  description: string;
}

export const JARVIS_SONGS: Song[] = [
  {
    id: 'abhishek-engineering',
    title: "Abhishek's Engineering Anthem",
    subtitle: 'Special Tribute to Engineer Abhishek',
    genre: 'Synthwave / Heroic',
    tempoBpm: 128,
    description: 'A motivational anthem honoring Abhishek, conquering engineering formulas, circuits, and late night code!',
    lines: [
      {
        text: "Midnight in the lab, circuits burning bright!",
        notes: [261.63, 293.66, 329.63, 392.00], // C4, D4, E4, G4
        delayMs: 2800,
      },
      {
        text: "Abhishek is engineering the future through the night!",
        notes: [392.00, 329.63, 392.00, 523.25], // G4, E4, G4, C5
        delayMs: 3200,
      },
      {
        text: "Ohm's law, digital code, semiconductors gear in gear,",
        notes: [293.66, 329.63, 349.23, 440.00], // D4, E4, F4, A4
        delayMs: 3100,
      },
      {
        text: "No semester exam or bug shall ever strike us fear!",
        notes: [392.00, 440.00, 493.88, 523.25], // G4, A4, B4, C5
        delayMs: 3200,
      },
      {
        text: "Power up the Arc Reactor, maximum overdrive,",
        notes: [523.25, 493.88, 440.00, 392.00], // C5, B4, A4, G4
        delayMs: 2900,
      },
      {
        text: "Engineer Abhishek, the legend is alive!",
        notes: [392.00, 440.00, 523.25, 659.25], // G4, A4, C5, E5
        delayMs: 3300,
      }
    ]
  },
  {
    id: 'iron-man-arc',
    title: 'Iron Man Arc Repulsor Beat',
    subtitle: 'Stark Industries Classic',
    genre: 'Cyber Rock',
    tempoBpm: 135,
    description: 'Jarvis sings the iconic Iron Man tribute with repulsor power chords and supersonic rhythm.',
    lines: [
      {
        text: "Suit Mark eighty-five, titanium and gold,",
        notes: [220.00, 246.94, 261.63, 329.63], // A3, B3, C4, E4
        delayMs: 2800,
      },
      {
        text: "A story of genius Tony Stark told!",
        notes: [329.63, 293.66, 261.63, 220.00],
        delayMs: 2800,
      },
      {
        text: "Repulsor cannons charged at two-hundred percent,",
        notes: [261.63, 329.63, 392.00, 523.25],
        delayMs: 3000,
      },
      {
        text: "Breaking sonic barriers wherever we are sent!",
        notes: [523.25, 493.88, 440.00, 392.00],
        delayMs: 3100,
      },
      {
        text: "I am Jarvis, at your service every flight,",
        notes: [440.00, 493.88, 523.25, 659.25],
        delayMs: 3000,
      },
      {
        text: "Lighting up the universe in brilliant cyan light!",
        notes: [659.25, 587.33, 523.25, 659.25],
        delayMs: 3200,
      }
    ]
  },
  {
    id: 'believer-cyber',
    title: 'Believer (JARVIS AI Acoustic)',
    subtitle: 'Cyberpunk Rendition',
    genre: 'Electropop',
    tempoBpm: 125,
    description: 'Jarvis covers the legendary anthem of perseverance and strength.',
    lines: [
      {
        text: "First things first, I'mma say all the words inside my head,",
        notes: [261.63, 261.63, 293.66, 329.63],
        delayMs: 3200,
      },
      {
        text: "I'm fired up and tired of the way that things have been!",
        notes: [329.63, 349.23, 392.00, 329.63],
        delayMs: 3200,
      },
      {
        text: "Singing from the heartache, taking in the rain,",
        notes: [293.66, 329.63, 349.23, 293.66],
        delayMs: 3000,
      },
      {
        text: "Pain! You made me a, you made me a believer, believer!",
        notes: [392.00, 440.00, 523.25, 587.33],
        delayMs: 3400,
      },
      {
        text: "Let the repulsor bullets fly, oh let them rain!",
        notes: [523.25, 493.88, 440.00, 392.00],
        delayMs: 3000,
      }
    ]
  },
  {
    id: 'desi-techno-vibe',
    title: 'Desi Cyberpunk Groove',
    subtitle: 'Abhishek Protocol Dance Mix',
    genre: 'EDM / Desi Beats',
    tempoBpm: 130,
    description: 'A fun, energetic rhythm blend celebrating engineering college triumphs and beats!',
    lines: [
      {
        text: "Dhol beats pumping through the optic cable line,",
        notes: [293.66, 329.63, 392.00, 440.00],
        delayMs: 2900,
      },
      {
        text: "Abhishek drops the bass and the algorithm shines!",
        notes: [440.00, 493.88, 523.25, 587.33],
        delayMs: 3000,
      },
      {
        text: "Chai in the cup, coding all the night away,",
        notes: [392.00, 329.63, 293.66, 261.63],
        delayMs: 2800,
      },
      {
        text: "Balle Balle from Jarvis, have a glorious day!",
        notes: [329.63, 392.00, 523.25, 659.25],
        delayMs: 3100,
      }
    ]
  }
];
