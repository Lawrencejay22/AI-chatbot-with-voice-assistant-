const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = [
  'You are a friendly, concise voice assistant.',
  'Your replies are spoken aloud with text-to-speech, so keep them short and conversational, usually 1-3 sentences.',
  'Never use markdown, bullet points, or special symbols.'
].join(' ');

app.get('/api/config', (req, res) => {
  res.json({ openaiConfigured: Boolean(OPENAI_KEY) });
});

function generateSmartFallback(messages) {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  
  if (/hello|hi|hey|greetings|morning|evening|afternoon/.test(lastMsg)) {
    const greetings = [
      "Hello! I am your AI voice buddy. How can I assist you with your day today?",
      "Hi there! Great to hear from you. What would you like to explore or talk about?",
      "Hey! I'm ready to help you with code, answers, or creative ideas. What's on your mind?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  if (/program|code|python|javascript|learn|develop|html|css/.test(lastMsg)) {
    return "The best way to improve your programming skills is building hands-on projects, practicing algorithms, and reading documentation daily. Start with small features and scale up!";
  }
  if (/who are you|what are you|what can you do|about you/.test(lastMsg)) {
    return "I am your Personal AI Buddy! I can converse with you, provide programming guidance, answer questions, and speak replies out loud using high quality voice synthesis.";
  }
  if (/weather|forecast|rain|temperature/.test(lastMsg)) {
    return "I don't have access to live GPS sensor data right now, but you can check your local weather app or let me know what city you're curious about!";
  }
  if (/joke|funny|laugh/.test(lastMsg)) {
    return "Why do programmers prefer dark mode? Because light attracts bugs!";
  }
  if (/thank|thanks|awesome|great|cool|good job/.test(lastMsg)) {
    return "You're very welcome! I'm always here to assist you whenever you need help.";
  }
  
  return `That's an interesting question about "${messages[messages.length - 1]?.content?.slice(0, 30)}...". I'm here to help you dive deeper into that or assist with any coding and creative challenges you have!`;
}

app.post('/api/chat', async (req, res) => {
  const customKey = req.headers['x-openai-key'] || req.body.apiKey;
  const apiKeyToUse = customKey || OPENAI_KEY;
  const history = Array.isArray(req.body.messages) ? req.body.messages : [];
  const valid = history.length > 0 && history.every(
    (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length > 0
  );
  if (!valid) {
    return res.status(400).json({ error: 'Invalid messages.' });
  }

  if (!apiKeyToUse) {
    const reply = generateSmartFallback(history);
    return res.json({ 
      reply, 
      isFallback: true, 
      notice: 'OPENAI_API_KEY is not set. Responded with smart offline assistant mode.' 
    });
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyToUse}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-30)]
      })
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.warn('OpenAI upstream warning:', detail);
      // Fallback gracefully so speech synthesis & conversation never break
      const fallbackReply = generateSmartFallback(history);
      return res.json({ 
        reply: fallbackReply, 
        isFallback: true, 
        notice: 'OpenAI quota exhausted or billing issue. Showing smart fallback response.' 
      });
    }

    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      return res.json({ reply: generateSmartFallback(history), isFallback: true });
    }
    res.json({ reply, isFallback: false });
  } catch (err) {
    console.error('Chat error:', err);
    res.json({ 
      reply: generateSmartFallback(history), 
      isFallback: true, 
      notice: `Network error reaching OpenAI (${err.message}). Using offline buddy response.` 
    });
  }
});

app.post('/api/voice', async (req, res) => {
  if (!ELEVENLABS_KEY) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY is not set.' });
  }
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text) return res.status(400).json({ error: 'text is required.' });
  if (text.length > 5000) return res.status(400).json({ error: 'text is too long (max 5000 characters).' });
  const voiceId = (typeof req.body.voiceId === 'string' && req.body.voiceId.trim()) || process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
  try {
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5'
      })
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(502).json({ error: `ElevenLabs request failed: ${detail}` });
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.status(500).json({ error: `Voice error: ${err.message}` });
  }
});

app.get('/api/voices', async (req, res) => {
  if (!ELEVENLABS_KEY) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY is not set.' });
  }
  try {
    const upstream = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': ELEVENLABS_KEY }
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(502).json({ error: `ElevenLabs request failed: ${detail}` });
    }
    const data = await upstream.json();
    const voices = (data.voices || []).map((v) => ({ id: v.voice_id, name: v.name }));
    res.json({ voices });
  } catch (err) {
    res.status(500).json({ error: `Voices error: ${err.message}` });
  }
});

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Voice chatbot running at http://localhost:${PORT}`);
    if (!OPENAI_KEY) {
      console.log('WARNING: OPENAI_API_KEY is not set. Chat replies are disabled until you add it to .env and restart.');
    }
  });
}

module.exports = app;
