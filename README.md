# Buddy • AI Chatbot with Voice Assistant 🎙️✨

A modern, responsive AI companion application powered by OpenAI and ElevenLabs voice synthesis. Optimized for both mobile and desktop experiences.

## Features

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