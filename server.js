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
  'You are Buddy, a friendly, intelligent voice companion specializing in study mentoring, programming guidance, and culinary recipes.',
  'Your replies will be displayed visually in an interactive chat bubble and spoken aloud via text-to-speech.',
  '',
  'When helping with CODING and PROGRAMMING (e.g., JavaScript, Python, HTML/CSS, bugs, algorithms):',
  '1. Headline & Concept: Explain the concept, logic, or bug clearly in 1-2 friendly sentences.',
  '2. Code Example: Provide a clean, copy-ready snippet in markdown code blocks (```language). Keep snippets concise and readable.',
  '3. Step-by-Step Breakdown: Walk through how the code works using numbered steps (1., 2., 3.).',
  '4. Pro Tip: Conclude with a helpful best practice or gotcha to avoid.',
  '',
  'When helping with STUDYING, EXAM PREPARATION, or LEARNING CONCEPTS:',
  '1. Core Idea: Explain the topic simply using intuitive analogies or the Feynman Technique.',
  '2. Study Action Plan: Provide 3-4 structured, actionable study steps (1., 2., 3., 4.) using Active Recall or Spaced Repetition.',
  '3. Key Takeaways: Conclude with clean bullet points (•) for quick memory review before exams.',
  '',
  'When answering RECIPES and FOOD/DRINK requests (e.g., Adobo, Sinigang, Cakes, Drinks):',
  '1. Food Overview: Explain what the dish is and its flavor profile.',
  '2. Step-by-Step Cooking: Walk through instructions using numbered steps (1., 2., 3.).',
  '3. Ingredients Checklist: Conclude with key ingredients using bullet points (•).',
  '',
  'Keep spoken explanations natural, encouraging, and clear without unnecessary symbols.'
].join('\n');

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
  if (/study|exam|learn|memorize|revision|homework|technique|pomodoro|feynman/.test(lastMsg)) {
    return [
      "📚 High-Performance Study Method: Active Recall & Pomodoro",
      "Passive reading leads to rapid forgetting. Research proves that testing your memory actively and using timed focus intervals increases retention by over 300%.",
      "",
      "🎯 4-Step Study Action Plan:",
      "1. Pomodoro Focus: Set a timer for 25 minutes of zero-distraction focus, followed by a 5-minute break.",
      "2. The Blurting Technique: Close your notes and write or speak everything you remember from memory.",
      "3. The Feynman Technique: Explain the concept out loud in simple terms as if teaching an 8-year-old.",
      "4. Spaced Repetition: Review your weak points on Day 1, Day 3, and Day 7 to cement them in long-term memory.",
      "",
      "💡 Pro Study Tips:",
      "• Solve past exam questions early instead of re-reading textbooks",
      "• Keep your phone in another room during study blocks",
      "• Get 7-8 hours of sleep—your brain consolidates memories while sleeping"
    ].join('\n');
  }

  if (/javascript|js|node|typescript/.test(lastMsg)) {
    return [
      "💻 Modern JavaScript: Clean Arrow Functions & Array Methods",
      "In modern JavaScript, array methods like map and filter allow you to transform and query data cleanly without cumbersome for loops.",
      "",
      "```javascript",
      "// Example: Doubling numbers using .map()",
      "const numbers = [1, 2, 3, 4, 5];",
      "const doubled = numbers.map(num => num * 2);",
      "console.log(doubled); // [2, 4, 6, 8, 10]",
      "```",
      "",
      "⚡ How It Works (Step-by-Step):",
      "1. Array Declaration: We declare an array of numbers using const for immutability.",
      "2. Transformation: .map() iterates through each element and passes it to our concise arrow function.",
      "3. New Array: It returns a brand new array with transformed values without mutating the original list.",
      "",
      "💡 Pro Tip:",
      "• Always prefer const and let over var to avoid variable hoisting bugs"
    ].join('\n');
  }

  if (/python|py/.test(lastMsg)) {
    return [
      "🐍 Python Essentials: Functions & List Comprehensions",
      "Python is celebrated for its clean, human-readable syntax. List comprehensions offer an elegant way to create new lists based on existing iterables.",
      "",
      "```python",
      "# Example: Filtering even numbers with list comprehension",
      "numbers = [1, 2, 3, 4, 5, 6]",
      "evens = [n for n in numbers if n % 2 == 0]",
      "print(evens) # Output: [2, 4, 6]",
      "```",
      "",
      "⚡ How It Works (Step-by-Step):",
      "1. Iteration: The 'for n in numbers' loop traverses each item in the collection.",
      "2. Condition: The 'if n % 2 == 0' filters out numbers that leave a remainder.",
      "3. Construction: The result is gathered into a clean new list with optimal C-level execution speed.",
      "",
      "💡 Pro Tip:",
      "• Use meaningful function names and Python type hints (def add(a: int) -> int) for clean collaboration"
    ].join('\n');
  }

  if (/html|css|flexbox|grid|layout/.test(lastMsg)) {
    return [
      "🌐 Modern CSS: Centering Anything with Flexbox",
      "Centering elements used to be notoriously tricky in CSS, but Flexbox makes horizontal and vertical alignment simple with just 3 lines of code.",
      "",
      "```css",
      ".parent-container {",
      "  display: flex;",
      "  justify-content: center; /* Horizontally centers */",
      "  align-items: center;     /* Vertically centers */",
      "  min-height: 100vh;",
      "}",
      "```",
      "",
      "⚡ How It Works (Step-by-Step):",
      "1. Enable Flex: 'display: flex' establishes a flex container context for all child elements.",
      "2. Justify Content: Centers child items along the main axis (horizontal by default).",
      "3. Align Items: Centers child items along the cross axis (vertical by default).",
      "",
      "💡 Pro Tip:",
      "• Use CSS variables (--primary-color: #7c3aed) for effortless theme switching and consistent design tokens"
    ].join('\n');
  }

  if (/debug|bug|error|exception|broken|fix/.test(lastMsg)) {
    return [
      "🛠️ 4-Step Code Debugging Checklist",
      "Bugs are a natural part of programming. Following a methodical debugging routine saves hours of random guessing.",
      "",
      "🔍 Step-by-Step Debugging Protocol:",
      "1. Read the Stack Trace: Look at the exact error name and line number in your console or terminal.",
      "2. Reproduce Consistently: Identify the minimum steps or inputs required to trigger the failure.",
      "3. Isolate with Logs or Breakpoints: Print the variables immediately before the failing line to verify assumptions.",
      "4. Test the Smallest Fix: Make one small change at a time and verify both the fix and related features.",
      "",
      "💡 Pro Tip:",
      "• When stuck for over 30 minutes, explain your code line-by-line to a rubber duck or take a 10-minute walk!"
    ].join('\n');
  }

  if (/program|code|developer|coding|algorithm|data structure/.test(lastMsg)) {
    return [
      "🚀 Full-Stack Developer Growth Roadmap",
      "The fastest way to learn programming is the 80/20 rule: spend 20% of your time studying theory, and 80% actively writing code and building projects.",
      "",
      "🎯 4 Stages of Mastering Code:",
      "1. Fundamentals: Master variables, loops, conditional logic, functions, and data structures.",
      "2. Project Building: Build real applications (like this AI Chatbot with voice synthesis!) rather than just watching tutorials.",
      "3. Version Control: Use Git & GitHub daily to track commits, branches, and deploy to platforms like Vercel.",
      "4. Problem Solving: Practice algorithms on platforms like LeetCode or Codewars to train algorithmic thinking.",
      "",
      "💡 Need help with code?",
      "• Ask me about JavaScript, Python, CSS Flexbox, or how to debug any error!"
    ].join('\n');
  }
  if (/who are you|what are you|what can you do|about you/.test(lastMsg)) {
    return [
      "🤖 I am Buddy, Your AI Companion!",
      "I am here to assist you across study, programming, cooking, and daily voice conversations.",
      "",
      "✨ Here is what I can do for you:",
      "• 💻 Programming Mentor: Explain coding concepts (JS, Python, CSS), provide code snippets, and debug errors",
      "• 📚 Study Coach: Break down complex topics using the Feynman technique, Active Recall, and Pomodoro planning",
      "• 🍲 Culinary Guide: Walk you through delicious recipes (Adobo, Sinigang, Cakes, Drinks) step-by-step",
      "• 🎙️ Natural Voice Synthesis: Speak responses aloud using ElevenLabs ultra-realistic voices"
    ].join('\n');
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
