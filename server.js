const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');

const app = express();
app.use(express.json({ limit: '256kb' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Welcomepage.html'));
});
app.get(['/welcome', '/welcomepage'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Welcomepage.html'));
});
app.get(['/app', '/chat', '/main'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public'), { index: false }));

const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = [
  'You are a friendly, conversational voice assistant and culinary companion.',
  'Your replies are spoken aloud with text-to-speech, so keep them natural, engaging, and spoken-friendly.',
  'Never use markdown, bullet point characters, or special symbols.',
  'When asked for recipes, food recommendations, desserts, or drinks (like adobo, sinigang, cakes, pastries, or cocktails):',
  'First, explain what the food or drink is, its flavor profile, and appeal.',
  'Second, walk through the step-by-step cooking or preparation process conversationally.',
  'Third, conclude with the key ingredients and measurements required.'
].join(' ');

app.get('/api/config', (req, res) => {
  res.json({ openaiConfigured: Boolean(OPENAI_KEY) });
});

function generateSmartFallback(messages) {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  
  if (/adobo/.test(lastMsg)) {
    return "Chicken or pork adobo is the quintessential Filipino comfort dish, featuring savory, tangy, and rich garlic-soy flavors with a hint of black pepper and bay leaves. To cook it, first sear your chicken or pork in a hot pan until golden, sauté minced garlic and onions, pour in soy sauce, vinegar, water, and whole peppercorns with bay leaves, then simmer gently for 30 to 40 minutes until tender and slightly reduced. Finally, the key ingredients you need are one kilogram of meat, half a cup of soy sauce, one-third cup of cane vinegar, a head of crushed garlic, two bay leaves, black peppercorns, and a spoonful of cooking oil.";
  }
  if (/sinigang/.test(lastMsg)) {
    return "Sinigang is a famous Filipino sour soup celebrated for its mouthwatering tamarind broth loaded with tender pork or shrimp and fresh greens. To cook it, boil your pork ribs in water with chopped onions and tomatoes until tender, stir in tamarind soup base or fresh sampaloc, then add radish, eggplant, long green chilies, and finish with water spinach kangkong for the last two minutes of simmering. For the ingredients, you will need pork ribs, fresh tomatoes, red onion, tamarind broth mix, daikon radish, string beans, kangkong, green finger chilies, and fish sauce to taste.";
  }
  if (/cake|bake|pastry|dessert|sweet/.test(lastMsg)) {
    return "A moist chocolate sponge cake is a classic sweet dessert with a rich cocoa aroma and tender crumb. To make it, whisk together your flour, sugar, and cocoa powder in a bowl, mix in eggs, milk, melted butter, and vanilla extract until smooth, pour into a greased baking pan, and bake at 350 degrees Fahrenheit or 175 Celsius for about 30 to 35 minutes until a toothpick comes out clean. For the ingredients, gather two cups of all-purpose flour, two cups of sugar, three-quarters cup of cocoa powder, two eggs, one cup of milk, half a cup of melted butter, two teaspoons of baking powder, and a splash of vanilla.";
  }
  if (/drink|beverage|cocktail|smoothie|coffee|tea|juice/.test(lastMsg)) {
    return "A refreshing mango calamansi cooler is a tropical beverage that balances sweet mango puree with citrusy calamansi zest over crushed ice. To prepare it, blend fresh ripe mango cheeks until smooth, stir in fresh calamansi juice and honey or simple syrup, pour into a tall glass filled with ice, and top with sparkling soda water. You will need two ripe mangoes, three tablespoons of calamansi or lime juice, two tablespoons of honey, crushed ice, and one cup of sparkling water.";
  }
  if (/recipe|cook|food|dish|dinner|lunch|breakfast/.test(lastMsg)) {
    return "I would love to help you cook! I can guide you through classic savory dishes like Adobo and Sinigang, delicious baked cakes, desserts, or refreshing beverages. Just tell me what you feel like making, and I will explain the dish, give you step-by-step cooking directions, and list the exact ingredients!";
  }
  if (/hello|hi|hey|greetings|morning|evening|afternoon/.test(lastMsg)) {
    const greetings = [
      "Hello! I am your AI voice buddy and cooking companion. How can I assist you with your day or your kitchen recipes today?",
      "Hi there! Great to hear from you. What would you like to explore, cook, or talk about?",
      "Hey! I'm ready to help you with recipes, code, answers, or creative ideas. What's on your mind?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  if (/program|code|python|javascript|learn|develop|html|css/.test(lastMsg)) {
    return "The best way to improve your programming skills is building hands-on projects, practicing algorithms, and reading documentation daily. Start with small features and scale up!";
  }
  if (/who are you|what are you|what can you do|about you/.test(lastMsg)) {
    return "I am your Personal AI Buddy! I can converse with you, guide you step-by-step through cooking delicious dishes, answer questions, and speak replies out loud using high quality voice synthesis.";
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
