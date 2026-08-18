 /* =========================================================
       1. BACKGROUND CANVAS ANIMATION (MOBILE OPTIMIZED)
       ========================================================= */
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');

    let particles = [];
    let particleColor = 'rgba(212, 175, 55, ';

    function resizeBgCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      bgCanvas.width = window.innerWidth * dpr;
      bgCanvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', () => {
      resizeBgCanvas();
      initParticles();
    });
    resizeBgCanvas();

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
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor + this.alpha + ')';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      // Lower particle multiplier for mobile GPU efficiency
      const isMobile = window.innerWidth < 768;
      const divisor = isMobile ? 22000 : 12000;
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / divisor);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animateBg() {
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

    initParticles();
    animateBg();

    /* =========================================================
       2. MARKDOWN & SYNTAX HIGHLIGHTING CONFIGURATION
       ========================================================= */
    const renderer = new marked.Renderer();
    renderer.code = function(code, language) {
      const validLang = language && hljs.getLanguage(language) ? language : 'plaintext';
      const highlighted = hljs.highlight(code, { language: validLang }).value;
      return `<pre><code class="hljs ${validLang}">${highlighted}</code></pre>`;
    };

    marked.use({ renderer, breaks: true });

    /* =========================================================
       3. 3D GOLD ICON
       ========================================================= */
    const avatarContainer = document.getElementById('avatar-canvas');
    const avatarScene = new THREE.Scene();
    const avatarCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const avatarRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    avatarRenderer.setSize(34, 34);
    avatarRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    avatarContainer.appendChild(avatarRenderer.domElement);

    const goldMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true });
    const headMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), goldMaterial);
    avatarScene.add(headMesh);
    avatarCamera.position.z = 3.5;

    let isThinking = false;
    function animateAvatar() {
      requestAnimationFrame(animateAvatar);
      headMesh.rotation.y += isThinking ? 0.08 : 0.01;
      headMesh.rotation.x += isThinking ? 0.03 : 0.005;
      avatarRenderer.render(avatarScene, avatarCamera);
    }
    animateAvatar();

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

    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });

    /* =========================================================
       5. MOBILE DRAWER NAVIGATION & TOUCH GESTURES
       ========================================================= */
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleSidebar(open) {
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

    menuBtn.addEventListener('click', () => toggleSidebar(true));
    sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

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
    promptInput.addEventListener('input', () => {
      promptInput.style.height = 'auto';
      promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
    });

    function playAnimatedGreeting(text) {
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
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message', role);
      
      if (role === 'assistant') {
        msgDiv.innerHTML = marked.parse(text);
      } else {
        msgDiv.textContent = text;
      }
      
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
      return msgDiv;
    }

    function showPreparingNotice() {
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
      const prompt = promptInput.value.trim();
      if (!prompt) return;

      promptInput.value = '';
      promptInput.style.height = '24px';
      sendBtn.disabled = true;

      const activeSession = sessions.find(s => s.id === currentSessionId);
      if (!activeSession) return;

      if (activeSession.messages.length <= 1) {
        activeSession.title = prompt.length > 18 ? prompt.slice(0, 18) + '...' : prompt;
        renderHistoryList();
      }

      appendMessage('user', prompt);
      activeSession.messages.push({ role: 'user', content: prompt });
      saveSessions();

      isThinking = true;
      const prepBubble = showPreparingNotice();

      const payloadMessages = activeSession.messages
        .filter(m => m.role !== 'system')
        .slice(-6);

      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payloadMessages })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const replyText = data.response || data.error || "No response received.";

        prepBubble.innerHTML = marked.parse(replyText);
        chatBox.scrollTop = chatBox.scrollHeight;

        activeSession.messages.push({ role: 'assistant', content: replyText });
        saveSessions();
      } catch (e) {
        prepBubble.textContent = "Tephdy engine offline or disconnected.";
      } finally {
        sendBtn.disabled = false;
        isThinking = false;
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    newChatBtn.addEventListener('click', createNewSession);
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    window.addEventListener('load', () => {
      const savedTheme = localStorage.getItem('tephdy_theme') || 'gold';
      themeSelect.value = savedTheme;
      applyTheme(savedTheme);

      if (sessions.length === 0) {
        createNewSession();
      } else {
        currentSessionId = sessions[0].id;
        renderHistoryList();
        loadSessionMessages(currentSessionId);
      }
    });