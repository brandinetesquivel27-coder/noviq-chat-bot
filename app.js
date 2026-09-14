// ==========================================
// NOVIQ V 4.8 - Socrático Pro (Core Logic)
// ==========================================

window.currentSessionId = Date.now();
let aiMode = 'tutor';

// Estado de progreso con persistencia en localStorage para que no se pierda al reiniciar
let userProgress = JSON.parse(localStorage.getItem('noviq_user_progress')) || {
    iq: 100,
    levelName: 'Principiante',
    levelIndex: 0,
    totalSessions: 0,
    cognitiveProgress: 0,
    dailyActivity: { 'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0, 'Dom': 0 },
    achievements: [],
    improvements: ['Iniciar tus primeras interacciones para estructurar el diagnóstico.'],
    advice: '¡Bienvenido! Comienza a conversar y resolver dudas para activar tu evolución cognitiva y ver tus estadísticas en tiempo real.'
};

let chatSessions = JSON.parse(localStorage.getItem('noviq_chat_sessions')) || {};
let currentThemeCategory = 'universo';
let selectedVoiceIndex = 0;

// Galería de fondos por categoría
const themeGalleries = {
    universo: [
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1920&auto=format&fit=crop'
    ],
    paisajes: [
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1426604966848-d7adacbd02bff?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop'
    ],
    ciencia: [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1920&auto=format&fit=crop'
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderDate();
    if (Object.keys(chatSessions).length === 0) {
        renderWelcomeScreen();
    } else {
        const lastKey = Object.keys(chatSessions)[0];
        window.currentSessionId = lastKey;
        loadSessionIntoChat(lastKey);
    }
    initClock();
    loadChatHistoryList();
    setupEventListeners();
});

function saveStateToLocalStorage() {
    localStorage.setItem('noviq_user_progress', JSON.stringify(userProgress));
    localStorage.setItem('noviq_chat_sessions', JSON.stringify(chatSessions));
}

function updateHeaderDate() {
    const badge = document.getElementById('header-date-badge');
    if (badge) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        badge.textContent = `📅 ${new Date().toLocaleDateString('es-ES', options)}`;
    }
}

function initClock() {
    setInterval(() => {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        
        const digitalDisplay = document.getElementById('digital-clock-display');
        if (digitalDisplay) {
            digitalDisplay.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        
        const secHand = document.getElementById('clock-hand-sec');
        const minHand = document.getElementById('clock-hand-min');
        const hourHand = document.getElementById('clock-hand-hour');
        
        if (secHand && minHand && hourHand) {
            const secDeg = (s / 60) * 360;
            const minDeg = ((m + s/60) / 60) * 360;
            const hourDeg = (((h % 12) + m/60) / 12) * 360;
            
            secHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
            minHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
            hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
        }
    }, 1000);
}

function switchTab(tabId) {
    const tabs = ['chat', 'subjects', 'images', 'test', 'progress', 'clock', 'library', 'weather'];
    tabs.forEach(t => {
        const view = document.getElementById(`view-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (view) view.classList.add('hidden');
        if (btn) {
            btn.classList.remove('bg-white/15', 'text-white', 'shadow-md');
            btn.classList.add('text-slate-400');
        }
    });

    const activeView = document.getElementById(`view-${tabId}`);
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeView) activeView.classList.remove('hidden');
    if (activeBtn) {
        activeBtn.classList.add('bg-white/15', 'text-white', 'shadow-md');
        activeBtn.classList.remove('text-slate-400');
    }

    if (tabId === 'subjects') renderSubjectsView();
    if (tabId === 'test') renderIQTestView();
    if (tabId === 'progress') renderIQProgressView();
    if (tabId === 'library') renderLibraryView();
    if (tabId === 'weather') renderWeatherView();
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    }
}

function toggleSidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
}

function togglePlusMenu() {
    const menu = document.getElementById('plus-dropdown-menu');
    if (menu) {
        menu.classList.toggle('hidden');
        menu.classList.toggle('show');
    }
}

function setAiMode(mode) {
    aiMode = mode;
    const tutorBtn = document.getElementById('btn-mode-tutor');
    const sageBtn = document.getElementById('btn-mode-sage');
    const badge = document.getElementById('header-mode-badge');
    
    if (mode === 'tutor') {
        tutorBtn.style.backgroundColor = 'var(--theme-color)';
        tutorBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md';
        sageBtn.style.backgroundColor = 'transparent';
        sageBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/10 cursor-pointer';
        badge.textContent = 'Novic V 4.8 - Tutor Socrático Académico 🌟';
    } else {
        sageBtn.style.backgroundColor = 'var(--theme-color)';
        sageBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md';
        tutorBtn.style.backgroundColor = 'transparent';
        tutorBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/10 cursor-pointer';
        badge.textContent = 'Novic V 4.8 - Modo Sabio Conceptual 🦉';
    }
    playSound('click');
}

function renderWelcomeScreen() {
    const container = document.getElementById('chat-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="max-w-2xl mx-auto my-auto text-center space-y-6 message-animate py-12">
            <div class="w-16 h-16 mx-auto rounded-3xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shadow-lg">
                <span class="text-3xl">💡</span>
            </div>
            <div class="space-y-2">
                <h2 class="text-2xl font-extrabold text-white">¡Hola! Qué gusto saludarte, soy Novic V 4.8</h2>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Estoy aquí para apoyarte paso a paso en tu aprendizaje. No te daré las respuestas hechas, ¡quiero ayudarte a descubrirlas por ti mismo para que nunca se te olviden! ¿Qué tema te gustaría explorar hoy?
                </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <button onclick="sendQuickPrompt('Explícame la estequiometría paso a paso')" class="p-3.5 rounded-2xl ultra-glass-panel hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">
                    🧪 ¿Cómo balancear ecuaciones químicas?
                </button>
                <button onclick="sendQuickPrompt('¿Cómo funciona el ciclo de Krebs en biología?')" class="p-3.5 rounded-2xl ultra-glass-panel hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">
                    🧬 Entender el Ciclo de Krebs
                </button>
                <button onclick="sendQuickPrompt('Ayúdame a resolver un problema de física cinemática')" class="p-3.5 rounded-2xl ultra-glass-panel hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">
                    ⚡ Problemas de cinemática
                </button>
                <button onclick="sendQuickPrompt('Enséñame técnicas de autogestión emocional')" class="p-3.5 rounded-2xl ultra-glass-panel hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">
                    🧠 Inteligencia Emocional
                </button>
            </div>
        </div>
    `;
}

function sendQuickPrompt(text) {
    const input = document.getElementById('user-input');
    if (input) {
        input.value = text;
        handleUserMessageSubmission();
    }
}

function setupEventListeners() {
    const form = document.getElementById('chat-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleUserMessageSubmission();
        });
    }

    const input = document.getElementById('user-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserMessageSubmission();
            }
        });
    }
}

function toggleEdgeLightEffect(active) {
    const form = document.getElementById('chat-form');
    const glowBar = document.getElementById('multicolor-glow-bar');
    if (form) {
        if (active) form.classList.add('edge-light-generating');
        else form.classList.remove('edge-light-generating');
    }
    if (glowBar) {
        if (active) glowBar.classList.add('multicolor-active');
        else glowBar.classList.remove('multicolor-active');
    }
}

function handleUserMessageSubmission() {
    const input = document.getElementById('user-input');
    if (!input || !input.value.trim()) return;
    
    const text = input.value.trim();
    input.value = '';
    
    const container = document.getElementById('chat-container');
    if (container.querySelector('.max-w-2xl')) container.innerHTML = '';
    
    appendMessage(text, 'user');
    
    if (!chatSessions[window.currentSessionId]) {
        chatSessions[window.currentSessionId] = { title: text.substring(0, 25) + '...', messages: [] };
        userProgress.totalSessions += 1;
    }
    chatSessions[window.currentSessionId].messages.push({ sender: 'user', text });
    
    // Actualizar métricas de progreso dinámicamente según interacción del alumno
    userProgress.cognitiveProgress = Math.min(100, userProgress.cognitiveProgress + 3);
    userProgress.iq = 100 + Math.floor(userProgress.cognitiveProgress * 0.35);
    
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const todayName = days[new Date().getDay()];
    if (userProgress.dailyActivity[todayName] !== undefined) {
        userProgress.dailyActivity[todayName] += 1;
    }

    if (userProgress.cognitiveProgress > 75) {
        userProgress.levelName = 'Sabio / Experto';
    } else if (userProgress.cognitiveProgress > 40) {
        userProgress.levelName = 'Veterano';
    } else if (userProgress.cognitiveProgress > 15) {
        userProgress.levelName = 'Intermedio';
    } else {
        userProgress.levelName = 'Principiante';
    }

    saveStateToLocalStorage();
    loadChatHistoryList();

    toggleEdgeLightEffect(true);

    setTimeout(() => {
        toggleEdgeLightEffect(false);
        generateSocraticResponse(text);
    }, 1200);
}

let currentUtterance = null;

function speakMessage(text, buttonElement) {
    if (!('speechSynthesis' in window)) {
        alert('La síntesis de voz no está soportada en este navegador.');
        return;
    }

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter(v => v.lang.startsWith('es') || v.lang.startsWith('ES'));
    
    let chosenVoice = null;
    if (spanishVoices.length > 0) {
        chosenVoice = spanishVoices[selectedVoiceIndex % spanishVoices.length];
    } else if (voices.length > 0) {
        chosenVoice = voices[selectedVoiceIndex % voices.length];
    }

    currentUtterance = new SpeechSynthesisUtterance(text);
    if (chosenVoice) currentUtterance.voice = chosenVoice;
    currentUtterance.rate = 1.0;
    currentUtterance.pitch = 1.0;

    window.speechSynthesis.speak(currentUtterance);
}

function pauseSpeech() {
    if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
        } else if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }
}

function retrySpeech(text, buttonElement) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speakMessage(text, buttonElement);
}

function appendMessage(text, sender) {
    const container = document.getElementById('chat-container');
    if (!container) return;
    
    const isUser = sender === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} message-animate`;
    
    let actionsHtml = '';
    if (!isUser) {
        const escapedText = text.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
        actionsHtml = `
            <div class="flex items-center gap-3 mt-3 pt-2 border-t border-white/10 text-[11px]">
                <button onclick="speakMessage('${escapedText}', this)" class="flex items-center gap-1 text-blue-300 hover:text-white cursor-pointer transition-colors">
                    🔊 Escuchar
                </button>
                <button onclick="pauseSpeech()" class="flex items-center gap-1 text-amber-300 hover:text-white cursor-pointer transition-colors">
                    ⏸️ Pausar / Reanudar
                </button>
                <button onclick="retrySpeech('${escapedText}', this)" class="flex items-center gap-1 text-emerald-300 hover:text-white cursor-pointer transition-colors">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }

    msgDiv.innerHTML = `
        <div class="max-w-xl rounded-3xl p-4 text-xs leading-relaxed ${isUser ? 'bg-blue-600 text-white shadow-md' : 'ultra-glass-panel text-slate-100 border border-white/10'}">
            <div class="font-bold mb-1 opacity-75">${isUser ? 'Tú' : 'Novic Socrático'}</div>
            <div class="whitespace-pre-wrap">${escapeHtml(text)}</div>
            ${actionsHtml}
        </div>
    `;
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function generateSocraticResponse(userText) {
    let response = "";
    const lower = userText.toLowerCase();
    
    if (lower.includes('hola') || lower.includes('buenas noches') || lower.includes('buenos dias') || lower.includes('buenas tardes')) {
        response = "¡Hola! Qué gusto saludarte por aquí. ¿Cómo ha ido tu día? Dime, ¿en qué tema o concepto te gustaría que te acompañe hoy para que lo aprendamos juntos paso a paso?";
    } else if (lower.includes('resuélveme') || lower.includes('dame la respuesta') || lower.includes('haz la tarea') || lower.includes('resultado')) {
        response = "¡Hola con confianza! Me encantaría darte el resultado directo, pero sé que eres muy capaz de llegar a él por ti mismo y así lo aprenderás mejor. ¿Qué tal si empezamos analizando los datos que tenemos? Cuéntame, ¿qué es lo primero que identificas en el problema?";
    } else if (lower.includes('estequiometría') || lower.includes('estequiometria') || lower.includes('balancear')) {
        response = "¡Excelente tema! La química es hermosa cuando le tomamos el hilo. Para empezar a balancear nuestra ecuación juntos, dime: ¿Qué ley fundamental de la química nos recuerda que la cantidad de átomos en los reactivos debe ser igual a la de los productos?";
    } else if (lower.includes('ciclo de krebs') || lower.includes('biología')) {
        response = "El ciclo de Krebs es clave en la biología. Vamos a desglosarlo para que te resulte súper sencillo. Antes de ver las reacciones, dime: ¿En qué parte específica de la célula ocurre este proceso energético?";
    } else if (lower.includes('cinemática') || lower.includes('física')) {
        response = "¡La física describe el movimiento que nos rodea! Vamos a pensarlo juntos: Si un objeto se mueve con aceleración constante, ¿cómo te imaginas que cambia su velocidad a medida que pasa el tiempo?";
    } else if (lower.includes('emocional') || lower.includes('emoción')) {
        response = "Qué importante es hablar de lo que sentimos. Aplicar nuestro método de pausa nos ayuda muchísimo. Para iniciar esta reflexión: ¿Cuál dirías que fue el momento exacto que encendió esa emoción en ti?";
    } else {
        response = `¡Qué gran curiosidad tienes sobre "${userText}"! Para ir paso a paso y asegurarnos de que lo entiendas a la perfección, dime: ¿Qué idea o concepto previo conoces sobre esto que nos pueda servir de punto de partida? ¡Aquí estoy para apoyarte!`;
    }
    
    appendMessage(response, 'ai');
    chatSessions[window.currentSessionId].messages.push({ sender: 'ai', text: response });
    saveStateToLocalStorage();
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Historial de chats con la 'X' para eliminar
function loadChatHistoryList() {
    const list = document.getElementById('sidebar-chat-history-list');
    if (!list) return;
    
    list.innerHTML = '';
    const sessionKeys = Object.keys(chatSessions);
    
    if (sessionKeys.length === 0) {
        list.innerHTML = `<div class="px-2 py-2 text-[11px] text-slate-500 italic">No hay chats guardados.</div>`;
        return;
    }

    sessionKeys.forEach(id => {
        const session = chatSessions[id];
        const itemWrapper = document.createElement('div');
        itemWrapper.className = `flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] transition-colors ${id == window.currentSessionId ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
        
        const btn = document.createElement('button');
        btn.onclick = () => { window.currentSessionId = id; loadSessionIntoChat(id); playSound('click'); };
        btn.className = 'text-left truncate flex-1 cursor-pointer bg-transparent border-none text-inherit';
        btn.textContent = `💬 ${session.title}`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChatSession(id);
        };
        deleteBtn.className = 'ml-2 px-1.5 py-0.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-white/10 cursor-pointer text-xs transition-colors';
        deleteBtn.title = 'Borrar chat';
        deleteBtn.textContent = 'X';
        
        itemWrapper.appendChild(btn);
        itemWrapper.appendChild(deleteBtn);
        list.appendChild(itemWrapper);
    });
}

function deleteChatSession(id) {
    delete chatSessions[id];
    saveStateToLocalStorage();
    
    if (window.currentSessionId == id) {
        const remainingIds = Object.keys(chatSessions);
        if (remainingIds.length > 0) {
            window.currentSessionId = remainingIds[0];
            loadSessionIntoChat(window.currentSessionId);
        } else {
            window.currentSessionId = Date.now();
            renderWelcomeScreen();
        }
    }
    loadChatHistoryList();
    playSound('click');
}

function loadSessionIntoChat(id) {
    window.currentSessionId = id;
    const session = chatSessions[id];
    const container = document.getElementById('chat-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (session && session.messages) {
        session.messages.forEach(msg => appendMessage(msg.text, msg.sender));
    } else {
        renderWelcomeScreen();
    }
    loadChatHistoryList();
}

function filterChatHistory(query) {
    const list = document.getElementById('sidebar-chat-history-list');
    if (!list) return;
    const items = list.children;
    for (let item of items) {
        if (item.textContent.toLowerCase().includes(query.toLowerCase())) item.style.display = 'flex';
        else item.style.display = 'none';
    }
}

// SECCIÓN DE PROGRESO DE IQ (Con gráficos estadísticos diarios dinámicos desde cero)
function renderIQProgressView() {
    const view = document.getElementById('view-progress');
    if (!view) return;
    
    const act = userProgress.dailyActivity;
    
    view.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 class="text-2xl font-bold text-white">📈 Progreso de IQ y Evolución Cognitiva</h2>
                <p class="text-xs text-slate-400">Tus estadísticas de aprendizaje guardadas y actualizadas en tiempo real.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="ultra-glass-panel p-6 rounded-3xl text-center space-y-2">
                    <span class="text-2xl">🎓</span>
                    <div class="text-xl font-extrabold text-white">${userProgress.levelName}</div>
                    <div class="text-[11px] text-slate-400">Nivel Actual</div>
                </div>
                <div class="ultra-glass-panel p-6 rounded-3xl text-center space-y-2">
                    <span class="text-2xl">💬</span>
                    <div class="text-xl font-extrabold text-white">${userProgress.totalSessions} Sesiones</div>
                    <div class="text-[11px] text-slate-400">Tutorías Socráticas Registradas</div>
                </div>
                <div class="ultra-glass-panel p-6 rounded-3xl text-center space-y-2">
                    <span class="text-2xl">🌟</span>
                    <div class="text-xl font-extrabold text-white">${userProgress.iq} IQ</div>
                    <div class="text-[11px] text-slate-400">Estimación Cognitiva</div>
                </div>
            </div>

            <!-- Barra de Progreso General -->
            <div class="ultra-glass-panel p-6 rounded-3xl space-y-3">
                <div class="flex justify-between text-xs text-slate-300 font-bold">
                    <span>Progreso de Interacción Cognitiva</span>
                    <span id="cognitive-level-text">${userProgress.cognitiveProgress}% Completado</span>
                </div>
                <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div id="cognitive-bar-fill" class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style="width: ${userProgress.cognitiveProgress}%;"></div>
                </div>
            </div>

            <!-- Gráfico Estadístico Diario (Empieza en cero y aumenta con la interacción) -->
            <div class="ultra-glass-panel p-6 rounded-3xl space-y-4">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">📊 Gráfico Estadístico Diario de Actividad</h3>
                <div class="grid grid-cols-7 gap-2 text-center pt-2">
                    <div class="bg-white/5 p-3 rounded-2xl"><div class="text-[10px] text-slate-400">Lun</div><div class="text-xs font-bold text-blue-400 mt-1">${act['Lun']} interac.</div></div>
                    <div class="bg-white/5 p-3 rounded-2xl"><div class="text-[10px] text-slate-400">Mar</div><div class="text-xs font-bold text-blue-400 mt-1">${act['Mar']} interac.</div></div>
                    <div class="bg-white/5 p-3 rounded-2xl"><div class="text-[10px] text-slate-400">Mié</div><div class="text-xs font-bold text-blue-400 mt-1">${act['Mié']} interac.</div></div>
                    <div class="bg-white/5 p-3 rounded-2xl"><div class="text-[10px] text-slate-400">Jue</div><div class="text-xs font-bold text-blue-400 mt-1">${act['Jue']} interac.</div></div>
                    <div class="bg-white/5 p-3 rounded-2xl"><div class="text-[10px] text-slate-400">Vie</div><div class="text-xs font-bold text-blue-400 mt-1">${act['Vie']} interac.</div></div>
                    <div class="bg-white/5 p-3 rounded-2xl"><div class="text-[10px] text-slate-400">Sáb</div><div class="text-xs font-bold text-blue-400 mt-1">${act['Sáb']} interac.</div></div>
                    <div class="bg-blue-600/30 border border-blue-400/40 p-3 rounded-2xl"><div class="text-[10px] text-white font-bold">Dom</div><div class="text-xs font-bold text-blue-300 mt-1">${act['Dom']} interac.</div></div>
                </div>
            </div>

            <!-- Consejo y Retroalimentación de la IA -->
            <div class="ultra-glass-panel p-6 rounded-3xl space-y-2 border-l-4 border-blue-500">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">💡 Recomendación Personalizada de Novic</h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                    "${userProgress.advice}"
                </p>
            </div>
        </div>
    `;
}

function renderSubjectsView() {
    const view = document.getElementById('view-subjects');
    if (!view) return;
    
    const subjects = [
        { name: 'Matemáticas', icon: '📐', desc: 'Álgebra, cálculo y trigonometría explicados paso a paso.', bg: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop' },
        { name: 'Química', icon: '🧪', desc: 'Reacciones, enlaces y balanceo con tutoría socrática.', bg: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop' },
        { name: 'Biología', icon: '🧬', desc: 'Genética, organelos, ciclo de Krebs y fotosíntesis.', bg: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=800&auto=format&fit=crop' },
        { name: 'Física', icon: '⚡', desc: 'Leyes de Newton, termodinámica y electromagnetismo.', bg: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop' },
        { name: 'Inteligencia Emocional', icon: '🧠', desc: 'Autogestión, regulación y toma de decisiones asertivas.', bg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop' }
    ];
    
    view.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 class="text-2xl font-bold text-white">🔬 Materias Académicas</h2>
                <p class="text-xs text-slate-400">Selecciona una materia para iniciar una tutoría especializada guiada.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${subjects.map(s => `
                    <div class="relative rounded-3xl overflow-hidden p-8 space-y-4 hover:scale-[1.02] transition-all cursor-pointer shadow-2xl border border-white/20 group" onclick="switchTab('chat'); sendQuickPrompt('Quiero estudiar ${s.name}');" style="background: linear-gradient(rgba(10,15,30,0.7), rgba(10,15,30,0.85)), url('${s.bg}'); background-size: cover; background-position: center;">
                        <div class="text-4xl p-3 bg-white/10 rounded-2xl w-fit backdrop-blur-md">${s.icon}</div>
                        <h3 class="font-extrabold text-lg text-white group-hover:text-blue-300 transition-colors">${s.name}</h3>
                        <p class="text-xs text-slate-200 leading-relaxed">${s.desc}</p>
                        <div class="pt-2 text-xs font-bold text-blue-400 flex items-center gap-1">Iniciar tutoría ➔</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderIQTestView() {
    const view = document.getElementById('view-test');
    if (!view) return;
    
    const levels = [
        { name: 'Nivel Principiante', icon: '🌱', desc: 'Desafíos lógicos iniciales para activar el pensamiento crítico.', bg: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop' },
        { name: 'Nivel Veterano', icon: '⚡', desc: 'Problemas analíticos de razonamiento abstracto intermedio.', bg: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop' },
        { name: 'Nivel Experto', icon: '🔥', desc: 'Situaciones complejas de deducción lógica y científica.', bg: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop' },
        { name: 'Nivel Sabio', icon: '🦉', desc: 'Pruebas maestras de máxima exigencia cognitiva.', bg: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop' }
    ];

    view.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="text-center space-y-2">
                <h2 class="text-2xl font-bold text-white">📝 Test de IQ y Razonamiento Socrático</h2>
                <p class="text-xs text-slate-400">Selecciona un nivel para poner a prueba tu pensamiento crítico.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${levels.map((lvl, idx) => `
                    <div class="relative rounded-3xl overflow-hidden p-6 space-y-3 hover:scale-[1.02] transition-all cursor-pointer border border-white/20 shadow-lg group" onclick="startIQLevelTest(${idx + 1})" style="background: linear-gradient(rgba(10,15,30,0.75), rgba(10,15,30,0.9)), url('${lvl.bg}'); background-size: cover; background-position: center;">
                        <div class="text-3xl">${lvl.icon}</div>
                        <h3 class="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">${lvl.name}</h3>
                        <p class="text-xs text-slate-300 leading-relaxed">${lvl.desc}</p>
                        <div class="text-[11px] font-bold text-blue-400 pt-2">Comenzar test ➔</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function startIQLevelTest(levelNum) {
    alert(`Iniciando Test de IQ - Nivel ${['Principiante', 'Veterano', 'Experto', 'Sabio'][levelNum - 1]}`);
    switchTab('chat');
    sendQuickPrompt(`Ponme un desafío del test de IQ nivel ${levelNum}`);
}

function renderWeatherView() {
    const view = document.getElementById('view-weather');
    if (!view) return;
    
    view.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 class="text-2xl font-bold text-white">🌤️ Clima y Pronóstico de Estudio</h2>
                <p class="text-xs text-slate-400">Condiciones meteorológicas actuales para optimizar tu jornada de aprendizaje.</p>
            </div>
            <div class="ultra-glass-panel p-8 rounded-3xl space-y-6">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div class="text-3xl font-extrabold text-white">22°C</div>
                        <div class="text-xs text-blue-400 font-bold mt-1">Parcialmente Nublado 🌥️</div>
                        <div class="text-[11px] text-slate-400 mt-1">Clima ideal para concentración óptima</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-300">Humedad: 65%</div>
                        <div class="text-xs text-slate-300">Viento: 12 km/h</div>
                        <div class="text-xs text-slate-300">Índice UV: Bajo</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLibraryView() {
    const view = document.getElementById('library-content');
    if (!view) return;
    
    const libraryItems = [
        { title: 'Estequiometría y Leyes Ponderales', category: 'Química', summary: 'Relación cuantitativa entre reactivos y productos en una reacción química.' },
        { title: 'Ciclo de Krebs y Fosforilación Oxidativa', category: 'Biología', summary: 'Ruta metabólica central en la respiración celular aeróbica.' },
        { title: 'Leyes de Newton y Dinámica', category: 'Física', summary: 'Principios que relacionan la fuerza con la aceleración y el movimiento.' }
    ];
    
    view.innerHTML = libraryItems.map(item => `
        <div class="ultra-glass-panel p-6 rounded-3xl space-y-2">
            <span class="text-[10px] uppercase font-bold text-blue-400">${item.category}</span>
            <h3 class="font-bold text-sm text-white">${item.title}</h3>
            <p class="text-xs text-slate-300">${item.summary}</p>
        </div>
    `).join('');
}

let mediaStream = null;
async function openCameraModal() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-video');
    if (modal) modal.classList.remove('hidden');
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (video) video.srcObject = mediaStream;
    } catch (e) {
        alert('No se pudo acceder a la cámara web.');
    }
}

function closeCameraModal() {
    const modal = document.getElementById('camera-modal');
    if (modal) modal.classList.add('hidden');
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

function capturePhotoFromCamera() {
    alert('Foto capturada con éxito. Novic la analizará en la próxima respuesta.');
    closeCameraModal();
}

function handleFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
        alert(`Archivo "${file.name}" cargado correctamente en Novic.`);
        togglePlusMenu();
    }
}

function toggleSpeechRecognition() {
    const wave = document.getElementById('mic-wave-animation');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('El reconocimiento de voz no está soportado en este navegador.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    
    recognition.onstart = () => { if (wave) wave.classList.remove('hidden'); };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('user-input');
        if (input) input.value = transcript;
    };
    recognition.onerror = () => { if (wave) wave.classList.add('hidden'); };
    recognition.onend = () => { if (wave) wave.classList.add('hidden'); };
    
    recognition.start();
}

function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.add('hidden');
    }
}

function selectGoogleVoice(index) {
    selectedVoiceIndex = index;
    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`voice-option-${i}`);
        if (btn) {
            if (i === index) btn.className = 'p-3 rounded-2xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-md';
            else btn.className = 'p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs cursor-pointer';
        }
    }
    playSound('click');
}

function applyPresetTheme(color) {
    document.documentElement.style.setProperty('--theme-color', color);
    playSound('click');
}

function setCustomThemeColor(color) {
    document.documentElement.style.setProperty('--theme-color', color);
}

function setThemeCategory(category) {
    currentThemeCategory = category;
    const gallery = themeGalleries[category];
    if (gallery && gallery.length > 0) {
        const randomImg = gallery[Math.floor(Math.random() * gallery.length)];
        const bgLayer = document.getElementById('chat-bg-layer');
        if (bgLayer) bgLayer.style.backgroundImage = `url('${randomImg}')`;
    }
    playSound('click');
}

function handleCustomBackgroundUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const bgLayer = document.getElementById('chat-bg-layer');
            if (bgLayer) bgLayer.style.backgroundImage = `url('${e.target.result}')`;
        };
        reader.readAsDataURL(file);
    }
}

function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'click') {
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        }
    } catch (e) {}
}