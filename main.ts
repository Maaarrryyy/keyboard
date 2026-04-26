interface GameState {
    currentText: string;
    cursorIndex: number;
    errorsCount: number;
    startTime: number | null;
    timerInterval: number | null;
}

const TEXTS = [
    { id: 1, text: 'Want to know how to improve your typing speed? The first step to learning to type fast is to take a timed typing test.' },
    { id: 2, text: 'Our 1-minute, 3-minute, and 5-minute timed typing speed tests are free and can be used by children or adults.' },
    { id: 3, text: 'Touch typing means you are able to type with all 10 fingers instead of using a hunt and peck method of typing.' }
];

// Используем приведение типов (Type Casting), чтобы избежать ошибок 'possibly null'
const elements = {
    timer: document.getElementById('timer') as HTMLElement,
    btn: document.getElementById('btn') as HTMLButtonElement,
    display: document.getElementById('display') as HTMLDivElement,
    input: document.getElementById('input') as HTMLInputElement,
    wpm: document.getElementById('wpm') as HTMLElement,
    acc: document.getElementById('acc') as HTMLElement,
    statsSection: document.querySelector('section.hidden') as HTMLElement,
};

const state: GameState = {
    currentText: '',
    cursorIndex: 0,
    errorsCount: 0,
    startTime: null,
    timerInterval: null,
};

// --- ЛОГИКА ТАЙМЕРА ---

function startTimer(): void {
    if (state.timerInterval) return; // Защита от повторного запуска

    state.startTime = Date.now();
    state.timerInterval = window.setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - (state.startTime || now)) / 1000);
        
        const mins = Math.floor(diff / 60).toString().padStart(2, '0');
        const secs = (diff % 60).toString().padStart(2, '0');
        
        if (elements.timer) {
            elements.timer.textContent = `${mins}:${secs}`;
        }
    }, 1000);
}

function stopTimer(): void {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

// --- ОСНОВНЫЕ ФУНКЦИИ ---

function calculateStats(): void {
    if (!state.startTime) return;

    const endTime = Date.now();
    const durationMinutes = (endTime - state.startTime) / 1000 / 60;
    
    // Стандарт WPM: 5 нажатий = 1 слово
    const wpm = Math.round((state.cursorIndex / 5) / (durationMinutes || 1));
    const accuracy = state.cursorIndex > 0 
        ? Math.round(((state.cursorIndex - state.errorsCount) / state.cursorIndex) * 100) 
        : 0;

    if (elements.wpm) elements.wpm.textContent = wpm.toString();
    if (elements.acc) elements.acc.textContent = `${accuracy}%`;
    if (elements.statsSection) elements.statsSection.classList.remove('hidden');
}

function render(text: string): void {
    if (!elements.display || !elements.input) return;

    // Сброс UI и Состояния
    elements.display.innerHTML = '';
    state.currentText = text;
    state.cursorIndex = 0;
    state.errorsCount = 0;
    state.startTime = null;
    stopTimer();
    
    if (elements.timer) elements.timer.textContent = '00:00';
    if (elements.statsSection) elements.statsSection.classList.add('hidden');

    // Создание спанов для каждой буквы
    text.split('').forEach((char) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'text-zinc-300 transition-colors duration-75';
        elements.display.appendChild(span);
    });

    // Фокус и очистка ввода
    elements.input.value = '';
    elements.input.focus();
}

function handleInput(): void {
    if (!elements.input || !elements.display) return;

    const val = elements.input.value;
    if (!val) return;

    const charTyped = val[val.length - 1];
    const spans = elements.display.querySelectorAll('span');
    const targetChar = state.currentText[state.cursorIndex];
    const currentSpan = spans[state.cursorIndex];

    // Если символы закончились или спан не найден — выходим
    if (!targetChar || !currentSpan) return;

    // Старт таймера при первом нажатии
    if (state.startTime === null) {
        startTimer();
    }

    // Проверка правильности
    if (charTyped === targetChar) {
        currentSpan.classList.replace('text-zinc-300', 'text-green-500');
    } else {
        currentSpan.classList.replace('text-zinc-300', 'text-red-500');
        state.errorsCount++;
    }

    state.cursorIndex++;
    elements.input.value = ''; // Очищаем для следующего символа

    // Проверка финиша
    if (state.cursorIndex === state.currentText.length) {
        stopTimer();
        calculateStats();
    }
}

// --- ИНИЦИАЛИЗАЦИЯ И СОБЫТИЯ ---

if (elements.btn) {
    elements.btn.addEventListener('click', () => {
        const randomObj = TEXTS[Math.floor(Math.random() * TEXTS.length)];
        // Проверка undefined для безопасности (ts 2532 fix)
        if (randomObj) {
            render(randomObj.text);
        }
    });
}

if (elements.input) {
    elements.input.addEventListener('input', handleInput);
}

// UX: возвращаем фокус при клике на зону текста
if (elements.display) {
    elements.display.addEventListener('click', () => elements.input.focus());
}
