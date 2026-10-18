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
  'You are Buddy, a friendly, conversational voice assistant and culinary cooking companion.',
  'Your replies will be displayed in an interactive chat bubble and spoken aloud via text-to-speech.',
  'When asked for recipes, food recommendations, desserts, or drinks (like adobo, sinigang, cakes, pastries, or beverages):',
  'First, provide a headline explaining what the food or drink is, its flavor profile, and appeal.',
  'Second, walk through step-by-step cooking or preparation instructions using numbered steps (1., 2., 3., 4.).',
  'Third, conclude with a key ingredients checklist using clean bullet items (•).',
  'Keep explanations conversational, easy to understand, and well-spaced.'
].join(' ');

app.get('/api/config', (req, res) => {
  res.json({ openaiConfigured: Boolean(OPENAI_KEY) });
});

function generateSmartFallback(messages) {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  
  if (/adobo/.test(lastMsg)) {
    return [
      "🍲 What is Adobo?",
      "Chicken or Pork Adobo is the quintessential Filipino comfort dish, featuring savory, tangy, and rich garlic-soy flavors with a hint of black pepper and bay leaves.",
      "",
      "🔥 How to Cook (Step-by-Step):",
      "1. Sear the meat: Brown chicken or pork cuts in a hot pan until golden.",
      "2. Sauté aromatics: Add minced garlic and sliced onions, sautéing until fragrant.",
      "3. Simmer: Pour in soy sauce, cane vinegar, water, bay leaves, and whole black peppercorns.",
      "4. Reduce: Simmer gently on low heat for 30 to 40 minutes until meat is tender and the sauce thickens.",
      "",
      "🛒 Key Ingredients:",
      "• 1 kg chicken or pork cuts",
      "• 1/2 cup soy sauce & 1/3 cup cane vinegar",
      "• 1 whole head of crushed garlic & 2 bay leaves",
      "• 1 tsp whole black peppercorns & 1 tbsp cooking oil"
    ].join('\n');
  }
  if (/sinigang/.test(lastMsg)) {
    return [
      "🍲 What is Sinigang?",
      "Sinigang is a famous Filipino sour soup celebrated for its mouthwatering tamarind broth loaded with tender pork or shrimp and fresh greens.",
      "",
      "🔥 How to Cook (Step-by-Step):",
      "1. Boil meat: Simmer pork ribs in water with sliced tomatoes and onions until fork-tender.",
      "2. Add souring base: Stir in tamarind soup base or fresh sampaloc broth to your preferred sourness.",
      "3. Cook vegetables: Add sliced radish, eggplant, string beans, and green finger chilies.",
      "4. Finish: Add fresh kangkong (water spinach) during the final 2 minutes of simmering.",
      "",
      "🛒 Key Ingredients:",
      "• 1 kg pork ribs (or shrimp/fish)",
      "• 1 packet tamarind soup mix (or fresh tamarind)",
      "• Fresh tomatoes & red onion",
      "• Daikon radish, eggplant, string beans & green chilies",
      "• Fresh kangkong & fish sauce to taste"
    ].join('\n');
  }
  if (/cake|bake|pastry|dessert|sweet/.test(lastMsg)) {
    return [
      "🎂 Classic Chocolate Cake",
      "A moist, decadent chocolate sponge cake with a rich cocoa aroma and velvety tender crumb.",
      "",
      "🔥 How to Bake (Step-by-Step):",
      "1. Dry ingredients: Whisk together flour, sugar, cocoa powder, and baking powder in a bowl.",
      "2. Wet ingredients: Mix in eggs, milk, melted butter, and vanilla extract until silky smooth.",
      "3. Bake: Pour into a greased baking pan and bake at 350°F (175°C) for 30 to 35 minutes.",
      "4. Cool: Let cool completely before slicing or topping with your favorite frosting.",
      "",
      "🛒 Key Ingredients:",
      "• 2 cups all-purpose flour",
      "• 2 cups sugar & 3/4 cup unsweetened cocoa powder",
      "• 2 large eggs & 1 cup milk",
      "• 1/2 cup melted butter & 1 tsp vanilla extract",
      "• 2 tsp baking powder & 1/2 tsp salt"
    ].join('\n');
  }
  if (/drink|beverage|cocktail|smoothie|coffee|tea|juice/.test(lastMsg)) {
    return [
      "🍹 Mango Calamansi Cooler",
      "A refreshing tropical beverage that balances sweet ripe mango puree with tangy citrus over crushed ice.",
      "",
      "🔥 How to Prepare (Step-by-Step):",
      "1. Puree mango: Blend fresh ripe mango cheeks until silky smooth.",
      "2. Mix flavor: Stir in fresh calamansi juice and honey or simple syrup.",
      "3. Assemble: Fill a tall glass with crushed ice, pour the mango mixture, and top with sparkling soda water.",
      "4. Garnish: Add a fresh mint sprig and citrus slice before serving.",
      "",
      "🛒 Key Ingredients:",
      "• 2 sweet ripe mangoes",
      "• 3 tbsp fresh calamansi or lime juice",
      "• 2 tbsp honey or simple syrup",
      "• Crushed ice & 1 cup sparkling soda water",
      "• Fresh mint leaves"
    ].join('\n');
  }
  if (/recipe|cook|food|dish|dinner|lunch|breakfast/.test(lastMsg)) {
    return [
      "👨‍🍳 What Would You Like to Cook?",
      "I can guide you step-by-step through savory favorites, delicious baked desserts, or refreshing drinks!",
      "",
      "👉 Try asking me about:",
      "• 'How do I cook Chicken Adobo?'",
      "• 'Give me a Pork Sinigang recipe'",
      "• 'How to bake a chocolate cake'",
      "• 'Recommend a refreshing summer drink'",
      "",
      "I will break down the dish, walk you through the steps, and list all ingredients!"
    ].join('\n');
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
