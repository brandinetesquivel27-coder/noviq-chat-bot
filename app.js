// ==========================================
// NOVIQ v5.0 - Tu Guía Personal (Core Logic Completo)
// ==========================================

const GEMINI_API_KEY = "AQ.Ab8RN6J9rkZ_OQ84ALdFlSXDq0NCCRmc_sOQ1ZirjPhNvhLatQ";

window.currentSessionId = Date.now();

let userProgress = JSON.parse(localStorage.getItem('noviq_user_progress')) || {
    iq: 100,
    levelName: 'Principiante',
    totalSessions: 0,
    cognitiveProgress: 0,
    dailyActivity: { 'Lun': 2, 'Mar': 4, 'Mié': 3, 'Jue': 5, 'Vie': 6, 'Sáb': 4, 'Dom': 3 },
    advice: '¡Excelente ritmo! Mantén la constancia en tus consultas de física y química para elevar tu nivel cognitivo.'
};

let chatSessions = JSON.parse(localStorage.getItem('noviq_chat_sessions')) || {};
let libraryNotes = JSON.parse(localStorage.getItem('noviq_library_notes')) || [];
let selectedVoiceIndex = 0;

// Catálogo de Fondos Avanzado (Imágenes estáticas y GIFs animados)
const themeGalleries = {
    universo: [
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1920&auto=format&fit=crop'
    ],
    paisajes: [
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1426604966848-d7adacbd02bff?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop'
    ],
    ciencia: [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1920&auto=format&fit=crop'
    ]
};

let selectedThemeCategoryPreview = 'universo';
let selectedThemeUrlPreview = '';

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderDate();
    initVoicesList();
    loadSavedTheme();
    renderThemeGalleryOptions('universo');
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
    localStorage.setItem('noviq_library_notes', JSON.stringify(libraryNotes));
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

function updateBackgroundBlurState() {
    const container = document.getElementById('chat-container');
    const body = document.body;
    if (!container) return;
    
    if (container.querySelector('.max-w-2xl')) {
        body.classList.add('bg-blurred');
        body.classList.remove('bg-clear');
    } else {
        body.classList.remove('bg-blurred');
        body.classList.add('bg-clear');
    }
}

function switchTab(tabId) {
    const tabs = ['chat', 'subjects', 'test', 'progress', 'clock', 'library'];
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

function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        if (type === 'click') {
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.04);
        } else if (type === 'key') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300 + Math.random() * 150, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.03);
        }
    } catch (e) {}
}

function handleTypingSound() {
    playSound('key');
}

function selectThemeCategoryTab(category) {
    selectedThemeCategoryPreview = category;
    ['universo', 'paisajes', 'ciencia'].forEach(cat => {
        const btn = document.getElementById(`theme-cat-tab-${cat}`);
        if (btn) {
            if (cat === category) {
                btn.classList.add('bg-blue-600', 'text-white', 'font-bold');
                btn.classList.remove('bg-white/10', 'text-slate-300');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white', 'font-bold');
                btn.classList.add('bg-white/10', 'text-slate-300');
            }
        }
    });
    renderThemeGalleryOptions(category);
    playSound('click');
}

function renderThemeGalleryOptions(category) {
    const container = document.getElementById('theme-gallery-grid');
    if (!container) return;
    const urls = themeGalleries[category];
    container.innerHTML = urls.map((url, idx) => `
        <div onclick="selectThumbnailUrl('${url}')" class="relative rounded-2xl overflow-hidden h-20 cursor-pointer border-2 ${selectedThemeUrlPreview === url ? 'border-blue-500 shadow-lg scale-105' : 'border-white/10 opacity-70 hover:opacity-100'} transition-all">
            <img src="${url}" class="w-full h-full object-cover" alt="Tema">
        </div>
    `).join('');
}

function selectThumbnailUrl(url) {
    selectedThemeUrlPreview = url;
    renderThemeGalleryOptions(selectedThemeCategoryPreview);
    playSound('click');
}

function handleCustomThemeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedThemeUrlPreview = e.target.result;
        alert("¡Imagen local cargada con éxito! Haz clic en 'Guardar' para aplicarla.");
        playSound('click');
    };
    reader.readAsDataURL(file);
}

function applySelectedTheme() {
    if (selectedThemeUrlPreview) {
        const bodyEl = document.body;
        bodyEl.style.setProperty('--custom-bg-image', `url('${selectedThemeUrlPreview}')`);
        bodyEl.classList.add('has-custom-background');
        bodyEl.style.background = `linear-gradient(rgba(10,15,30,0.85), rgba(10,15,30,0.95)), url('${selectedThemeUrlPreview}')`;
        bodyEl.style.backgroundSize = 'cover';
        bodyEl.style.backgroundAttachment = 'fixed';
        bodyEl.style.backgroundPosition = 'center';
        localStorage.setItem('noviq_active_theme_url', selectedThemeUrlPreview);
    }
    closeSettings();
    playSound('click');
}

function loadSavedTheme() {
    const savedUrl = localStorage.getItem('noviq_active_theme_url');
    if (savedUrl) {
        const bodyEl = document.body;
        bodyEl.style.setProperty('--custom-bg-image', `url('${savedUrl}')`);
        bodyEl.classList.add('has-custom-background');
        bodyEl.style.background = `linear-gradient(rgba(10,15,30,0.85), rgba(10,15,30,0.95)), url('${savedUrl}')`;
        bodyEl.style.backgroundSize = 'cover';
        bodyEl.style.backgroundAttachment = 'fixed';
        bodyEl.style.backgroundPosition = 'center';
        selectedThemeUrlPreview = savedUrl;
    }
}

function openSettings() {
    document.getElementById('settings-modal')?.classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settings-modal')?.classList.add('hidden');
}

function toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Tu navegador no soporta el dictado por voz integrado.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const input = document.getElementById('user-input');
    const micWave = document.getElementById('mic-wave-animation');
    
    if (input) input.placeholder = "Escuchando atentamente...";
    if (micWave) micWave.classList.remove('hidden');

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        if (input) {
            input.value = speechResult;
            input.placeholder = "Escribe tu duda científica aquí...";
        }
        if (micWave) micWave.classList.add('hidden');
        playSound('click');
    };

    recognition.onerror = () => {
        if (input) input.placeholder = "Escribe tu duda científica aquí...";
        if (micWave) micWave.classList.add('hidden');
    };

    recognition.onend = () => {
        if (input) input.placeholder = "Escribe tu duda científica aquí...";
        if (micWave) micWave.classList.add('hidden');
    };

    recognition.start();
}

const welcomeGreetings = [
    "¡Hola! Qué gusto tenerte por aquí. ¿Qué desafío de ciencia o tecnología resolvemos hoy?",
    "¡Hola! Soy tu guía personal, listo para explicarte cualquier tema de matemáticas, física, química o biología.",
    "¡Qué alegría saludarte! Dime, ¿qué experimento o problema académico exploramos juntos?"
];

function renderWelcomeScreen() {
    const container = document.getElementById('chat-container');
    if (!container) return;
    const randomGreeting = welcomeGreetings[Math.floor(Math.random() * welcomeGreetings.length)];
    
    container.innerHTML = `
        <div class="max-w-2xl mx-auto my-auto text-center space-y-6 message-animate py-12">
            <!-- Logotipo 3D con extensión .jpeg en la pantalla de bienvenida -->
            <div class="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-1 bg-slate-900/80">
                <img src="logo-claro.jpeg" class="w-full h-full object-cover rounded-2xl drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" alt="NOVIQ Logo">
            </div>
            <div class="space-y-2">
                <h2 class="text-2xl font-extrabold text-white">${randomGreeting}</h2>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Te explicaré los conceptos paso a paso con analogías claras y ejemplos cotidianos.
                </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <button onclick="sendQuickPrompt('Explícame la estequiometría con un ejemplo sencillo')" class="p-3.5 rounded-2xl ultra-glass-panel hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">🧪 Estequiometría paso a paso</button>
                <button onclick="sendQuickPrompt('¿Cómo funciona el ciclo de Krebs en biología?')" class="p-3.5 rounded-2xl ultra-glass-panel hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">🧬 Entender el Ciclo de Krebs</button>
                <button onclick="sendQuickPrompt('Ayúdame a resolver un problema de cinemática en física')" class="p-3.5 rounded-2xl ultra-glass-panel hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">⚡ Problemas de cinemática</button>
                <button onclick="sendQuickPrompt('Enséñame técnicas de autogestión emocional')" class="p-3.5 rounded-2xl ultra-glass-panel hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">🧠 Inteligencia Emocional</button>
            </div>
        </div>
    `;
    updateBackgroundBlurState();
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
    const glowBar = document.getElementById('multicolor-glow-bar');
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
    updateBackgroundBlurState();
    
    if (!chatSessions[window.currentSessionId]) {
        chatSessions[window.currentSessionId] = { title: text.substring(0, 25) + '...', messages: [] };
        userProgress.totalSessions += 1;
    }
    chatSessions[window.currentSessionId].messages.push({ sender: 'user', text });
    
    userProgress.cognitiveProgress = Math.min(100, userProgress.cognitiveProgress + 3);
    userProgress.iq = 100 + Math.floor(userProgress.cognitiveProgress * 0.35);

    if (userProgress.cognitiveProgress > 75) userProgress.levelName = 'Sabio / Experto';
    else if (userProgress.cognitiveProgress > 40) userProgress.levelName = 'Veterano';
    else if (userProgress.cognitiveProgress > 15) userProgress.levelName = 'Intermedio';
    else userProgress.levelName = 'Principiante';

    saveStateToLocalStorage();
    loadChatHistoryList();
    toggleEdgeLightEffect(true);

    callGeminiApi(text);
}

async function callGeminiApi(userPrompt) {
    const container = document.getElementById('chat-container');
    const loadingId = 'loading-' + Date.now();
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'flex justify-start message-animate';
    loadingDiv.innerHTML = `
        <div class="ultra-glass-panel rounded-3xl p-4 text-xs text-slate-300 flex items-center space-x-3">
            <div class="flex space-x-1 items-center">
                <div class="w-2.5 h-2.5 bg-white rounded-full animate-spin" style="animation-duration: 0.8s;"></div>
                <div class="w-2.5 h-2.5 bg-white rounded-full animate-spin" style="animation-duration: 0.8s; animation-delay: 0.2s;"></div>
                <div class="w-2.5 h-2.5 bg-white rounded-full animate-spin" style="animation-duration: 0.8s; animation-delay: 0.4s;"></div>
            </div>
            <span class="font-medium tracking-wide">NOVIQ Guía está redactando la explicación...</span>
        </div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                systemInstruction: {
                    parts: [{ text: "Eres NOVIQ, un asistente virtual educativo gratuito de ciencia y tecnología. Eres el 'docente chill': un guía cercano, amigable y muy didáctico que explica los conceptos complejos usando analogías cotidianas y ejemplos claros." }]
                }
            })
        });

        const data = await response.json();
        document.getElementById(loadingId)?.remove();

        let aiResponseText = "¡Hola! Analicemos este concepto juntos. Cuéntame qué parte te genera dudas.";
        if (data && data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            aiResponseText = data.candidates[0].content.parts[0].text;
        }

        appendMessage(aiResponseText, 'ai', true);
        chatSessions[window.currentSessionId].messages.push({ sender: 'ai', text: aiResponseText });
        saveStateToLocalStorage();

        if (typeof speakMessage === 'function') {
            speakMessage(aiResponseText);
        }

    } catch (error) {
        document.getElementById(loadingId)?.remove();
        const fallbackMsg = "¡Hola! Hubo una pequeña pausa en la red. ¿Qué concepto intentamos repasar?";
        appendMessage(fallbackMsg, 'ai', true);
    }
}

function triggerGradualHint() {
    const hints = [
        "💡 Pista 1 (Analogía): Imagina que los elementos químicos actúan como piezas de un rompecabezas que deben encajar exactamente.",
        "💡 Pista 2 (Concepto): Revisa las unidades de medida antes de realizar cualquier operación matemática.",
        "💡 Pista 3 (Primer Paso): Anota los datos iniciales y despeja la incógnita principal."
    ];
    appendMessage(hints[Math.floor(Math.random() * hints.length)], 'ai', true);
}

// ---- SISTEMA DE VOZ UNIVERSAL CORREGIDO ----
function initVoicesList() {
    if (!('speechSynthesis' in window)) return;
    const populateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const select = document.getElementById('voice-select');
        if (!select) return;
        select.innerHTML = '';
        
        if (voices.length === 0) {
            const opt = document.createElement('option');
            opt.value = "";
            opt.textContent = "Voz predeterminada del sistema";
            select.appendChild(opt);
            return;
        }

        voices.forEach((voice, index) => {
            // Muestra todas las voces disponibles (priorizando español o configuraciones generales)
            if (voice.lang.toLowerCase().includes('es') || voice.name.toLowerCase().includes('spanish') || voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('microsoft')) {
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = `${voice.name} (${voice.lang})`;
                if ((voice.name.includes('Google') || voice.name.includes('Microsoft')) && voice.lang.toLowerCase().includes('es')) {
                    opt.selected = true;
                    selectedVoiceIndex = index;
                }
                select.appendChild(opt);
            }
        });

        // Si no seleccionó ninguna por defecto, toma la primera
        if (select.options.length > 0 && select.selectedIndex === -1) {
            select.selectedIndex = 0;
            selectedVoiceIndex = select.value;
        }
    };
    
    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }
}

function cleanTextForSpeech(text) {
    let cleaned = text
        .replace(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g, '')
        .replace(/[*_`#]/g, '')
        .replace(/["']/g, '');
    return cleaned;
}

function speakMessage(text) {
    if (!('speechSynthesis' in window)) {
        alert("La síntesis de voz no es compatible con este navegador.");
        return;
    }
    
    window.speechSynthesis.cancel();
    
    const speechReadyText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(speechReadyText);
    const voices = window.speechSynthesis.getVoices();
    
    // Obtiene el índice actualizado directamente del selector HTML para respetar el cambio del usuario (Google o Microsoft)
    const selectElement = document.getElementById('voice-select');
    if (selectElement && selectElement.value !== "") {
        selectedVoiceIndex = parseInt(selectElement.value, 10);
    }

    if (voices.length > 0 && voices[selectedVoiceIndex]) {
        utterance.voice = voices[selectedVoiceIndex];
    }
    
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Corrección crítica para Google Chrome: asegurar un pequeño ciclo de retención o ejecución limpia
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 50);
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

function retrySpeech(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        speakMessage(text);
    }
}
// --------------------------------------------

function appendMessage(text, sender, withTransitionEffect = false) {
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
                <button onclick="speakMessage('${escapedText}')" class="text-blue-300 hover:text-white cursor-pointer">🔊 Escuchar</button>
                <button onclick="pauseSpeech()" class="text-amber-300 hover:text-white cursor-pointer">⏸️ Pausar</button>
                <button onclick="retrySpeech('${escapedText}')" class="text-emerald-300 hover:text-white cursor-pointer">🔄 Repetir</button>
            </div>
        `;
    }

    msgDiv.innerHTML = `
        <div class="max-w-xl rounded-3xl p-4 text-xs leading-relaxed ${isUser ? 'bg-blue-600 text-white shadow-md' : 'ultra-glass-panel text-slate-100 border border-white/10 ' + (withTransitionEffect ? 'ai-completion-glow' : '')}">
            <div class="flex items-center space-x-2 mb-1 opacity-75">
                <span class="font-bold">${isUser ? 'Tú' : 'NOVIQ Guía Personal'}</span>
            </div>
            <div class="whitespace-pre-wrap">${escapeHtml(text)}</div>
            ${actionsHtml}
        </div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    updateBackgroundBlurState();
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

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
        deleteBtn.onclick = (e) => { e.stopPropagation(); deleteChatSession(id); };
        deleteBtn.className = 'ml-2 px-1.5 py-0.5 rounded-md text-slate-400 hover:text-red-400 cursor-pointer text-xs';
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
    if (session && session.messages) session.messages.forEach(msg => appendMessage(msg.text, msg.sender));
    else renderWelcomeScreen();
    loadChatHistoryList();
    updateBackgroundBlurState();
}

function filterChatHistory(query) {
    const list = document.getElementById('sidebar-chat-history-list');
    if (!list) return;
    for (let item of list.children) {
        if (item.textContent.toLowerCase().includes(query.toLowerCase())) item.style.display = 'flex';
        else item.style.display = 'none';
    }
}

function renderLibraryView() {
    const view = document.getElementById('library-content');
    if (!view) return;
    if (libraryNotes.length === 0) {
        view.innerHTML = `<div class="ultra-glass-panel p-6 rounded-3xl text-xs text-slate-400 text-center">Aún no hay fichas guardadas. Empieza a chatear para que se creen automáticamente.</div>`;
        return;
    }
    view.innerHTML = libraryNotes.map(note => `
        <div class="ultra-glass-panel p-6 rounded-3xl space-y-2 border border-white/10">
            <div class="flex justify-between items-center"><h3 class="font-bold text-sm text-white">📖 ${note.title}</h3><span class="text-[10px] text-blue-400">${note.date}</span></div>
            <p class="text-xs text-slate-300 leading-relaxed">${note.summary}</p>
        </div>
    `).join('');
}

function renderIQProgressView() {
    const view = document.getElementById('view-progress');
    if (!view) return;
    const act = userProgress.dailyActivity;
    
    view.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 class="text-2xl font-bold text-white">📈 Progreso de IQ y Evolución Cognitiva</h2>
                <p class="text-xs text-slate-400">Estadísticas dinámicas actualizadas en tiempo real.</p>
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
                    <div class="text-[11px] text-slate-400">Tutorías Registradas</div>
                </div>
                <div class="ultra-glass-panel p-6 rounded-3xl text-center space-y-2">
                    <span class="text-2xl">🌟</span>
                    <div class="text-xl font-extrabold text-white">${userProgress.iq} IQ</div>
                    <div class="text-[11px] text-slate-400">Estimación Cognitiva</div>
                </div>
            </div>
            <div class="ultra-glass-panel p-6 rounded-3xl space-y-4">
                <h3 class="text-sm font-bold text-white">📊 Gráfico Estadístico de Actividad Semanal</h3>
                <div class="grid grid-cols-7 gap-2 text-center pt-2">
                    ${Object.keys(act).map(day => `
                        <div class="bg-white/5 p-3 rounded-2xl"><div class="text-[10px] text-slate-400">${day}</div><div class="text-xs font-bold text-blue-400 mt-1">${act[day]} act.</div></div>
                    `).join('')}
                </div>
            </div>
            <div class="ultra-glass-panel p-6 rounded-3xl space-y-2 border-l-4 border-blue-500">
                <h3 class="text-sm font-bold text-white">💡 Recomendación del Guía Personal</h3>
                <p class="text-xs text-slate-300 leading-relaxed">"${userProgress.advice}"</p>
            </div>
        </div>
    `;
}

function renderSubjectsView() {
    const view = document.getElementById('view-subjects');
    if (!view) return;
    const subjects = [
        { name: 'Matemáticas', icon: '📐', desc: 'Álgebra y cálculo explicados con claridad.', bg: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop' },
        { name: 'Química', icon: '🧪', desc: 'Reacciones y estequiometría paso a paso.', bg: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop' },
        { name: 'Biología', icon: '🧬', desc: 'Genética, ciclo de Krebs y fotosíntesis.', bg: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=800&auto=format&fit=crop' },
        { name: 'Física', icon: '⚡', desc: 'Leyes de Newton y cinemática.', bg: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop' }
    ];
    view.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-6">
            <div><h2 class="text-2xl font-bold text-white">🔬 Materias Académicas</h2><p class="text-xs text-slate-400">Selecciona una materia para iniciar tu tutoría guiada.</p></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${subjects.map(s => `
                    <div class="relative rounded-3xl overflow-hidden p-8 space-y-4 hover:scale-[1.02] transition-all cursor-pointer shadow-2xl border border-white/20" onclick="switchTab('chat'); sendQuickPrompt('Quiero estudiar ${s.name} con explicaciones y ejemplos.');" style="background: linear-gradient(rgba(10,15,30,0.7), rgba(10,15,30,0.85)), url('${s.bg}'); background-size: cover; background-position: center;">
                        <div class="text-4xl p-3 bg-white/10 rounded-2xl w-fit">${s.icon}</div>
                        <h3 class="font-extrabold text-lg text-white">${s.name}</h3>
                        <p class="text-xs text-slate-200">${s.desc}</p>
                        <div class="pt-2 text-xs font-bold text-blue-400">Iniciar tutoría ➔</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

let currentTestLevel = 'principiante';
let currentTestQuestion = 0;
let testScore = 0;
let testTimer = null;
let timeLeft = 30;

const testBanks = {
    principiante: [
        { q: "¿Cuál es la unidad básica de la vida en biología?", options: ["Átomo", "Célula", "Molécula"], correct: 1 },
        { q: "Si un objeto se desplaza a velocidad constante, su aceleración es:", options: ["Cero", "Positiva", "Negativa"], correct: 0 },
        { q: "¿Qué gas absorben las plantas durante la fotosíntesis?", options: ["Oxígeno", "Dióxido de carbono", "Nitrógeno"], correct: 1 },
        { q: "¿Cuál es la fórmula química del agua?", options: ["H2O", "CO2", "NaCl"], correct: 0 },
        { q: "¿Cuánto es 8 al cuadrado?", options: ["16", "64", "32"], correct: 1 },
        { q: "¿Qué planeta es conocido como el planeta rojo?", options: ["Venus", "Marte", "Júpiter"], correct: 1 },
        { q: "¿Cuál es la fuerza que nos atrae hacia el centro de la Tierra?", options: ["Magnetismo", "Gravedad", "Fricción"], correct: 1 },
        { q: "¿Qué órgano bombea la sangre en el cuerpo humano?", options: ["Cerebro", "Pulmón", "Corazón"], correct: 2 },
        { q: "¿Cuál es el resultado de 15 dividido entre 3?", options: ["3", "5", "6"], correct: 1 },
        { q: "¿Qué estudia la química?", options: ["Los astros", "La materia y sus cambios", "El pasado humano"], correct: 1 },
        { q: "¿En qué estado se encuentra el agua a temperatura ambiente?", options: ["Sólido", "Líquido", "Gaseoso"], correct: 1 },
        { q: "¿Cuál es el polímero natural que transporta la herencia genética?", options: ["ADN", "Proteína", "Lípido"], correct: 0 },
        { q: "¿Qué elemento químico tiene el símbolo O?", options: ["Oro", "Osmio", "Oxígeno"], correct: 2 },
        { q: "¿Cuál es el valor aproximado de Pi?", options: ["3.14", "2.71", "1.41"], correct: 0 },
        { q: "¿Qué instrumento se usa para medir la temperatura?", options: ["Barómetro", "Termómetro", "Voltímetro"], correct: 1 },
        { q: "¿Cuántos huesos tiene aproximadamente el cuerpo humano adulto?", options: ["100", "206", "350"], correct: 1 },
        { q: "¿Qué capa gaseosa rodea a la Tierra?", options: ["Atmósfera", "Litosfera", "Hidrosfera"], correct: 0 },
        { q: "¿Cuál es la capital de la energía en la célula?", options: ["Mitocondria", "Ribosoma", "Vacuola"], correct: 0 },
        { q: "¿Qué tipo de energía tiene un objeto en movimiento?", options: ["Potencial", "Cinética", "Térmica"], correct: 1 },
        { q: "¿Cómo se llama el cambio de líquido a gas?", options: ["Fusión", "Evaporación", "Solidificación"], correct: 1 }
    ],
    veterano: [
        { q: "¿Cuál es la segunda Ley de Newton?", options: ["F = m * a", "E = mc^2", "V = I * R"], correct: 0 },
        { q: "¿Qué proceso celular genera gametos con n cromosomas?", options: ["Mitosis", "Meiosis", "Fisión binaria"], correct: 1 },
        { q: "¿Cuál es el pH neutro en la escala química?", options: ["0", "7", "14"], correct: 1 },
        { q: "¿Qué científico propuso la teoría de la relatividad general?", options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla"], correct: 1 },
        { q: "¿Cómo se denomina la tasa de cambio de la posición respecto al tiempo?", options: ["Aceleración", "Velocidad", "Inercia"], correct: 1 },
        { q: "¿Qué enzima duplica el ADN antes de la división celular?", options: ["ADN polimerasa", "Amilasa", "Pepsina"], correct: 0 },
        { q: "¿Cuál es la derivada de x al cuadrado?", options: ["2x", "x", "x al cubo"], correct: 0 },
        { q: "¿Qué gas compone mayoritariamente la atmósfera terrestre?", options: ["Oxígeno", "Nitrógeno", "Argón"], correct: 1 },
        { q: "¿Cómo se llama la unión entre dos neuronas?", options: ["Sinapsis", "Axón", "Dendrita"], correct: 0 },
        { q: "¿Qué ley rige la conservación de la energía mecánica en sistemas aislados?", options: ["Primera Ley de la Termodinámica", "Principio de Pascal", "Ley de Ohm"], correct: 0 },
        { q: "¿Cuál es el metal más conductor de la electricidad?", options: ["Cobre", "Plata", "Oro"], correct: 1 },
        { q: "¿Qué orgánulo realiza la síntesis de proteínas?", options: ["Ribosoma", "Lisosoma", "Aparato de Golgi"], correct: 0 },
        { q: "¿Cuál es la integral indefinida de 1 sobre x?", options: ["ln|x|", "x", "e^x"], correct: 0 },
        { q: "¿Qué partícula subatómica tiene carga negativa?", options: ["Protón", "Neutrón", "Electrón"], correct: 2 },
        { q: "¿Cómo se llama el punto donde se cruzan las asíntotas de una hipérbola?", options: ["Foco", "Centro", "Vértice"], correct: 1 },
        { q: "¿Qué estudia la termodinámica?", options: ["El calor y el trabajo", "La luz", "Las ondas sonoras"], correct: 0 },
        { q: "¿Cuál es el enlace químico donde se comparten electrones?", options: ["Iónico", "Covalente", "Metálico"], correct: 1 },
        { q: "¿Qué hormona regula los niveles de glucosa en la sangre?", options: ["Insulina", "Adrenalina", "Tiroxina"], correct: 0 },
        { q: "¿Cuál es la velocidad de la luz en el vacío aprox?", options: ["300,000 km/s", "150,000 km/s", "3,000 km/s"], correct: 0 },
        { q: "¿Qué nombre recibe un polígono de 8 lados?", options: ["Hexágono", "Heptágono", "Octágono"], correct: 2 }
    ],
    experto: [
        { q: "¿Cuál es la ecuación de campo de Einstein en relatividad general?", options: ["G_mu_nu = 8pi T_mu_nu", "F = dp/dt", "PV = nRT"], correct: 0 },
        { q: "¿Qué describe el Principio de Incertidumbre de Heisenberg?", options: ["Posición y momento simultáneos", "Entropía universal", "Dualidad onda-partícula"], correct: 0 },
        { q: "¿Cuál es la solución general a la ecuación diferencial y'' + y = 0?", options: ["C1 cos(x) + C2 sen(x)", "C1 e^x", "C1 x^2"], correct: 0 },
        { q: "¿Qué orgánulo celular contiene las enzimas del ciclo de Krebs en eucariotas?", options: ["Matriz mitocondrial", "Citoplasma", "Núcleo"], correct: 0 },
        { q: "¿Cuál es el bosón responsable de otorgar masa a las partículas elementales?", options: ["Bosón de Higgs", "Fotón", "Gluón"], correct: 0 },
        { q: "¿Qué establece la segunda ley de la termodinámica sobre la entropía?", options: ["Siempre aumenta en sistemas aislados", "Permanece constante", "Disminuye"], correct: 0 },
        { q: "¿Cuál es el valor del límite de (1 + 1/n)^n cuando n tiende a infinito?", options: ["e", "Pi", "0"], correct: 0 },
        { q: "¿Qué describe la ecuación de Schrödinger en mecánica cuántica?", options: ["La evolución temporal de la función de onda", "La relatividad del tiempo", "La expansión del universo"], correct: 0 },
        { q: "¿Cómo se llaman los puntos críticos donde la matriz Hessiana es indefinida?", options: ["Puntos de silla", "Máximos locales", "Mínimos absolutos"], correct: 0 },
        { q: "¿Qué enzima transcribe ARN a partir de una plantilla de ADN?", options: ["ARN polimerasa", "ADN ligasa", "Helicasa"], correct: 0 },
        { q: "¿Cuál es la constante de Planck reducida (hbar)?", options: ["h / 2pi", "h * pi", "2h"], correct: 0 },
        { q: "¿Qué fenómeno cuántico explica que partículas estén conectadas a distancia?", options: ["Entrelazamiento cuántico", "Túnel cuántico", "Efecto fotoeléctrico"], correct: 0 },
        { q: "¿Cuál es el teorema que relaciona la integración sobre una frontera con el volumen?", options: ["Teorema de Stokes / Divergencia", "Teorema de Pitágoras", "Teorema del Residuo"], correct: 0 },
        { q: "¿Qué tipo de enlace estabiliza la estructura secundaria del ADN?", options: ["Puentes de hidrógeno", "Enlaces covalentes fuertes", "Fuerzas de Van der Waals"], correct: 0 },
        { q: "¿Cuál es la estructura algebraica que cumple axiomas de grupo, anillo y campo?", options: ["Espacio vectorial / Campo", "Monoides", "Ideales"], correct: 0 },
        { q: "¿Qué describe la constante cosmológica en las ecuaciones de Einstein?", options: ["La energía oscura del vacío", "La masa solar", "La constante gravitacional"], correct: 0 },
        { q: "¿Qué biomolécula cataliza la mayoría de reacciones metabólicas celulares?", options: ["Proteínas (Enzimas)", "Ácidos nucleicos", "Lípidos"], correct: 0 },
        { q: "¿Cuál es la dimensión de un espacio vectorial de matrices cuadradas de 3x3?", options: ["9", "3", "6"], correct: 0 },
        { q: "¿Qué partícula mediadora rige la fuerza nuclear fuerte?", options: ["Gluón", "Bosón W", "Fotón"], correct: 0 },
        { q: "¿Cómo se llama la transformación integral que convierte ecuaciones diferenciales en algebraicas?", options: ["Transformada de Laplace", "Transformada de Fourier", "Transformación lineal"], correct: 0 }
    ]
};

function renderIQTestView() {
    const view = document.getElementById('view-test');
    if (!view) return;
    
    view.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-6">
            <div class="text-center space-y-2">
                <h2 class="text-2xl font-bold text-white">📝 Test de IQ Académico</h2>
                <p class="text-xs text-slate-400">Selecciona el nivel de dificultad para evaluar tus conocimientos.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onclick="startIQTest('principiante'); playSound('click');" class="ultra-glass-panel p-6 rounded-3xl text-center space-y-2 hover:bg-white/15 cursor-pointer transition-all border border-white/10">
                    <span class="text-2xl">🌱</span>
                    <div class="font-bold text-sm text-white">Principiante</div>
                    <div class="text-[10px] text-slate-400">20 preguntas básicas</div>
                </button>
                <button onclick="startIQTest('veterano'); playSound('click');" class="ultra-glass-panel p-6 rounded-3xl text-center space-y-2 hover:bg-white/15 cursor-pointer transition-all border border-white/10">
                    <span class="text-2xl">⚡</span>
                    <div class="font-bold text-sm text-white">Veterano</div>
                    <div class="text-[10px] text-slate-400">20 preguntas intermedias</div>
                </button>
                <button onclick="startIQTest('experto'); playSound('click');" class="ultra-glass-panel p-6 rounded-3xl text-center space-y-2 hover:bg-white/15 cursor-pointer transition-all border border-white/10">
                    <span class="text-2xl">🧠</span>
                    <div class="font-bold text-sm text-white">Experto</div>
                    <div class="text-[10px] text-slate-400">20 preguntas avanzadas</div>
                </button>
            </div>
        </div>
    `;
}

function startIQTest(level) {
    currentTestLevel = level;
    currentTestQuestion = 0;
    testScore = 0;
    showTestQuestion();
}

function showTestQuestion() {
    clearInterval(testTimer);
    const view = document.getElementById('view-test');
    if (!view) return;
    
    const questions = testBanks[currentTestLevel];
    if (currentTestQuestion >= questions.length) {
        view.innerHTML = `
            <div class="max-w-xl mx-auto ultra-glass-panel p-8 rounded-3xl text-center space-y-4">
                <h3 class="text-xl font-bold text-white">🎉 ¡Test de IQ (${currentTestLevel.toUpperCase()}) Finalizado!</h3>
                <p class="text-xs text-slate-300">Has acertado ${testScore} de ${questions.length} preguntas.</p>
                <button onclick="renderIQTestView()" class="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs cursor-pointer">Elegir Otro Nivel</button>
            </div>
        `;
        return;
    }

    timeLeft = 30;
    const item = questions[currentTestQuestion];
    view.innerHTML = `
        <div class="max-w-2xl mx-auto ultra-glass-panel p-8 rounded-3xl space-y-6">
            <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-blue-400">Nivel: ${currentTestLevel.toUpperCase()} | Pregunta ${currentTestQuestion + 1} de ${questions.length}</span>
                <span id="test-timer-badge" class="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold">⏱️ 30s</span>
            </div>
            <h3 class="text-sm font-bold text-white">${item.q}</h3>
            <div class="space-y-2">
                ${item.options.map((opt, idx) => `
                    <button onclick="answerTestQuestion(${idx})" class="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 text-left text-xs text-slate-200 cursor-pointer transition-all">${opt}</button>
                `).join('')}
            </div>
        </div>
    `;

    testTimer = setInterval(() => {
        timeLeft--;
        const badge = document.getElementById('test-timer-badge');
        if (badge) badge.textContent = `⏱️ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(testTimer);
            currentTestQuestion++;
            showTestQuestion();
        }
    }, 1000);
}

function answerTestQuestion(selectedIdx) {
    clearInterval(testTimer);
    const questions = testBanks[currentTestLevel];
    if (selectedIdx === questions[currentTestQuestion].correct) testScore++;
    currentTestQuestion++;
    showTestQuestion();
}

let mediaStream = null;
function openCameraModal() {
    document.getElementById('camera-modal')?.classList.remove('hidden');
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        mediaStream = stream;
        document.getElementById('camera-video').srcObject = stream;
    }).catch(() => alert('No se pudo acceder a la cámara.'));
}

function closeCameraModal() {
    document.getElementById('camera-modal')?.classList.add('hidden');
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
}

function capturePhotoFromCamera() {
    closeCameraModal();
    appendMessage('📷 [Foto capturada desde la cámara web]', 'user');
    setTimeout(() => callGeminiApi("He capturado una foto. Analízala y guíame."), 600);
}