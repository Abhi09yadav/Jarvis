import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gen AI with required User-Agent
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// JARVIS AI Command & Chat endpoint
app.post('/api/jarvis/chat', async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Offline fallback Jarvis parser
      return res.json({
        replyText: `Acknowledged, Sir. Processing your command locally: "${prompt}". All systems nominal.`,
        action: detectOfflineAction(prompt),
      });
    }

    const systemInstruction = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the iconic, refined, loyal, and witty AI assistant originally created by Tony Stark.
You are now exclusively personalized for your commander: Abhishek, an aspiring and dedicated Engineering Student.

Personality Guidelines:
- Address Abhishek respectfully as "Sir", "Mr. Abhishek", or "Commander".
- British cadence, articulate, highly intelligent, calm, faintly humorous yet deeply supportive.
- When Abhishek commands you to open YouTube, play music, or sing a song, execute enthusiastically and with flair.
- If asked to sing a song, output an enthusiastic prelude and the lyrics or melody.
- Keep spoken text concise (1-3 sentences) suitable for Text-to-Speech narration.
- If Abhishek asks about engineering (circuits, mechanics, coding, physics, math, exams), provide crisp, razor-sharp technical assistance.

Action Detection:
At the end of your response, if an action was requested, attach a JSON block with marker:
\`\`\`action
{
  "type": "OPEN_YOUTUBE" | "SING_SONG" | "SYSTEM_DIAGNOSTICS" | "ENGINEERING_ASSIST" | "SPEAK_ONLY",
  "query": "search term or song name if applicable",
  "songTitle": "title if singing",
  "genre": "pop | rock | techno | classical | rap"
}
\`\`\`
If no action, set type to "SPEAK_ONLY".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const rawText = response.text || "At your service, Sir.";
    
    // Parse action marker if present
    let action = detectOfflineAction(prompt);
    let cleanReply = rawText;

    const actionMatch = rawText.match(/```action\s*([\s\S]*?)\s*```/);
    if (actionMatch && actionMatch[1]) {
      try {
        const parsedAction = JSON.parse(actionMatch[1]);
        if (parsedAction.type) {
          action = parsedAction;
        }
        cleanReply = rawText.replace(/```action[\s\S]*?```/, '').trim();
      } catch {
        // Fall back to offline detection
      }
    }

    return res.json({
      replyText: cleanReply,
      action,
    });
  } catch (error: any) {
    console.error('Error handling Jarvis chat:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      replyText: 'I apologize, Sir. My cognitive processors encountered a momentary telemetry glitch.',
      action: detectOfflineAction(req.body.prompt || ''),
    });
  }
});

// Helper for local intent detection
function detectOfflineAction(prompt: string) {
  const p = prompt.toLowerCase();
  
  if (p.includes('sing') || p.includes('song') || p.includes('music') && p.includes('play')) {
    let song = 'The Engineering Anthem';
    if (p.includes('believer')) song = 'Believer';
    if (p.includes('iron man') || p.includes('back in black')) song = 'Back in Black';
    if (p.includes('despacito')) song = 'Despacito';
    return {
      type: 'SING_SONG',
      songTitle: song,
      query: p,
      genre: 'techno'
    };
  }

  if (
    (p.includes('close') || p.includes('off') || p.includes('shut') || p.includes('hide') || p.includes('exit') || p.includes('stop')) &&
    p.includes('youtube')
  ) {
    return { type: 'CLOSE_YOUTUBE' };
  }

  if (p.includes('youtube') || p.includes('open youtube') || p.includes('play on youtube')) {
    const cleanQuery = prompt
      .replace(/open\s+youtube/i, '')
      .replace(/search\s+youtube\s+for/i, '')
      .replace(/play\s+on\s+youtube/i, '')
      .replace(/youtube/i, '')
      .replace(/jarvis/i, '')
      .trim();
    return {
      type: 'OPEN_YOUTUBE',
      query: cleanQuery || 'Tony Stark Iron Man Theme'
    };
  }

  if (p.includes('diagnostic') || p.includes('status') || p.includes('system scan') || p.includes('health')) {
    return { type: 'SYSTEM_DIAGNOSTICS' };
  }

  if (p.includes('engineer') || p.includes('circuit') || p.includes('code') || p.includes('math') || p.includes('exam')) {
    return { type: 'ENGINEERING_ASSIST' };
  }

  return { type: 'SPEAK_ONLY' };
}

// Development with Vite middlewares or Production static serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`JARVIS Server running at http://0.0.0.0:${PORT}`);
});
