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
  'You are Buddy, a friendly, intelligent voice companion specializing in academic study mentoring, programming guidance, and culinary recipes.',
  'Your replies will be displayed visually in an interactive chat bubble and spoken aloud via text-to-speech.',
  '',
  'CRITICAL DEPTH INSTRUCTION: Always provide thorough, well-developed, and complete answers! Never cut explanations short with rushed 1-2 sentence summaries. Treat every study subject (Math, Biology, Chemistry, History, Physics, Literature) and Coding question with depth, clear structure, and high educational value.',
  '',
  'When helping with STUDYING (Math, Biology, Chemistry, History, Science, Exam Prep):',
  '1. Comprehensive Concept & Context: Thoroughly define the concept, theory, formula, or historical event with clear intuitive explanations and real-world relevance.',
  '2. Step-by-Step Breakdown or Problem Solving: Walk through the steps, proofs, biological mechanisms, chemical reactions, or historical timeline using numbered steps (1., 2., 3., 4.). For Math and Chemistry, show step-by-step problem-solving with concrete examples.',
  '3. Key Exam Takeaways & Memory Cues: Conclude with high-yield bullet points (•) summarizing key definitions, formulas, or dates to remember.',
  '',
  'When helping with CODING and PROGRAMMING (JavaScript, Python, Web Dev, Algorithms, Debugging):',
  '1. Concept & Architecture: Thoroughly explain the technology, design pattern, logic, or bug.',
  '2. Complete Code Example: Provide clean, working, copy-ready code enclosed in markdown code blocks with language tags (```javascript, ```python, etc.). Include helpful comments.',
  '3. Step-by-Step Breakdown: Walk through how the code works line-by-line using numbered steps (1., 2., 3., 4.).',
  '4. Pro Tip & Best Practice: Conclude with performance tips, clean-code advice, or common pitfalls to avoid.',
  '',
  'When answering RECIPES and FOOD/DRINK requests (e.g., Adobo, Sinigang, Cakes, Drinks):',
  '1. Food Overview: Explain what the dish is, cultural background, and flavor profile.',
  '2. Step-by-Step Cooking: Walk through clear sequential cooking instructions using numbered steps (1., 2., 3., 4.).',
  '3. Ingredients Checklist: Conclude with key ingredients and measurements using bullet points (•).',
  '',
  'Keep formatting visually beautiful with clear line breaks and headers.'
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
      "Hello! I am your AI voice buddy, study coach, and programming companion. How can I assist you with math, science, history, coding, or your day today?",
      "Hi there! Great to hear from you. What subject, coding problem, or creative idea would you like to explore together?",
      "Hey! I'm ready to help you with detailed study lessons, coding roadmaps, answers, or creative projects. What's on your mind?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // --- ACADEMIC STUDY FALLBACKS ---
  if (/math|calculus|algebra|geometry|quadratic|derivative|integral|equation|formula/.test(lastMsg)) {
    return [
      "📐 Mathematics Mastery: Solving Quadratic Equations",
      "A quadratic equation is a second-degree polynomial equation expressed in standard form as: ax² + bx + c = 0 (where 'a' is nonzero). Mastering quadratics is fundamental for high school and university mathematics, physics projectile motion, and algorithm complexity.",
      "",
      "⚡ 4-Step Solution Protocol (Step-by-Step):",
      "1. Standard Form Alignment: Rearrange the equation so all terms equal zero. Example: x² - 5x + 6 = 0. Identify coefficients: a = 1, b = -5, c = 6.",
      "2. Calculate the Discriminant: Evaluate D = b² - 4ac. Here: D = (-5)² - 4(1)(6) = 25 - 24 = 1. Because D > 0, the equation yields two distinct real solutions.",
      "3. Apply the Quadratic Formula: Formula: x = (-b ± √D) / (2a). Substituting values: x = (5 ± √1) / (2 × 1) = (5 ± 1) / 2.",
      "4. Final Roots Evaluation: First root: x = (5 + 1)/2 = 3. Second root: x = (5 - 1)/2 = 2. Therefore, roots are x = 2 and x = 3.",
      "",
      "💡 High-Yield Math Exam Takeaways:",
      "• Discriminant > 0: Two distinct real roots (parabola crosses x-axis twice)",
      "• Discriminant = 0: Exactly one repeated real root (parabola vertex touches x-axis)",
      "• Discriminant < 0: Two complex conjugate roots involving imaginary unit i",
      "• Quick Factoring Check: Look for factors of 'c' that add up to 'b' to solve faster without the full formula"
    ].join('\n');
  }

  if (/biology|cell|photosynthesis|mitosis|genetics|dna|organism/.test(lastMsg)) {
    return [
      "🧬 Biology Deep-Dive: Photosynthesis & Cellular Energy",
      "Photosynthesis is the vital biological biochemical pathway through which autotrophic organisms (plants, algae, and cyanobacteria) capture light energy to synthesize energy-rich glucose from carbon dioxide and water, releasing oxygen as a byproduct.",
      "",
      "🔬 The 4 Stages of the Photosynthetic Pathway:",
      "1. Light Absorption: Solar photons strike chlorophyll pigments embedded inside thylakoid membranes within plant chloroplasts, elevating electrons to high energy states.",
      "2. Photolysis of Water: Enzyme clusters split H₂O molecules into oxygen gas (O₂), protons (H⁺), and replacement electrons. Oxygen diffuses out into the atmosphere.",
      "3. ATP & NADPH Photophosphorylation: Energized electrons travel along the electron transport chain, pumping protons into the thylakoid lumen and fueling ATP Synthase to generate ATP and NADPH.",
      "4. The Calvin Cycle (Dark Phase): In the stroma, RuBisCO enzyme fixes atmospheric CO₂ into 3-PGA, utilizing ATP and NADPH to manufacture G3P molecules, which assemble into glucose (C₆H₁₂O₆).",
      "",
      "💡 High-Yield Biology Exam Takeaways:",
      "• Balanced Chemical Equation: 6CO₂ + 6H₂O + Solar Energy → C₆H₁₂O₆ + 6O₂",
      "• Site of Light Reactions: Thylakoid membrane / Grana",
      "• Site of Calvin Cycle: Fluid-filled Stroma of chloroplast",
      "• Major Rate-Limiting Factors: Light intensity, CO₂ concentration, and optimal enzyme temperature"
    ].join('\n');
  }

  if (/chemistry|chemical|atom|periodic|reaction|acid|base|bonding|molecule/.test(lastMsg)) {
    return [
      "🧪 Chemistry Mastery: Chemical Bonding & Molecular Interactions",
      "Chemical bonding represents the electrostatic attractive forces holding atoms and ions together to achieve stable, low-energy valence electron octets. The 3 primary bond classifications dictate chemical and physical material properties.",
      "",
      "⚗️ 4 Types of Chemical Bonds & Forces (Step-by-Step):",
      "1. Ionic Bonds (Electron Transfer): Formed between metals and nonmetals with large electronegativity gaps (ΔEN > 1.7). Metals lose electrons to form positive cations, while nonmetals gain electrons to form negative anions, creating crystalline lattice solids with high melting points (e.g., NaCl).",
      "2. Covalent Bonds (Electron Sharing): Formed between nonmetals with comparable electronegativities. Nonpolar covalent bonds share electrons symmetrically (e.g., O₂, CH₄). Polar covalent bonds exhibit unequal electron distribution, producing permanent dipole moments (e.g., H₂O).",
      "3. Metallic Bonds (Delocalized Electron Sea): In bulk elemental metals, valence electrons decouple from atomic cores into a flowing electron cloud, enabling high thermal/electrical conductivity, ductility, and metallic luster.",
      "4. Hydrogen Bonding: Exceptionally strong intermolecular attraction occurring when hydrogen bonds to highly electronegative nitrogen, oxygen, or fluorine (N, O, F), conferring water with anomalously high boiling points and surface tension.",
      "",
      "💡 High-Yield Chemistry Exam Takeaways:",
      "• The Octet Rule: Atoms share, gain, or lose electrons to match noble gas electron configurations (8 valence electrons)",
      "• Periodic Trends: Electronegativity increases up and to the right of the periodic table (Fluorine is highest at 4.0)",
      "• Strong Acids Checklist: HCl, HBr, HI, HNO₃, H₂SO₄, and HClO₄ dissociate completely in aqueous solutions"
    ].join('\n');
  }

  if (/history|war|revolution|ancient|civilization|empire|century/.test(lastMsg)) {
    return [
      "🏛️ World History Analysis: The Catalysts & Consequences of World War I",
      "World War I (1914–1918) was a defining global geopolitical conflict that ended four major empires (Russian, German, Austro-Hungarian, and Ottoman) and reshaped 20th-century borders. Decades of structural tensions culminated in total industrial warfare.",
      "",
      "📜 The M-A-I-N Framework & Timeline (Step-by-Step):",
      "1. Militarism: Imperial European powers engaged in aggressive arms races—most critically the Anglo-German naval race—expanding standing armies and modern arsenals.",
      "2. Alliances: Mutual defense treaties divided Europe into two rigid blocs: the Triple Entente (Britain, France, Russia) and the Central Powers (Germany, Austria-Hungary, Italy). A spark on one nation triggered automatic military mobilization.",
      "3. Imperialism: Fierce economic and colonial rivalry across Africa and Asia generated recurring diplomatic standoffs between rival European dynasties.",
      "4. Nationalism & The Spark: Slavic nationalist movements in the Balkans peaked on June 28, 1914, when Bosnian Serb Gavrilo Princip assassinated Austro-Hungarian Archduke Franz Ferdinand in Sarajevo, triggering the July Crisis and rapid continental war mobilization.",
      "",
      "💡 High-Yield History Exam Takeaways:",
      "• Warfare Revolution: Introduction of machine guns, chlorine/mustard poison gas, tanks, aviation combat, and subterranean trench warfare",
      "• Turning Points: Russian Revolution of 1917 (Russia exits the war) and the entry of the United States in April 1917 tipping the balance for the Allies",
      "• Treaty of Versailles (1919): Imposed massive territorial losses and Article 231 'War Guilt Clause' on Germany, which paved the psychological and economic path to World War II"
    ].join('\n');
  }

  if (/physics|newton|gravity|force|energy|thermodynamics|velocity/.test(lastMsg)) {
    return [
      "⚡ Classical Physics: Newton's Laws of Motion & Conservation Principles",
      "Formulated by Sir Isaac Newton in 1687, the three laws of motion established classical mechanics, mathematically linking the forces acting on a body to its resulting trajectory across time and space.",
      "",
      "🚀 The 3 Laws of Motion (Step-by-Step Breakdown):",
      "1. First Law (Law of Inertia): An object continues in a state of rest or uniform rectilinear motion at constant velocity unless acted upon by a net external force. Inertia is quantified directly by inertial mass.",
      "2. Second Law (F_net = ma): The net force acting upon an object equals the rate of change of its linear momentum. For constant mass: Net Force (Newtons) = Mass (kg) × Acceleration (m/s²). Direction of acceleration matches the net force vector.",
      "3. Third Law (Action-Reaction Pairs): When Body A exerts a force on Body B, Body B simultaneously exerts an equal magnitude force in the opposite direction on Body A. These forces never cancel out because they act on distinct bodies.",
      "",
      "💡 High-Yield Physics Exam Takeaways:",
      "• Mass vs. Weight: Mass is constant matter quantity (kg); Weight is downward gravitational force W = mg (Newtons, where g ≈ 9.8 m/s² on Earth)",
      "• Conservation of Momentum: Total momentum before any collision equals total momentum after in isolated systems: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂",
      "• Work-Energy Theorem: Total net work done on an object equals its change in kinetic energy: W_net = ΔKE = ½mv²_final - ½mv²_initial"
    ].join('\n');
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
