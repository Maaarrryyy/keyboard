var TEXTS = [
    { id: 1, text: 'Want to know how to improve your typing speed? The first step to learning to type fast is to take a timed typing test.' },
    { id: 2, text: 'Our 1-minute, 3-minute, and 5-minute timed typing speed tests are free and can be used by children or adults.' },
    { id: 3, text: 'Touch typing means you are able to type with all 10 fingers instead of using a hunt and peck method of typing.' }
];
// Используем приведение типов (Type Casting), чтобы избежать ошибок 'possibly null'
var elements = {
    timer: document.getElementById('timer'),
    btn: document.getElementById('btn'),
    display: document.getElementById('display'),
    input: document.getElementById('input'),
    wpm: document.getElementById('wpm'),
    acc: document.getElementById('acc'),
    statsSection: document.querySelector('section.hidden'),
};
var state = {
    currentText: '',
    cursorIndex: 0,
    errorsCount: 0,
    startTime: null,
    timerInterval: null,
};
// --- ЛОГИКА ТАЙМЕРА ---
function startTimer() {
    if (state.timerInterval)
        return; // Защита от повторного запуска
    state.startTime = Date.now();
    state.timerInterval = window.setInterval(function () {
        var now = Date.now();
        var diff = Math.floor((now - (state.startTime || now)) / 1000);
        var mins = Math.floor(diff / 60).toString().padStart(2, '0');
        var secs = (diff % 60).toString().padStart(2, '0');
        if (elements.timer) {
            elements.timer.textContent = "".concat(mins, ":").concat(secs);
        }
    }, 1000);
}
function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}
// --- ОСНОВНЫЕ ФУНКЦИИ ---
function calculateStats() {
    if (!state.startTime)
        return;
    var endTime = Date.now();
    var durationMinutes = (endTime - state.startTime) / 1000 / 60;
    // Стандарт WPM: 5 нажатий = 1 слово
    var wpm = Math.round((state.cursorIndex / 5) / (durationMinutes || 1));
    var accuracy = state.cursorIndex > 0
        ? Math.round(((state.cursorIndex - state.errorsCount) / state.cursorIndex) * 100)
        : 0;
    if (elements.wpm)
        elements.wpm.textContent = wpm.toString();
    if (elements.acc)
        elements.acc.textContent = "".concat(accuracy, "%");
    if (elements.statsSection)
        elements.statsSection.classList.remove('hidden');
}
function render(text) {
    if (!elements.display || !elements.input)
        return;
    // Сброс UI и Состояния
    elements.display.innerHTML = '';
    state.currentText = text;
    state.cursorIndex = 0;
    state.errorsCount = 0;
    state.startTime = null;
    stopTimer();
    if (elements.timer)
        elements.timer.textContent = '00:00';
    if (elements.statsSection)
        elements.statsSection.classList.add('hidden');
    // Создание спанов для каждой буквы
    text.split('').forEach(function (char) {
        var span = document.createElement('span');
        span.textContent = char;
        span.className = 'text-zinc-300 transition-colors duration-75';
        elements.display.appendChild(span);
    });
    // Фокус и очистка ввода
    elements.input.value = '';
    elements.input.focus();
}
function handleInput() {
    if (!elements.input || !elements.display)
        return;
    var val = elements.input.value;
    if (!val)
        return;
    var charTyped = val[val.length - 1];
    var spans = elements.display.querySelectorAll('span');
    var targetChar = state.currentText[state.cursorIndex];
    var currentSpan = spans[state.cursorIndex];
    // Если символы закончились или спан не найден — выходим
    if (!targetChar || !currentSpan)
        return;
    // Старт таймера при первом нажатии
    if (state.startTime === null) {
        startTimer();
    }
    // Проверка правильности
    if (charTyped === targetChar) {
        currentSpan.classList.replace('text-zinc-300', 'text-green-500');
    }
    else {
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
    elements.btn.addEventListener('click', function () {
        var randomObj = TEXTS[Math.floor(Math.random() * TEXTS.length)];
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
    elements.display.addEventListener('click', function () { return elements.input.focus(); });
}
