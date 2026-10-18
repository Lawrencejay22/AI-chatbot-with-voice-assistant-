# Buddy • AI Chatbot with Voice Assistant 🎙️✨

<div align="center">

![Buddy Logo](public/logo.svg)

### *Your intelligent, ultra-realistic voice companion for academic study, programming mastery, and hands-free cooking.*

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)](https://openai.com/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Voice%20AI-000000?logo=elevenlabs&logoColor=white)](https://elevenlabs.io/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [The Problem Statement](#-the-problem-statement)
3. [Core Capabilities & Knowledge Domains](#-core-capabilities--knowledge-domains)
4. [Voice Interaction Architecture & Modes](#-voice-interaction-architecture--modes)
5. [System Architecture](#-system-architecture)
6. [Project Scope](#-project-scope)
7. [Technical & Operational Limitations](#-technical--operational-limitations)
8. [Project Structure](#-project-structure)
9. [API Reference](#-api-reference)
10. [Environment Variables](#-environment-variables)
11. [Local Development & Setup](#-local-development--setup)
12. [Deployment to Vercel](#-deployment-to-vercel)
13. [Browser Compatibility](#-browser-compatibility)
14. [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**Buddy** is a modern, responsive multimodal AI companion web application engineered with vanilla HTML5/CSS3/JavaScript on the frontend and an Express server on Node.js. It pairs conversational intelligence (**OpenAI GPT-4o-mini**) with lifelike text-to-speech (**ElevenLabs TTS**) and browser-native speech recognition (**Web Speech API**).

Beyond simple Q&A, Buddy features specialized domain instructions and a fault-tolerant **Smart Offline Fallback Engine** that delivers structured, multi-step guidance across **Academic Study Mentoring**, **Software Engineering**, and **Hands-Free Kitchen Guidance**, ensuring the assistant remains responsive even when third-party APIs encounter rate limits or quota exhaustion.

---

## 🎯 The Problem Statement

### What pain points and gaps does Buddy solve?

Traditional conversational interfaces and legacy voice assistants often suffer from key limitations that degrade user experience:

- **Text Fatigue & Keyboard Friction**:
  - Typing lengthy questions on desktop or mobile keyboards is slow, tiring, and impractical when multitasking (e.g., studying, coding, or cooking with messy hands).
  - Users need a seamless, hands-free conversational interface that supports both spoken input and real-time audio playback.

- **Robotic, Monotone Synthetic Voices**:
  - Browser default speech synthesis and legacy TTS engines sound flat, mechanical, and emotionless.
  - People disengage quickly from an AI that sounds like an automated phone tree. Buddy leverages ElevenLabs neural voices (e.g., Sarah, Adam, Rachel) to produce lifelike cadence and tone.

- **Superficial Academic & Technical Answers**:
  - Generic chatbots frequently deliver shallow 1–2 sentence summaries that fail to teach complex STEM concepts or provide actionable code snippets.
  - Students and developers require structured, in-depth breakdowns: intuitive conceptual explanations, step-by-step proofs/algorithms, complete copy-ready code blocks, and high-yield exam/clean-code takeaways.

- **Hands-Free Cooking Dilemma in the Kitchen**:
  - When preparing meals (e.g., *Adobo*, *Sinigang*, baking *Cakes*, or mixing drinks), cooks have wet or oily hands and cannot touch screens.
  - Standard recipe sites overwhelm users with ads and fragmented text. Buddy provides a verbal 3-stage recipe format:
    1. Food Overview & Flavor Profile
    2. Step-by-Step Cooking Walkthrough
    3. Key Ingredients Checklist

- **API Quota Fragility & Downtime**:
  - Most AI web apps fail abruptly when an OpenAI API key runs out of credits, is misconfigured, or experiences network drops.
  - Buddy incorporates a comprehensive **Offline Smart Fallback Engine** in `server.js` that heuristically satisfies requests with structured lessons, recipes, and coding guidance without dropping the voice synthesis pipeline.

---

## 🧠 Core Capabilities & Knowledge Domains

Buddy’s system prompt and smart fallback engine are tuned for depth, clarity, and visual presentation:

### 1. 📚 Academic Study Mentoring
- **Mathematics**: Step-by-step algebraic solutions, quadratic equations, calculus principles, discriminant analysis, and formulas.
- **Biology**: Biochemical pathways (e.g., photosynthesis, cellular respiration, mitosis, DNA mechanics) with reaction locations and rate-limiting factors.
- **Chemistry**: Chemical bonding (ionic, covalent, metallic, hydrogen bonding), the octet rule, electronegativity trends, and acid-base dissociation.
- **Physics**: Classical mechanics, Newton's 3 Laws of Motion, work-energy theorem, and momentum conservation.
- **World History**: Comprehensive historical analyses (e.g., the M-A-I-N catalysts of WWI, turning points, and the Treaty of Versailles).
- **Study Techniques**: Active recall, the Feynman technique, spaced repetition schedules, blurting methods, and Pomodoro focus protocols.

### 2. 💻 Programming & Software Engineering
- **Modern JavaScript & TypeScript**: Immutability, ES6+ arrow functions, clean array transformations (`.map()`, `.filter()`, `.reduce()`).
- **Python Essentials**: List comprehensions, idiomatic functions, type hinting, and algorithm optimization.
- **Modern CSS Layouts**: Centering techniques with CSS Flexbox, Grid systems, and CSS custom properties (variables) for dynamic theme tokens.
- **4-Step Debugging Checklist**: Stack trace interpretation, reproduction, state isolation via breakpoints/logs, and incremental verification.
- **Developer Growth Roadmap**: 80/20 active building protocols, Git/GitHub practices, and algorithm problem-solving techniques.
- **Syntax-Highlighted Code Blocks**: Copy-to-clipboard buttons on all generated code snippets.

### 3. 🍳 Hands-Free Kitchen & Recipe Assistant
- **Savory Specialties**: Traditional Filipino comfort food including Chicken/Pork Adobo and Tamarind Pork/Shrimp Sinigang.
- **Baking & Pastry**: Classic moist chocolate cake, pastries, and desserts with baking temperatures and ingredient ratios.
- **Refreshing Beverages**: Mango Calamansi Coolers, fruit smoothies, coffee, and tea recipes.
- **Spoken 3-Part Recipe Framework**:
  1. *Food Overview & Flavor Profile*
  2. *Step-by-Step Cooking Instructions*
  3. *Key Ingredients & Measurements Checklist*

---

## 🎙️ Voice Interaction Architecture & Modes

Buddy provides flexible voice workflows suited for different user environments:

```
                  ┌──────────────────────────────────────────────┐
                  │           User Spoken Audio Input            │
                  └──────────────────────┬───────────────────────┘
                                         │
                         Web Speech API (STT Recognition)
                                         │
                  ┌──────────────────────┴───────────────────────┐
                  ▼                                              ▼
        [Dictation Mode]                                [Auto-Send Mode]
  Text populates the input bar                   Dispatches immediately on pause
  (review/edit before sending)                   (hands-free kitchen/study flow)
                  │                                              │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                                 [Send Message]
                                         │
                                         ▼
                         POST /api/chat (server.js)
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [OpenAI GPT-4o-mini API]                     [Smart Fallback Heuristic]
     Context-aware LLM reasoning                  Offline domain logic (zero outage)
                 └───────────────────────┬───────────────────────┘
                                         ▼
                              Structured Text Response
                                         │
                                         ▼
                         POST /api/voice (server.js)
                                         │
                          ElevenLabs API (TTS Synthesis)
                                         │
                                         ▼
                         Streaming MP3 Audio Buffer
                                         │
                                         ▼
                          Browser Audio Playback &
                          Dynamic Island Equalizer
```

### Voice Modes & Controls

- **Dictation Mode (Default)**: Spoken sentences stream live into the chat textarea. The user can review, edit, or append additional instructions before tapping Send.
- **Auto-Send Mode**: Automatically sends the captured message as soon as speech pause/silence is detected—ideal for completely hands-free scenarios while cooking or exercising.
- **Voice Overlay Modal**: A full-screen hands-free interface with pulsing audio visualizers, live transcript feedback, manual "Send Message" triggers, and quick exit controls.
- **Voice Persona Studio**: Switch between ElevenLabs vocal identities (e.g., Sarah, Adam, Rachel) with real-time audio sample previews.
- **Read-Aloud Toggles**: Global speech toggle in the top bar and settings, plus independent speaker buttons on every chat message bubble to replay audio at any time.

---

## 🏗️ System Architecture

Buddy is architected as an Express REST backend serving static assets with client-side state persistence:

- **Frontend**:
  - `public/Welcomepage.html`: Interactive onboarding experience featuring an animated 3D CSS/SVG robot companion with blinking eyes, glowing antenna, sound effects, and session authentication.
  - `public/index.html`: Main SPA shell containing 4 dynamic tabs:
    - **Home**: Quick action cards, greeting header, recent chat history, and service status indicators.
    - **AI Chat**: Conversational interface, live audio visualizer, Markdown renderer, and voice dictation tools.
    - **Voices**: ElevenLabs voice library browser with preview testing and voice selection.
    - **Settings**: Name customization, speech toggles (speak replies, auto-send), custom OpenAI API key override, and service health monitors.
  - `public/app.js`: Client-side state manager, Web Speech API controller, audio stream decoder, and tab router.
  - `public/style.css`: Modern glassmorphic theme with violet/cyan neon gradients, CSS custom properties, and responsive layouts for mobile and desktop screens.
- **Backend**:
  - `server.js`: Express server hosting API endpoints (`/api/chat`, `/api/voice`, `/api/voices`, `/api/config`) with audio pipelining and the smart fallback engine.
  - `vercel.json`: Serverless deployment configuration for Vercel.

---

## 📋 Project Scope

### In-Scope (Implemented Features)
- ✅ Full multimodal turn-taking: Speech-to-Text &rarr; LLM / Smart Fallback &rarr; Text-to-Speech audio streaming.
- ✅ Dual voice modes: Speech Dictation Mode vs. Hands-Free Auto-Send Mode.
- ✅ Full-screen hands-free Voice Overlay modal with real-time waveform visualization.
- ✅ ElevenLabs voice synthesis integration with live voice selection catalog (`/api/voices`).
- ✅ OpenAI GPT-4o-mini integration with custom system prompting for study, coding, and cooking.
- ✅ Fault-tolerant offline Smart Fallback engine covering STEM subjects, coding roadmaps, and recipes.
- ✅ Custom user-provided OpenAI API key support via request headers (`x-openai-key`) and local settings.
- ✅ Client-side persistence: chat history, active voice persona, audio toggles, and user name in `localStorage` and `sessionStorage`.
- ✅ Responsive glassmorphic dark-mode UI with dynamic island audio equalizer.
- ✅ Dedicated onboarding page with interactive 3D robot companion (`Welcomepage.html`).
- ✅ Vercel serverless deployment compatibility.

### Out-of-Scope (Deliberately Excluded)
- ❌ **Full-Duplex Barge-in Streaming**: Speech processing uses sequential turn-taking rather than full-duplex WebRTC audio interruption.
- ❌ **Native OS Command Execution**: The web app runs in a browser sandbox and does not execute desktop system commands (e.g., launching apps or adjusting OS volume).
- ❌ **Centralized Cloud Database**: All chats and preferences remain private to the user's browser storage without multi-tenant cloud user databases.
- ❌ **100% Offline Voice Synthesis**: While the chat fallback engine runs offline, high-fidelity neural voice synthesis requires an internet connection to the ElevenLabs API.

---

## ⚠️ Technical & Operational Limitations

| Area | Limitation | Impact & Context |
| :--- | :--- | :--- |
| **Pipeline Latency** | Multi-hop sequential roundtrip | Voice input &rarr; Web Speech STT &rarr; Express server &rarr; OpenAI GPT &rarr; ElevenLabs TTS &rarr; MP3 stream. Latency typically ranges between 1.5–3 seconds depending on network conditions. |
| **Browser Speech Support** | Web Speech API availability | Speech recognition uses `webkitSpeechRecognition`, which is supported in Google Chrome, Microsoft Edge, and Safari, but has limited support in Firefox. |
| **Autoplay Restrictions** | Browser audio policies | Modern browsers require an initial user click or tap before allowing programmatic audio playback. |
| **API Costs & Quotas** | Usage-based vendor billing | ElevenLabs charges per character synthesized; OpenAI charges per token. The Smart Fallback engine protects against broken experiences when quotas run out. |
| **Local Storage Limits** | Device-bound memory | Chat history is stored in browser `localStorage`. Clearing browser data or changing devices starts a fresh session. |

---

## 📂 Project Structure

```
AI Chatbot with voice assistant/
├── .env                          # Local environment variables (API keys, ports)
├── .gitignore                    # Git ignore file for secrets and dependencies
├── package.json                  # Node.js project manifest & dependencies
├── package-lock.json             # Locked dependency versions
├── README.md                     # Comprehensive project documentation
├── server.js                     # Express server, chat/voice API routes & fallback engine
├── vercel.json                   # Vercel serverless deployment configuration
└── public/                       # Static frontend assets
    ├── Welcomepage.html          # Onboarding page with animated 3D robot companion
    ├── index.html                # Main application SPA (Home, Chat, Voices, Settings)
    ├── app.js                    # Frontend state, Web Speech STT, audio player & UI logic
    ├── style.css                 # Glassmorphic cyberpunk styling & responsive layouts
    └── logo.svg                  # Vector brand identity icon
```

---

## 🔌 API Reference

### 1. `GET /api/config`
Checks the server configuration status.
- **Response**:
  ```json
  {
    "openaiConfigured": true
  }
  ```

### 2. `POST /api/chat`
Evaluates conversational messages using OpenAI GPT-4o-mini or the Smart Fallback engine.
- **Headers**:
  - `Content-Type: application/json`
  - `x-openai-key`: *(Optional)* User-provided OpenAI API key override.
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "How do I cook Chicken Adobo?" }
    ],
    "apiKey": "optional-key-override"
  }
  ```
- **Response (Standard)**:
  ```json
  {
    "reply": "🍲 Chicken Adobo is the quintessential Filipino comfort dish...",
    "isFallback": false
  }
  ```
- **Response (Smart Fallback)**:
  ```json
  {
    "reply": "🍲 What is Adobo?\nChicken or Pork Adobo is...",
    "isFallback": true,
    "notice": "OpenAI quota exhausted or billing issue. Showing smart fallback response."
  }
  ```

### 3. `POST /api/voice`
Synthesizes speech via ElevenLabs and streams back an MP3 audio buffer.
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "text": "Hello! I am Buddy, your AI companion.",
    "voiceId": "EXAVITQu4vr4xnSDxMaL"
  }
  ```
- **Response**: Binary audio stream (`Content-Type: audio/mpeg`).

### 4. `GET /api/voices`
Fetches the catalog of available voice identities from ElevenLabs.
- **Response**:
  ```json
  {
    "voices": [
      { "id": "EXAVITQu4vr4xnSDxMaL", "name": "Sarah" },
      { "id": "pNInz6obpgDQGcFmaJgB", "name": "Adam" }
    ]
  }
  ```

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following parameters:

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `3000` | Port for the local Express server. |
| `OPENAI_API_KEY` | Recommended | — | OpenAI API key for GPT-4o-mini chat responses. |
| `OPENAI_MODEL` | Optional | `gpt-4o-mini` | OpenAI language model identifier. |
| `ELEVENLABS_API_KEY` | Recommended | — | ElevenLabs API key for high-fidelity voice synthesis. |
| `ELEVENLABS_VOICE_ID`| Optional | `EXAVITQu4vr4xnSDxMaL` | Default ElevenLabs voice persona ID (Sarah). |
| `ELEVENLABS_MODEL` | Optional | `eleven_turbo_v2_5` | ElevenLabs synthesis model identifier. |

> [!NOTE]
> If `OPENAI_API_KEY` is omitted or invalid, Buddy automatically switches to the **Smart Offline Fallback Engine** so chat and voice features remain usable.

---

## 🚀 Local Development & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
- npm (installed with Node.js)
- A modern web browser (Google Chrome, Microsoft Edge, or Safari recommended for Web Speech STT)

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Lawrencejay22/AI-chatbot-with-voice-assistant-.git
   cd "AI Chatbot with voice assistant"
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
   ```

4. **Start the local server**:
   ```bash
   npm start
   ```

5. **Open the application**:
   - **Welcome / Onboarding Page**: [http://localhost:3000](http://localhost:3000) or [http://localhost:3000/Welcomepage.html](http://localhost:3000/Welcomepage.html)
   - **Main Chat & Voice Studio**: [http://localhost:3000/app](http://localhost:3000/app) (or bypass onboarding with `?bypass=1`)

---

## ☁️ Deployment to Vercel

Buddy includes native Vercel serverless configuration (`vercel.json`):

1. Push your repository to **GitHub**.
2. Visit [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New &rarr; Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID` (optional, defaults to `EXAVITQu4vr4xnSDxMaL`)
5. Click **Deploy**. Vercel will build the project and route both API endpoints and static assets automatically.

---

## 🌐 Browser Compatibility

| Browser | Speech Recognition (STT) | Audio Synthesis (TTS) | Recommended |
| :--- | :---: | :---: | :---: |
| **Google Chrome** (Desktop & Mobile) | ✅ Full Support | ✅ Full Support | ⭐ Best Experience |
| **Microsoft Edge** | ✅ Full Support | ✅ Full Support | ⭐ Best Experience |
| **Apple Safari** (macOS & iOS) | ✅ Full Support | ✅ Full Support | ✅ Fully Supported |
| **Mozilla Firefox** | ⚠️ Limited / Config Required | ✅ Full Support | Text Input Recommended |

> [!TIP]
> For the best voice experience, use Google Chrome or Microsoft Edge with microphone permissions granted.

---

## 📄 Contributing & License

Contributions, bug reports, and feature requests are welcome! Feel free to open an issue or submit a pull request.

This project is licensed under the **MIT License**.