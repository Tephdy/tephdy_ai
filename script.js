/* =========================================================
   1. BACKGROUND CANVAS ANIMATION (MOBILE OPTIMIZED)
   ========================================================= */
const bgCanvas = document.getElementById('bg-canvas');
const ctx = bgCanvas ? bgCanvas.getContext('2d') : null;

let particles = [];
let particleColor = 'rgba(212, 175, 55, ';

function resizeBgCanvas() {
  if (!bgCanvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  bgCanvas.width = window.innerWidth * dpr;
  bgCanvas.height = window.innerHeight * dpr;
  // Reset and set scale to prevent exponential scaling accumulation on resize
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

if (bgCanvas) {
  window.addEventListener('resize', () => {
    resizeBgCanvas();
    initParticles();
  });
  resizeBgCanvas();
}

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.radius = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.4 + 0.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
    if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
  }

  draw() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = particleColor + this.alpha + ')';
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const isMobile = window.innerWidth < 768;
  const divisor = isMobile ? 22000 : 12000;
  const particleCount = Math.floor((window.innerWidth * window.innerHeight) / divisor);
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function animateBg() {
  if (!ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const maxDistance = window.innerWidth < 768 ? 85 : 110;

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = particleColor + (1 - dist / maxDistance) * 0.12 + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateBg);
}

if (bgCanvas) {
  initParticles();
  animateBg();
}

/* =========================================================
   2. MARKDOWN & SYNTAX HIGHLIGHTING CONFIGURATION
   ========================================================= */
if (typeof marked !== 'undefined') {
  const renderer = new marked.Renderer();
  renderer.code = function(code, language) {
    const validLang = language && typeof hljs !== 'undefined' && hljs.getLanguage(language) ? language : 'plaintext';
    const highlighted = typeof hljs !== 'undefined' ? hljs.highlight(code, { language: validLang }).value : code;
    return `<pre><code class="hljs ${validLang}">${highlighted}</code></pre>`;
  };

  marked.use({ renderer, breaks: true });
}

/* =========================================================
   3. 3D GOLD ICON
   ========================================================= */
const avatarContainer = document.getElementById('avatar-canvas');
let avatarScene, avatarCamera, avatarRenderer, goldMaterial, headMesh;

if (avatarContainer && typeof THREE !== 'undefined') {
  avatarScene = new THREE.Scene();
  avatarCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  avatarRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  avatarRenderer.setSize(34, 34);
  avatarRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  avatarContainer.appendChild(avatarRenderer.domElement);

  goldMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true });
  headMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), goldMaterial);
  avatarScene.add(headMesh);
  avatarCamera.position.z = 3.5;
}

let isThinking = false;
function animateAvatar() {
  requestAnimationFrame(animateAvatar);
  if (headMesh && avatarRenderer && avatarScene && avatarCamera) {
    headMesh.rotation.y += isThinking ? 0.08 : 0.01;
    headMesh.rotation.x += isThinking ? 0.03 : 0.005;
    avatarRenderer.render(avatarScene, avatarCamera);
  }
}
if (avatarContainer) animateAvatar();

/* =========================================================
   4. THEME SWITCHER LOGIC
   ========================================================= */
const themeSelect = document.getElementById('theme-select');
const theme3DColors = {
  gold: 0xffd700,
  obsidian: 0xffffff,
  slate: 0x94a3b8,
  silver: 0xe2e8f0,
  cyberpunk: 0x00f3ff,
  emerald: 0x10b981,
  amethyst: 0xc084fc,
  crimson: 0xf43f5e,
  sunset: 0xf97316,
  midnight: 0x3b82f6
};

const particleRgbColors = {
  gold: 'rgba(212, 175, 55, ',
  obsidian: 'rgba(255, 255, 255, ',
  slate: 'rgba(148, 163, 184, ',
  silver: 'rgba(226, 232, 240, ',
  cyberpunk: 'rgba(0, 243, 255, ',
  emerald: 'rgba(16, 185, 129, ',
  amethyst: 'rgba(192, 132, 252, ',
  crimson: 'rgba(244, 63, 94, ',
  sunset: 'rgba(249, 115, 22, ',
  midnight: 'rgba(59, 130, 246, '
};

function applyTheme(themeName) {
  if (themeName === 'gold') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
  localStorage.setItem('tephdy_theme', themeName);
  
  if (goldMaterial && theme3DColors[themeName]) {
    goldMaterial.color.setHex(theme3DColors[themeName]);
  }

  if (particleRgbColors[themeName]) {
    particleColor = particleRgbColors[themeName];
  }
}

if (themeSelect) {
  themeSelect.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });
}

/* =========================================================
   5. MOBILE DRAWER NAVIGATION & TOUCH GESTURES
   ========================================================= */
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function toggleSidebar(open) {
  if (!sidebar || !sidebarOverlay) return;
  if (open) {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

if (menuBtn) menuBtn.addEventListener('click', () => toggleSidebar(true));
if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

/* =========================================================
   6. CONVERSATION HISTORY & LOCAL STORAGE
   ========================================================= */
const API_ENDPOINT = '/api/chat';
const SYSTEM_PROMPT = {
  role: 'system',
  content: 'Your name is Tephdy, an AI agent on the Tephdy AI platform by TEPHDY TECH. Be helpful, precise, concise, and smart.'
};

const chatBox = document.getElementById('chat-box');
const promptInput = document.getElementById('prompt-input');
const sendBtn = document.getElementById('send-btn');
const historyListEl = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

let sessions = JSON.parse(localStorage.getItem('tephdy_chats') || '[]');
let currentSessionId = null;

function saveSessions() {
  localStorage.setItem('tephdy_chats', JSON.stringify(sessions));
}

function createNewSession() {
  currentSessionId = 'session_' + Date.now();
  const newSession = {
    id: currentSessionId,
    title: 'New Conversation',
    messages: [SYSTEM_PROMPT]
  };
  sessions.unshift(newSession);
  saveSessions();
  renderHistoryList();
  loadSessionMessages(currentSessionId, true);
  toggleSidebar(false);
}

function renderHistoryList() {
  if (!historyListEl) return;
  historyListEl.innerHTML = '';
  sessions.forEach(session => {
    const item = document.createElement('div');
    item.classList.add('history-item');
    if (session.id === currentSessionId) item.classList.add('active');

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('item-title');
    titleSpan.textContent = session.title;

    const delBtn = document.createElement('button');
    delBtn.classList.add('delete-btn');
    delBtn.innerHTML = '&#10005;';
    delBtn.setAttribute('aria-label', 'Delete Chat');
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteSession(session.id);
    };

    item.appendChild(titleSpan);
    item.appendChild(delBtn);
    item.onclick = () => switchSession(session.id);

    historyListEl.appendChild(item);
  });
}

function switchSession(id) {
  currentSessionId = id;
  renderHistoryList();
  loadSessionMessages(id, false);
  toggleSidebar(false);
}

function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  saveSessions();
  if (currentSessionId === id) {
    if (sessions.length > 0) {
      switchSession(sessions[0].id);
    } else {
      createNewSession();
    }
  } else {
    renderHistoryList();
  }
}

function loadSessionMessages(id, isNew = false) {
  if (!chatBox) return;
  chatBox.innerHTML = '';
  const session = sessions.find(s => s.id === id);
  if (!session) return;

  const nonSystemMessages = session.messages.filter(m => m.role !== 'system');

  if (nonSystemMessages.length === 0 && isNew) {
    playAnimatedGreeting("Welcome to TEPHDY TECH. I am Tephdy. How can I assist you today?");
  } else {
    nonSystemMessages.forEach(m => appendMessage(m.role, m.content));
  }
}

/* =========================================================
   7. CHAT LOGIC & ENGINE EXECUTION
   ========================================================= */

// HELPER: Auto-extract clean response string from raw JSON or text payloads
function parseAIResponse(data) {
  if (!data) return '';
  if (typeof data === 'object') {
    return data.response || data.message || data.reply || data.choices?.[0]?.message?.content || data.choices?.[0]?.text || JSON.stringify(data);
  }
  
  const trimmed = data.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parseAIResponse(parsed);
    } catch (e) {
      // Return original text if not valid JSON
    }
  }
  return data;
}

if (promptInput) {
  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
  });
}

function playAnimatedGreeting(text) {
  if (!chatBox) return;
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', 'assistant');
  
  const contentSpan = document.createElement('span');
  const cursor = document.createElement('span');
  cursor.classList.add('typing-cursor');
  
  msgDiv.appendChild(contentSpan);
  msgDiv.appendChild(cursor);
  chatBox.appendChild(msgDiv);

  let index = 0;
  const timer = setInterval(() => {
    if (index < text.length) {
      contentSpan.textContent += text.charAt(index);
      index++;
      chatBox.scrollTop = chatBox.scrollHeight;
    } else {
      clearInterval(timer);
      cursor.remove();
    }
  }, 20);
}

function appendMessage(role, text) {
  if (!chatBox) return;
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', role);
  
  const cleanText = parseAIResponse(text);
  
  if (role === 'assistant') {
    msgDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(cleanText) : cleanText;
  } else {
    msgDiv.textContent = cleanText;
  }
  
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgDiv;
}

function showPreparingNotice() {
  if (!chatBox) return;
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', 'assistant');
  msgDiv.innerHTML = `
    <div class="thinking-notice">
      <div class="thinking-spinner"></div>
      <span>Tephdy is thinking...</span>
    </div>
  `;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgDiv;
}

async function sendMessage() {
  if (!promptInput || !sendBtn) return;
  const text = promptInput.value.trim();
  if (!text || sendBtn.disabled) return;

  const session = sessions.find(s => s.id === currentSessionId);
  if (!session) return;

  appendMessage('user', text);
  session.messages.push({ role: 'user', content: text });

  if (session.title === 'New Conversation') {
    session.title = text.slice(0, 28) + (text.length > 28 ? '...' : '');
    renderHistoryList();
  }

  promptInput.value = '';
  promptInput.style.height = '24px';
  sendBtn.disabled = true;
  isThinking = true;

  const thinkingNotice = showPreparingNotice();

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: session.messages })
    });

    if (!response.ok) throw new Error('API server error');

    if (thinkingNotice) thinkingNotice.remove();
    const assistantMsgDiv = appendMessage('assistant', '');

    if (response.body && typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partialText += decoder.decode(value, { stream: true });
        
        const cleanPartial = parseAIResponse(partialText);
        assistantMsgDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(cleanPartial) : cleanPartial;
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      }

      const finalContent = parseAIResponse(partialText);
      session.messages.push({ role: 'assistant', content: finalContent });
    } else {
      const data = await response.json();
      const reply = parseAIResponse(data);
      assistantMsgDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(reply) : reply;
      session.messages.push({ role: 'assistant', content: reply });
    }
  } catch (err) {
    if (thinkingNotice) thinkingNotice.remove();
    const errorText = 'Sorry, an error occurred while connecting to the server. Please try again.';
    appendMessage('assistant', errorText);
    session.messages.push({ role: 'assistant', content: errorText });
  } finally {
    sendBtn.disabled = false;
    isThinking = false;
    saveSessions();
  }
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (newChatBtn) newChatBtn.addEventListener('click', createNewSession);
if (promptInput) {
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

window.addEventListener('load', () => {
  if (themeSelect) {
    const savedTheme = localStorage.getItem('tephdy_theme') || 'gold';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);
  }

  if (sessions.length === 0) {
    createNewSession();
  } else {
    currentSessionId = sessions[0].id;
    renderHistoryList();
    loadSessionMessages(currentSessionId);
  }
});