# Buddy • AI Chatbot with Voice Assistant 🎙️✨

A modern, responsive AI companion application powered by OpenAI and ElevenLabs voice synthesis. Optimized for both mobile and desktop experiences.

## 1. The Problem Statement

### What pain points and gaps does this product solve?

Modern conversational interfaces and legacy voice assistants often suffer from key limitations that degrade the user experience:

- **Text Fatigue and High Interaction Friction**:
  - Traditional chatbots require constant keyboard typing, which is slow, tiring, and impractical when multitasking (e.g., cooking, studying, coding, or on mobile devices, then for driving).
  - Users increasingly expect natural, hands-free conversational computing.
- **Kitchen & Recipe Guidance Friction (Hands-Free Cooking Dilemma)**:
  - While cooking or baking, users' hands are often wet, oily, or covered in ingredients (e.g., preparing meals like *Adobo* or *Sinigang*, baking *Cakes*, or mixing drinks), making it messy and unhygienic to touch screens or type queries.
  - Standard recipe sites and chatbots overwhelm cooks with walls of text, ads, and disjointed formats instead of delivering a natural, spoken flow: explaining the food first, providing step-by-step cooking directions, and concluding with a clear list of ingredients.
- **The "Uncanny Valley" of Robotic Synthetic Voices**:
  - Standard device voices (default browser speech or robotic legacy TTS) sound flat, monotone, and disconnected from human emotion.
  - People disengage quickly when an AI sounds like an automated telephone system rather than a friendly, expressive conversational partner.
- **Cold, Sterile Chatbot Interfaces**:
  - Most AI applications are either minimalist terminal-like clones or corporate forms lacking warmth, personality, and engaging micro-interactions.
  - Users lack an emotional connection or sense of companionship with the tool.
- **Fragility and API Quota Lockout**:
  - Many AI applications crash or display generic error walls the moment an API key expires, rate-limits, or loses connectivity.
  - Users need a system that degrades gracefully so the conversation and voice interaction never abruptly die.

---

## 2. Project Scope

The scope defines the exact functional boundaries of the application: what is built in this version (**In-Scope**) and what is deliberately left out (**Out-of-Scope**).

### In-Scope (What the Application Implements)

- **Multimodal Turn-Taking Pipeline**:
  - **Voice-to-Text (STT)**: Hands-free input using the browser's Web Speech API (`webkitSpeechRecognition`).
  - **Conversational Intelligence (LLM)**: Context-aware reasoning via OpenAI (`gpt-4o-mini`) governed by a specialized voice prompt (`server.js`) designed for natural 1–3 sentence spoken dialogue.
  - **Ultra-Realistic Voice Synthesis (TTS)**: High-fidelity audio streaming powered by the ElevenLabs API (`/api/voice`).
- **Voice Studio & Persona Customization**:
  - Dynamic retrieval of available voices (`/api/voices`), allowing the user to select and test different vocal identities (e.g., Sarah, Adam, Rachel).
- **Interactive Recipe & Culinary Recommendation Engine**:
  - Specialized food, dessert, and beverage guidance tailored for hands-free cooking in the kitchen (e.g., Filipino favorites like *Adobo* and *Sinigang*, baked pastries like *Cakes*, sweet desserts, and refreshing drinks).
  - Follows a structured 3-part spoken culinary breakdown:
    1. **Food Overview & Flavor Profile**: Explaining the background, taste, and appeal of the dish or drink first.
    2. **Step-by-Step Cooking Instructions**: Guiding the user conversationally through each cooking step in order.
    3. **Key Ingredients Checklist**: Summarizing the required ingredients, spices, and measurements at the end.
- **Fault-Tolerant Smart Fallback Engine**:
  - An integrated offline heuristic responder (`generateSmartFallback` in `server.js`) that keeps the voice assistant functioning even without an active OpenAI API key or when quota is exhausted.
- **Modern Multi-Screen Glassmorphic Experience**:
  - Onboarding screen with animated 3D companion robot (`Welcomepage.html`).
  - Multi-tab application layout (`index.html`): Home Dashboard, AI Chat Studio, Voice Studio, and Settings.
  - Responsive design for both desktop widescreen and mobile touchscreens with audio visualizer animations.
- **Client-Side Persistence**:
  - Storing user preferences (audio toggles, custom API keys, selected voice ID, chat history) in `localStorage` and `sessionStorage`.

### Out-of-Scope (Deliberately Excluded)

- **Full-Duplex Barge-in / Interruption Streaming**:
  - The current model follows sequential turn-taking (Listen &rarr; Transcribe &rarr; Infer &rarr; Speak), rather than real-time WebRTC audio streaming where user speech interrupts the bot mid-word.
- **Native OS & Device Control**:
  - The bot cannot execute system-level commands (e.g., adjusting device volume, launching desktop apps, or managing calendar events).
- **Centralized Multi-Tenant Cloud Database**:
  - No user account creation, password hashing, or cloud synchronization across devices (data remains private to the user's local browser).
- **Completely Offline Voice Synthesis**:
  - While chat fallback logic can run offline, high-fidelity ElevenLabs voice synthesis requires an active internet connection.

---

## 3. Technical & Operational Limitations

| Area | Limitation | Impact & Context |
| :--- | :--- | :--- |
| **Pipeline Latency** | Sequential multi-hop roundtrip | Audio must be transcribed &rarr; sent to Node server &rarr; evaluated by OpenAI &rarr; sent to ElevenLabs &rarr; streamed back to the browser. This creates a 1.5–3 second latency window. |
| **API Costs & Rate Limits** | Usage-based billing | ElevenLabs charges per character and OpenAI charges per token. Heavy voice synthesis can consume tier quotas rapidly. |
| **Browser Compatibility** | Web Speech API differences | Voice-to-text relies on browser implementations (`webkitSpeechRecognition`), which work best in Google Chrome and Microsoft Edge, but have limited support in Firefox. |
| **Autoplay Policies** | Browser audio sandboxing | Modern browsers block audio from playing automatically without an explicit initial user click/tap. |
| **Response Formatting** | Conciseness constraint | Because answers are spoken aloud, the AI is prompted to avoid markdown, bullet lists, and code blocks, making it less suitable for reading long code snippets aloud. |
| **Local Storage Limits** | Device-bound memory | Conversation history is saved in the browser's `localStorage`; clearing browser cookies or switching computers starts a fresh session. |

---

## 4. Why You Are Building This (Product Vision & Rationale)

- **Humanizing Artificial Intelligence**:
  - Most people perceive AI as a cold query-response machine. Giving it an expressive human-like voice, a welcoming identity ("Buddy"), and visual cues transforms it into an empathetic everyday companion.
- **Accessibility & Universal Usability**:
  - Voice interaction lowers the barrier for users with visual impairments, motor difficulties, or dyslexia, while offering convenience for anyone working hands-free.
- **Dedicated Hands-Free Kitchen & Culinary Companion**:
  - Solves the practical challenge of cooking, baking, and mixing drinks with messy hands. Users can explore delicious meals (like *Adobo* and *Sinigang*), baked desserts (like *Cakes*), and beverages completely hands-free with a clear 3-stage verbal recipe breakdown (food explanation, cooking steps, ingredients).
- **Demonstrating Full-Stack Engineering Mastery**:
  - Bridges multiple modern technologies into a cohesive architecture without relying on heavy frameworks:
    - **Frontend**: Pure HTML5, modern CSS3 (glassmorphism, CSS variables, CSS grid/flex), and Vanilla ES6+ JavaScript.
    - **Backend**: Node.js & Express REST API with audio stream pipelining.
    - **AI Integration**: Orchestrating multi-vendor APIs (OpenAI + ElevenLabs + Web Speech API).
    - **Resilient Architecture**: Handling network drops, missing keys, and quota exhaustion gracefully.
- **Customizability Over Vendor Lock-in**:
  - Instead of being locked into a single assistant persona (like Siri or Alexa), the user has direct control over the voice persona (Voice Studio), custom API keys, and privacy.

---

## 5. Core Features

- **Multi-Screen Experience**:
  - **Welcome Page**: Dedicated onboarding experience with interactive 3D-styled animated robot companion.
  - **Home Dashboard**: Quick action cards, recent chat history, and voice status.
  - **AI Chat Studio**: Clean messaging bubble interface with real-time text and speech read aloud.
  - **Voice Studio**: ElevenLabs voice library selector to customize your assistant's voice persona.
  - **Settings**: Audio toggles, display personalization, and API key management.
- **Voice Intelligence**:
  - ElevenLabs text-to-speech audio streaming.
  - SpeechRecognition for hands-free voice-to-text input.
- **Aesthetic Design**:
  - Glassmorphic dark cyberpunk palette with violet and cyan neon accents.
  - Custom vector logo badge (`logo.svg`).

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express
- **APIs**: OpenAI API (GPT), ElevenLabs API (Voice Synthesis)
- **Deployment**: Vercel Serverless Ready (`vercel.json`)

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open in browser:
   - Dashboard: `http://localhost:3000`
   - Welcome Page: `http://localhost:3000/Welcomepage.html`

## Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set your Environment Variables in the Vercel Project Settings:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID`
4. Click **Deploy**.