/* ==========================================================
   AI BUDDY • APPLICATION LOGIC & VOICE ENGINE
   Seamless Mobile & Desktop Chat Experience
   ========================================================== */

(() => {
  const welcomeScreen = document.getElementById('welcome-screen');
  const homeScreen = document.getElementById('home-screen');
  const chatScreen = document.getElementById('chat-screen');
  const voicesScreen = document.getElementById('voices-screen');
  const settingsScreen = document.getElementById('settings-screen');

  const chatEl = document.getElementById('chat');
  const inputForm = document.getElementById('input-form');
  const inputEl = document.getElementById('input');
  const micBtn = document.getElementById('mic-btn');
  const sendBtn = document.getElementById('send-btn');
  const speakStatus = document.getElementById('speak-status');
  const banner = document.getElementById('banner');

  const DEFAULT_VOICES = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah - Mature, Reassuring, Confident' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura - Enthusiast, Quirky Attitude' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie - Deep, Confident, Energetic' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George - Warm, Captivating Storyteller' },
    { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River - Relaxed, Neutral, Informative' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam - Energetic, Social Media Creator' },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice - Clear, Engaging Educator' },
    { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris - Charming, Down-to-Earth' },
    { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily - Velvety Actress' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel - Steady Broadcaster' }
  ];

  const voiceSelectDropdown = document.getElementById('voice-select-dropdown');
  const activeVoiceName = document.getElementById('active-voice-name');
  const activeVoiceBadge = document.getElementById('active-voice-badge');
  const chatVoiceLabel = document.getElementById('chat-voice-label');
  const voicesCardsContainer = document.getElementById('voices-cards-container');

  const getStartedBtn = document.getElementById('get-started-btn');
  const openWelcomeBtn = document.getElementById('open-welcome-btn');
  const chatBackBtn = document.getElementById('chat-back-btn');
  const chatNewBtn = document.getElementById('chat-new-btn');
  const chatClearBtn = document.getElementById('chat-clear-btn');
  const chatVoiceToggleBtn = document.getElementById('chat-voice-toggle-btn');

  // Quick Action Cards
  const cardTalkBot = document.getElementById('card-talk-bot');
  const cardChatBot = document.getElementById('card-chat-bot');
  const cardPromptBot = document.getElementById('card-prompt-bot');
  const historySeeAllBtn = document.getElementById('history-see-all-btn');

  // Voice Talk Overlay
  const voiceTalkOverlay = document.getElementById('voice-talk-overlay');
  const closeVoiceOverlayBtn = document.getElementById('close-voice-overlay-btn');
  const btnVoiceOverlayStop = document.getElementById('btn-voice-overlay-stop');
  const voiceOverlayStatus = document.getElementById('voice-overlay-status');
  const voiceOverlayTranscript = document.getElementById('voice-overlay-transcript');

  // Notch / Status
  const notchCurrentTime = document.getElementById('notch-current-time');
  const islandEq = document.getElementById('island-eq');

  // Settings elements
  const settingUserName = document.getElementById('setting-user-name');
  const settingSpeakToggle = document.getElementById('setting-speak-toggle');
  const settingCustomKey = document.getElementById('setting-custom-key');
  const openaiStatusIndicator = document.getElementById('openai-status-indicator');
  const elevenlabsStatusIndicator = document.getElementById('elevenlabs-status-indicator');

  const dynamicUserNames = document.querySelectorAll('.dynamic-user-name');
  const userGreetingName = document.querySelector('.user-greeting-name');
  const homeHistoryList = document.getElementById('home-history-list');
  const sidebarHistoryList = document.getElementById('sidebar-history-list');

  // Navigation Items
  const navTabs = document.querySelectorAll('.tab-btn');
  const sideNavItems = document.querySelectorAll('.nav-item');
  const backToHomeBtns = document.querySelectorAll('.back-to-home-btn');

  // --- App State ---
  let state = {
    currentTab: 'home',
    userName: localStorage.getItem('ai_buddy_user_name') || 'Sakib',
    speakReplies: localStorage.getItem('ai_buddy_speak') !== 'false',
    selectedVoiceId: localStorage.getItem('ai_buddy_voice_id') || 'EXAVITQu4vr4xnSDxMaL',
    selectedVoiceName: localStorage.getItem('ai_buddy_voice_name') || 'Sarah',
    customApiKey: localStorage.getItem('ai_buddy_custom_key') || '',
    activeSessionId: null,
    messages: [],
    busy: false,
    currentAudio: null,
    voices: [...DEFAULT_VOICES]
  };

  // Seed default history items matching user's design image
  const DEFAULT_HISTORY = [
    {
      id: 'session-chatgpt',
      title: 'ChatGPT',
      type: 'chatgpt',
      time: '22:10',
      preview: 'Best 2023 mobile app suggestion and architecture...',
      messages: [
        { role: 'user', content: 'What are the best mobile app design trends for modern AI apps?' },
        { role: 'assistant', content: 'Modern AI apps emphasize sleek dark aesthetics, glowing violet and cyan neon accents, tactile micro-animations, and fluid voice interactions!' }
      ]
    },
    {
      id: 'session-midjourney',
      title: 'Midjourney',
      type: 'midjourney',
      time: '11:23',
      preview: 'Looking for dark UI design ideas with neon violet.',
      messages: [
        { role: 'user', content: 'Looking for dark UI design ideas.' },
        { role: 'assistant', content: 'Try pairing deep obsidian space backgrounds with vibrant purple gradient cards, glassmorphic borders, and high-tech typography.' }
      ]
    },
    {
      id: 'session-googleai',
      title: 'Google AI',
      type: 'google',
      time: '06:15',
      preview: 'Show AI-inspired color palettes and gradients.',
      messages: [
        { role: 'user', content: 'Show AI-inspired color palettes.' },
        { role: 'assistant', content: 'Electric violet #8b5cf6, cyber cyan #38bdf8, and dark nebula #090714 create an ultra-modern aesthetic.' }
      ]
    }
  ];

  // Initialize stored history or set defaults
  let chatHistory = [];
  try {
    const raw = localStorage.getItem('ai_buddy_history');
    chatHistory = raw ? JSON.parse(raw) : DEFAULT_HISTORY;
  } catch (e) {
    chatHistory = DEFAULT_HISTORY;
  }

  function saveHistory() {
    try {
      localStorage.setItem('ai_buddy_history', JSON.stringify(chatHistory));
    } catch (e) { }
  }

  // --- Clock updater for mobile notch ---
  function updateNotchClock() {
    if (!notchCurrentTime) return;
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const str = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes}`;
    notchCurrentTime.textContent = str;
  }
  updateNotchClock();
  setInterval(updateNotchClock, 30000);

  // --- User Name Synchronization ---
  function updateUserName(name) {
    state.userName = name || 'Sakib';
    localStorage.setItem('ai_buddy_user_name', state.userName);
    dynamicUserNames.forEach(el => el.textContent = state.userName);
    if (userGreetingName) userGreetingName.textContent = state.userName;
    if (settingUserName) settingUserName.value = state.userName;
  }
  updateUserName(state.userName);

  if (settingUserName) {
    settingUserName.addEventListener('input', (e) => {
      updateUserName(e.target.value.trim());
    });
  }

  // --- Banner Helper ---
  function showBanner(text, isError = false) {
    if (!banner) return;
    banner.textContent = text;
    banner.classList.remove('hidden');
    banner.style.color = isError ? '#f87171' : '#fbbf24';
    banner.style.borderColor = isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.35)';
  }

  // --- Navigation & View Switching ---
  function switchTab(tabId) {
    state.currentTab = tabId;

    // Hide welcome overlay if switching tabs
    if (welcomeScreen) welcomeScreen.classList.remove('active');

    // Switch view sections
    const screens = {
      home: homeScreen,
      chat: chatScreen,
      voices: voicesScreen,
      settings: settingsScreen
    };

    Object.keys(screens).forEach(key => {
      if (screens[key]) {
        if (key === tabId) {
          screens[key].classList.add('active');
        } else {
          screens[key].classList.remove('active');
        }
      }
    });

    // Update bottom nav active classes
    navTabs.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update desktop sidebar nav active classes
    sideNavItems.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (tabId === 'chat') {
      setTimeout(() => inputEl && inputEl.focus(), 150);
      scrollChatToBottom();
    }
  }

  // Attach nav events
  navTabs.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  sideNavItems.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  backToHomeBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab('home'));
  });

  const topbarBrandHome = document.getElementById('topbar-brand-home');
  const sidebarBrandHome = document.getElementById('sidebar-brand-home');
  const mobileBrandHome = document.getElementById('mobile-brand-home');
  [topbarBrandHome, sidebarBrandHome, mobileBrandHome].forEach(el => {
    if (el) {
      el.addEventListener('click', () => {
        if (welcomeScreen) welcomeScreen.classList.remove('active');
        switchTab('home');
      });
    }
  });

  if (chatBackBtn) {
    chatBackBtn.addEventListener('click', () => switchTab('home'));
  }

  // --- Welcome Screen Controls ---
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      welcomeScreen.classList.remove('active');
      switchTab('home');
    });
  }

  if (openWelcomeBtn) {
    openWelcomeBtn.addEventListener('click', () => {
      window.location.href = 'Welcomepage.html';
    });
  }

  // --- Logout Handlers (Redirect back to Welcome Page) ---
  function handleLogout() {
    stopSpeaking();
    sessionStorage.removeItem('ai_buddy_logged_in');
    window.location.href = 'Welcomepage.html';
  }

  const topbarLogoutBtn = document.getElementById('topbar-logout-btn');
  const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
  const settingsLogoutBtn = document.getElementById('settings-logout-btn');

  [topbarLogoutBtn, sidebarLogoutBtn, settingsLogoutBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', handleLogout);
  });

  // --- Render History Lists ---
  function renderHistory() {
    if (!homeHistoryList) return;
    homeHistoryList.innerHTML = '';
    if (sidebarHistoryList) sidebarHistoryList.innerHTML = '';

    chatHistory.slice(0, 5).forEach(item => {
      // Home screen card
      const card = document.createElement('div');
      card.className = 'hist-item-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      let iconHtml = '🤖';
      let iconClass = 'chatgpt';
      if (item.type === 'midjourney') {
        iconHtml = '⛵';
        iconClass = 'midjourney';
      } else if (item.type === 'google') {
        iconHtml = '✨';
        iconClass = 'google';
      }

      card.innerHTML = `
        <div class="hist-brand-icon ${iconClass}">${iconHtml}</div>
        <div class="hist-details">
          <div class="hist-title-row">
            <span class="hist-title">${item.title}</span>
            <span class="hist-time">${item.time}</span>
          </div>
          <div class="hist-preview">${item.preview}</div>
        </div>
        <button type="button" class="hist-del-icon-btn" title="Delete conversation" aria-label="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      `;

      card.addEventListener('click', () => loadSession(item));
      const delBtn = card.querySelector('.hist-del-icon-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteSessionById(item.id);
        });
      }
      homeHistoryList.appendChild(card);

      // Desktop sidebar item
      if (sidebarHistoryList) {
        const sideWrap = document.createElement('div');
        sideWrap.className = 'side-hist-wrap';
        if (state.activeSessionId === item.id) sideWrap.classList.add('active');

        const sideItem = document.createElement('button');
        sideItem.type = 'button';
        sideItem.className = 'side-hist-item';
        sideItem.innerHTML = `<span>${iconHtml}</span> <span style="overflow:hidden;text-overflow:ellipsis;">${item.title}</span>`;
        sideItem.addEventListener('click', () => loadSession(item));

        const sideDel = document.createElement('button');
        sideDel.type = 'button';
        sideDel.className = 'side-del-btn';
        sideDel.title = 'Delete conversation';
        sideDel.innerHTML = `✕`;
        sideDel.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteSessionById(item.id);
        });

        sideWrap.appendChild(sideItem);
        sideWrap.appendChild(sideDel);
        sidebarHistoryList.appendChild(sideWrap);
      }
    });
  }

  function deleteSessionById(sessionId) {
    stopSpeaking();
    chatHistory = chatHistory.filter(s => s.id !== sessionId);
    saveHistory();
    renderHistory();
    if (state.activeSessionId === sessionId) {
      deleteCurrentConversation();
    }
  }

  function deleteCurrentConversation() {
    stopSpeaking();
    if (state.activeSessionId) {
      chatHistory = chatHistory.filter(s => s.id !== state.activeSessionId);
      saveHistory();
      renderHistory();
    }
    // Reset conversation and navigate back to the main dashboard
    startNewChat(false);
    switchTab('home');
    showBanner('Conversation deleted. Returned to Dashboard.');
    setTimeout(() => {
      if (banner) banner.classList.add('hidden');
    }, 2000);
  }

  function loadSession(session) {
    state.activeSessionId = session.id;
    state.messages = [...(session.messages || [])];
    renderChatMessages();
    switchTab('chat');
  }

  // Start new chat side button (+ symbol in sidebar)
  const newChatSideBtn = document.getElementById('new-chat-side-btn');
  if (newChatSideBtn) {
    newChatSideBtn.addEventListener('click', () => {
      startNewChat(true); // Sounds the greeting once!
      switchTab('chat');
    });
  }

  // Start new chat button inside Ai Chat header (+ symbol)
  if (chatNewBtn) {
    chatNewBtn.addEventListener('click', () => {
      startNewChat(true); // Sounds the greeting once!
      if (inputEl) inputEl.focus();
    });
  }

  function startNewChat(shouldSpeak = false) {
    stopSpeaking();
    state.activeSessionId = 'session-' + Date.now();
    const greetingText = `Hi ${state.userName}! I am your AI Buddy. Ask me anything, or speak aloud with voice!`;
    state.messages = [
      {
        role: 'assistant',
        content: greetingText
      }
    ];
    renderChatMessages();

    // Speaks the greeting out loud once when requested (after deleting conversation or clicking new chat)
    if (shouldSpeak) {
      setTimeout(() => {
        speak(greetingText);
      }, 150);
    }
  }

  // --- Render Chat Messages Stream ---
  function renderChatMessages() {
    if (!chatEl) return;
    chatEl.innerHTML = '';
    state.messages.forEach(msg => appendMessageElement(msg.role, msg.content));
    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    if (!chatEl) return;
    setTimeout(() => {
      chatEl.scrollTop = chatEl.scrollHeight;
    }, 50);
  }

  function appendMessageElement(role, text) {
    const row = document.createElement('div');
    row.className = `chat-msg-row ${role}`;

    const isUser = role === 'user';
    const authorName = isUser ? 'You' : 'Personal AI Buddy';
    const authorIconHtml = isUser
      ? `<img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="You" class="author-mini-avatar"/>`
      : `<div class="author-bot-icon">✦</div>`;

    row.innerHTML = `
      <div class="msg-author-header">
        ${authorIconHtml}
        <span>${authorName}</span>
      </div>
      <div class="msg-bubble-box">${formatMessageText(text)}</div>
      ${!isUser ? `
        <div class="msg-meta-footer">
          <button type="button" class="replay-audio-btn" title="Replay voice audio">
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Speak
          </button>
        </div>
      ` : ''}
    `;

    if (!isUser) {
      const replayBtn = row.querySelector('.replay-audio-btn');
      if (replayBtn) {
        replayBtn.addEventListener('click', () => speak(text));
      }
    }

    chatEl.appendChild(row);
    scrollChatToBottom();
    return row;
  }

  function stripMarkdownForSpeech(raw) {
    if (!raw) return '';
    return raw
      .replace(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g, ' Here is the code example. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_`~]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/^[•\-\*]\s+/gm, '')
      .replace(/^\d+[\.\)]\s+/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function formatMessageText(rawText) {
    if (!rawText) return '';
    let text = escapeHtml(rawText);

    // 1. Extract and preserve code blocks
    const codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = (lang || 'code').trim();
      const cleanCode = code.replace(/\n+$/, '');
      const blockHtml = `
        <div class="bubble-code-container">
          <div class="code-container-header">
            <span class="code-lang-tag">${language}</span>
            <button type="button" class="copy-code-inline-btn" title="Copy code" onclick="navigator.clipboard.writeText(this.closest('.bubble-code-container').querySelector('code').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500);">Copy</button>
          </div>
          <pre class="bubble-code-pre"><code>${cleanCode}</code></pre>
        </div>`;
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(blockHtml);
      return placeholder;
    });

    // 2. Format inline code `code`
    text = text.replace(/`([^`\n]+)`/g, '<code class="bubble-inline-code">$1</code>');

    // 3. Convert bold and italic markdown
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 4. Line by line parsing for steps, bullets, headers, and paragraphs
    const lines = text.split('\n');
    let formattedHtml = '';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        formattedHtml += '<div class="bubble-spacer"></div>';
        return;
      }

      // Check for code block placeholder
      const codeMatch = trimmed.match(/^__CODE_BLOCK_(\d+)__$/);
      if (codeMatch) {
        const index = parseInt(codeMatch[1], 10);
        formattedHtml += codeBlocks[index] || '';
        return;
      }

      // Check for numbered steps (e.g. "1. Step" or "1) Step")
      const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
      if (numMatch) {
        formattedHtml += `
          <div class="bubble-step-row">
            <span class="bubble-step-badge">${numMatch[1]}</span>
            <span class="bubble-step-text">${numMatch[2]}</span>
          </div>`;
        return;
      }

      // Check for bullet items (e.g. "• Item", "- Item", "* Item")
      const bulletMatch = trimmed.match(/^[•\-\*]\s+(.*)$/);
      if (bulletMatch) {
        formattedHtml += `
          <div class="bubble-bullet-row">
            <span class="bubble-bullet-icon">✦</span>
            <span class="bubble-bullet-text">${bulletMatch[1]}</span>
          </div>`;
        return;
      }

      // Check for section headers (e.g., emojis or lines ending with colon)
      const isHeader = /^([🍲🔥🛒🎂🍹👨‍🍳👉📌💡📚💻🧠⚡🚀🎯🛠️📖📝🔍]|##|###)/.test(trimmed) || (trimmed.endsWith(':') && trimmed.length < 55);
      if (isHeader) {
        const cleanHeader = trimmed.replace(/^#+\s*/, '');
        formattedHtml += `<div class="bubble-section-title">${cleanHeader}</div>`;
        return;
      }

      // Standard paragraph
      formattedHtml += `<p class="bubble-paragraph">${trimmed}</p>`;
    });

    return formattedHtml;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function addTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'chat-msg-row assistant typing-row';
    row.innerHTML = `
      <div class="msg-author-header">
        <div class="author-bot-icon">✦</div>
        <span>Personal AI Buddy is thinking...</span>
      </div>
      <div class="msg-bubble-box typing-bubble">
        <span></span><span></span><span></span>
      </div>
    `;
    chatEl.appendChild(row);
    scrollChatToBottom();
    return row;
  }

  // --- Voice Synthesis (ElevenLabs with Web Speech Fallback) ---
  async function speak(text) {
    const cleanSpeechText = stripMarkdownForSpeech(text);
    if (!cleanSpeechText) return;
    stopSpeaking();

    // Show equalizer UI
    if (speakStatus) speakStatus.classList.remove('hidden');
    if (islandEq) islandEq.classList.remove('hidden');

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanSpeechText,
          voiceId: state.selectedVoiceId
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'ElevenLabs synthesis failed.');
      }

      const blob = await res.blob();
      state.currentAudio = new Audio(URL.createObjectURL(blob));
      state.currentAudio.onended = stopSpeaking;
      state.currentAudio.onerror = () => {
        fallbackBrowserSpeak(cleanSpeechText);
      };
      await state.currentAudio.play();
    } catch (err) {
      console.warn('ElevenLabs API unavailable, using browser speech synthesis fallback:', err.message);
      fallbackBrowserSpeak(cleanSpeechText);
    }
  }

  function fallbackBrowserSpeak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.onend = stopSpeaking;
      utterance.onerror = stopSpeaking;
      window.speechSynthesis.speak(utterance);
    } else {
      stopSpeaking();
    }
  }

  function stopSpeaking() {
    if (state.currentAudio) {
      state.currentAudio.pause();
      state.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (speakStatus) speakStatus.classList.add('hidden');
    if (islandEq) islandEq.classList.add('hidden');
  }

  if (speakStatus) {
    speakStatus.addEventListener('click', stopSpeaking);
  }

  // --- Delete Conversation / Clear Chat ---
  if (chatClearBtn) {
    chatClearBtn.addEventListener('click', () => {
      deleteCurrentConversation();
    });
  }

  // --- Audio Read Aloud Toggle ---
  if (chatVoiceToggleBtn) {
    chatVoiceToggleBtn.addEventListener('click', () => {
      state.speakReplies = !state.speakReplies;
      localStorage.setItem('ai_buddy_speak', state.speakReplies);
      if (settingSpeakToggle) settingSpeakToggle.checked = state.speakReplies;
      updateSpeakerIcon();
    });
  }

  if (settingSpeakToggle) {
    settingSpeakToggle.checked = state.speakReplies;
    settingSpeakToggle.addEventListener('change', (e) => {
      state.speakReplies = e.target.checked;
      localStorage.setItem('ai_buddy_speak', state.speakReplies);
      updateSpeakerIcon();
    });
  }

  function updateSpeakerIcon() {
    const speakerSvg = document.getElementById('speaker-icon');
    if (speakerSvg) {
      speakerSvg.style.opacity = state.speakReplies ? '1' : '0.4';
      speakerSvg.style.fill = state.speakReplies ? '#c084fc' : '#64748b';
    }
  }
  updateSpeakerIcon();

  // --- Custom API Key input ---
  if (settingCustomKey) {
    settingCustomKey.value = state.customApiKey;
    settingCustomKey.addEventListener('change', (e) => {
      state.customApiKey = e.target.value.trim();
      localStorage.setItem('ai_buddy_custom_key', state.customApiKey);
      showBanner('Custom OpenAI API Key saved for this session!');
    });
  }

  // --- Send Message Flow ---
  async function handleSendMessage(text) {
    text = (text || '').trim();
    if (!text || state.busy) return;

    stopSpeaking();
    state.busy = true;
    if (sendBtn) sendBtn.disabled = true;
    if (inputEl) inputEl.value = '';

    // Append to messages & DOM
    const userMsg = { role: 'user', content: text, time: getCurrentTimeStr() };
    state.messages.push(userMsg);
    appendMessageElement('user', text);

    const typingEl = addTypingIndicator();

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (state.customApiKey) {
        headers['x-openai-key'] = state.customApiKey;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: state.messages })
      });

      const data = await res.json().catch(() => ({}));
      typingEl.remove();

      if (!res.ok && !data.reply) {
        throw new Error(data.error || 'Server error.');
      }

      const reply = data.reply || "I'm here to help!";
      const assistantMsg = { role: 'assistant', content: reply, time: getCurrentTimeStr() };
      state.messages.push(assistantMsg);
      appendMessageElement('assistant', reply);

      // Save to chat history
      updateSessionInHistory(text, reply);

      // Speak aloud if enabled
      if (state.speakReplies) {
        speak(reply);
      }
    } catch (err) {
      typingEl.remove();
      appendMessageElement('error', `Assistant notice: ${err.message}`);
    } finally {
      state.busy = false;
      if (sendBtn) sendBtn.disabled = false;
      if (inputEl) inputEl.focus();
    }
  }

  function getCurrentTimeStr() {
    const d = new Date();
    return `${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}`;
  }

  function updateSessionInHistory(userQuery, assistantReply) {
    let session = chatHistory.find(s => s.id === state.activeSessionId);
    if (!session) {
      session = {
        id: state.activeSessionId || ('session-' + Date.now()),
        title: userQuery.slice(0, 24) + (userQuery.length > 24 ? '...' : ''),
        type: 'chatgpt',
        time: getCurrentTimeStr(),
        preview: assistantReply.slice(0, 50) + '...',
        messages: state.messages
      };
      chatHistory.unshift(session);
    } else {
      session.time = getCurrentTimeStr();
      session.preview = assistantReply.slice(0, 50) + '...';
      session.messages = state.messages;
    }
    saveHistory();
    renderHistory();
  }

  if (inputForm) {
    inputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSendMessage(inputEl.value);
    });
  }

  if (inputEl) {
    inputEl.addEventListener('focus', () => {
      document.body.classList.add('keyboard-open');
      setTimeout(scrollChatToBottom, 150);
    });
    inputEl.addEventListener('blur', () => {
      document.body.classList.remove('keyboard-open');
    });
  }

  // --- Voice Input Speech Recognition ---
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;
  let manualStop = false;
  let transcribedText = '';

  if (SR) {
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      manualStop = false;
      transcribedText = '';
      if (micBtn) {
        micBtn.classList.add('listening');
        micBtn.title = 'Listening... tap to send';
      }
      if (islandEq) islandEq.classList.remove('hidden');
      if (voiceOverlayStatus) voiceOverlayStatus.textContent = 'Listening...';
    };

    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) transcribedText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      const full = (transcribedText + interim).trimStart();
      if (inputEl) inputEl.value = full;
      if (voiceOverlayTranscript) voiceOverlayTranscript.textContent = full || 'Listening to your voice...';
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      if (voiceOverlayStatus) voiceOverlayStatus.textContent = 'Microphone paused';
    };

    recognition.onend = () => {
      isListening = false;
      if (micBtn) {
        micBtn.classList.remove('listening');
        micBtn.title = 'Speak message';
      }
      if (islandEq) islandEq.classList.add('hidden');

      if (!manualStop) {
        const textToSend = (transcribedText || (inputEl && inputEl.value) || '').trim();
        if (textToSend) {
          if (voiceTalkOverlay) voiceTalkOverlay.classList.add('hidden');
          handleSendMessage(textToSend);
        }
      }
    };

    function startListening() {
      stopSpeaking();
      try {
        recognition.start();
      } catch (err) { }
    }

    function stopListening() {
      manualStop = true;
      if (recognition && isListening) {
        recognition.stop();
      }
    }

    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      });
    }

    // "Talk with Bot" Action Card
    if (cardTalkBot) {
      cardTalkBot.addEventListener('click', () => {
        switchTab('chat');
        if (voiceTalkOverlay) voiceTalkOverlay.classList.remove('hidden');
        if (voiceOverlayStatus) voiceOverlayStatus.textContent = 'Listening...';
        if (voiceOverlayTranscript) voiceOverlayTranscript.textContent = 'Say anything to your Personal AI Buddy!';
        startListening();
      });
    }

    if (closeVoiceOverlayBtn) {
      closeVoiceOverlayBtn.addEventListener('click', () => {
        stopListening();
        if (voiceTalkOverlay) voiceTalkOverlay.classList.add('hidden');
      });
    }

    if (btnVoiceOverlayStop) {
      btnVoiceOverlayStop.addEventListener('click', () => {
        stopListening();
        if (voiceTalkOverlay) voiceTalkOverlay.classList.add('hidden');
      });
    }

  } else {
    if (micBtn) {
      micBtn.title = 'Speech Recognition requires Chrome, Edge, or Safari.';
    }
    if (cardTalkBot) {
      cardTalkBot.addEventListener('click', () => {
        switchTab('chat');
      });
    }
  }

  // "Chat with Bot" Action Card
  if (cardChatBot) {
    cardChatBot.addEventListener('click', () => {
      startNewChat(true); // Starts a fresh chat & sounds greeting aloud
      switchTab('chat');
      if (inputEl) inputEl.focus();
    });
  }

  // "Search by Image / Prompt Ideas" Action Card
  if (cardPromptBot) {
    cardPromptBot.addEventListener('click', () => {
      const samplePrompts = [
        "Explain photosynthesis in Biology step-by-step.",
        "How do I solve quadratic equations in Math?",
        "Explain chemical bonding in Chemistry with examples.",
        "How do arrays and arrow functions work in JavaScript?",
        "What caused World War I in History?",
        "How can I improve my study habits using Active Recall?"
      ];
      const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
      startNewChat(true); // Starts a fresh chat & sounds greeting aloud
      switchTab('chat');
      if (inputEl) {
        inputEl.value = randomPrompt;
        inputEl.focus();
      }
    });
  }

  if (historySeeAllBtn) {
    historySeeAllBtn.addEventListener('click', () => {
      switchTab('chat');
    });
  }

  // --- Voice Studio: Fetch & Populate ElevenLabs Voices ---
  function updateVoiceUI() {
    const currentName = state.selectedVoiceName || 'Sarah';
    if (activeVoiceName) {
      activeVoiceName.textContent = `Voice: ${currentName}`;
    }
    if (chatVoiceLabel) {
      chatVoiceLabel.textContent = currentName;
    }
    if (voiceSelectDropdown && state.selectedVoiceId) {
      voiceSelectDropdown.value = state.selectedVoiceId;
    }
    if (activeVoiceBadge) {
      activeVoiceBadge.setAttribute('title', `Active Voice: ${currentName}. Click to toggle voice.`);
    }
  }

  async function loadVoices() {
    try {
      const res = await fetch('/api/voices');
      if (!res.ok) throw new Error('Voices endpoint returned ' + res.status);
      const data = await res.json();
      if (Array.isArray(data.voices) && data.voices.length > 0) {
        state.voices = data.voices;
      }

      if (elevenlabsStatusIndicator) {
        elevenlabsStatusIndicator.textContent = `Ready (${state.voices.length} Voices Active)`;
        elevenlabsStatusIndicator.className = 'status-state state-active';
      }

      populateVoiceDropdown();
      renderVoicesStudio();
      updateVoiceUI();
    } catch (err) {
      console.warn('Could not load ElevenLabs voices:', err);
      if (elevenlabsStatusIndicator) {
        elevenlabsStatusIndicator.textContent = 'Voice API (Key verification pending)';
        elevenlabsStatusIndicator.className = 'status-state state-fallback';
      }
    }
  }

  function populateVoiceDropdown() {
    if (!voiceSelectDropdown) return;
    voiceSelectDropdown.innerHTML = '';

    state.voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.name;
      if (v.id === state.selectedVoiceId) opt.selected = true;
      voiceSelectDropdown.appendChild(opt);
    });

    if (state.selectedVoiceId) {
      voiceSelectDropdown.value = state.selectedVoiceId;
    }
  }

  if (voiceSelectDropdown) {
    voiceSelectDropdown.addEventListener('change', (e) => {
      selectVoice(e.target.value, true);
    });
  }

  function selectVoice(voiceId, shouldSpeak = false) {
    if (!state.voices || state.voices.length === 0) {
      state.voices = [...DEFAULT_VOICES];
    }
    const found = state.voices.find(v => v.id === voiceId);
    state.selectedVoiceId = voiceId;
    const rawName = found ? found.name : 'Sarah';
    state.selectedVoiceName = rawName.split(' - ')[0].trim();
    localStorage.setItem('ai_buddy_voice_id', state.selectedVoiceId);
    localStorage.setItem('ai_buddy_voice_name', state.selectedVoiceName);

    updateVoiceUI();
    renderVoicesStudio();

    if (shouldSpeak) {
      stopSpeaking();
      speak(`Hi ${state.userName}! My voice is now ${state.selectedVoiceName}.`);
    }
  }

  function cycleNextVoice() {
    if (!state.voices || state.voices.length === 0) {
      state.voices = [...DEFAULT_VOICES];
    }
    const currentIndex = state.voices.findIndex(v => v.id === state.selectedVoiceId);
    const nextIndex = (currentIndex + 1) % state.voices.length;
    const nextVoice = state.voices[nextIndex];
    if (nextVoice) {
      selectVoice(nextVoice.id, true);
      showBanner(`Voice switched to ${state.selectedVoiceName}`);
      setTimeout(() => {
        if (banner) banner.classList.add('hidden');
      }, 2500);
    }
  }

  // Interactive Voice Toggle Badges
  if (activeVoiceBadge) {
    activeVoiceBadge.addEventListener('click', () => {
      cycleNextVoice();
    });
    activeVoiceBadge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cycleNextVoice();
      }
    });
  }

  if (chatVoiceLabel) {
    chatVoiceLabel.addEventListener('click', () => {
      cycleNextVoice();
    });
    chatVoiceLabel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cycleNextVoice();
      }
    });
  }

  function renderVoicesStudio() {
    if (!voicesCardsContainer) return;
    voicesCardsContainer.innerHTML = '';

    state.voices.forEach(v => {
      const parts = v.name.split(' - ');
      const name = parts[0] || v.name;
      const desc = parts[1] || 'Natural AI Voice';
      const isSelected = v.id === state.selectedVoiceId;

      const card = document.createElement('div');
      card.className = `voice-card-item ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="voice-card-left">
          <div class="voice-badge-icon">🎙️</div>
          <div>
            <div class="voice-item-name">${name}</div>
            <div class="voice-item-tags">${desc}</div>
          </div>
        </div>
        <button type="button" class="voice-test-btn" data-voice-id="${v.id}">
          ${isSelected ? '✓ Selected' : 'Use Voice'}
        </button>
      `;

      card.addEventListener('click', () => {
        selectVoice(v.id, true);
      });

      voicesCardsContainer.appendChild(card);
    });
  }

  // --- Check Backend Configuration Status ---
  fetch('/api/config')
    .then(r => r.json())
    .then(cfg => {
      if (openaiStatusIndicator) {
        if (cfg.openaiConfigured) {
          openaiStatusIndicator.textContent = 'Configured (Smart Engine)';
          openaiStatusIndicator.className = 'status-state state-active';
        } else {
          openaiStatusIndicator.textContent = 'Smart Offline Buddy Mode';
          openaiStatusIndicator.className = 'status-state state-fallback';
        }
      }
    })
    .catch(() => { });

  // --- Initial Setup ---
  updateVoiceUI();
  populateVoiceDropdown();
  renderVoicesStudio();
  loadVoices();
  renderHistory();

  // Load first session or starter greeting
  if (chatHistory.length > 0) {
    loadSession(chatHistory[0]);
  } else {
    startNewChat();
  }

  switchTab('home');
})();
