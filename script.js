let options = [];
let isSpinning = false;
let wheelCanvas;
let wheelCtx;
let currentRotation = 0;
let isInlineMode = false;

document.addEventListener('DOMContentLoaded', function() {
    wheelCanvas = document.getElementById('wheel');
    wheelCtx = wheelCanvas.getContext('2d');
    
    // Проверяем, открыто ли как inline-query
    checkInlineMode();
});

function checkInlineMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
        // Это inline-запрос
        isInlineMode = true;
        processInlineQuery(query);
    }
}

function processInlineQuery(query) {
    try {
        // Парсим запрос вида "option1; option2; option3"
        options = query.split(';')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);
        
        if (options.length >= 2) {
            showInlineScreen();
        } else {
            showError("Добавьте хотя бы 2 варианта через точку с запятой");
        }
    } catch (e) {
        showError("Ошибка формата запроса. Используйте: вариант1; вариант2; вариант3");
    }
}

function showInlineScreen() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('inline-result').style.display = 'none';
    document.getElementById('inline-screen').style.display = 'block';
    drawWheel();
}

function showError(message) {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('inline-screen').style.display = 'none';
    document.getElementById('inline-result').style.display = 'block';
    document.getElementById('inline-query').textContent = message;
}

function addInput() {
    const container = document.getElementById('inputs-container');
    const inputCount = container.children.length;
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'option-input';
    newInput.placeholder = `Вариант ${inputCount + 1}`;
    container.appendChild(newInput);
}

function generateInlineQuery() {
    const inputs = document.querySelectorAll('.option-input');
    options = Array.from(inputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');

    if (options.length < 2) {
        alert('Добавьте хотя бы 2 варианта!');
        return;
    }

    const botUsername = 'TestJust4funBot'; // ЗАМЕНИТЕ на username вашего бота!
    const query = options.join('; ');
    const inlineCommand = `@${botUsername} ${query}`;
    
    document.getElementById('inline-query').textContent = inlineCommand;
    document.getElementById('inline-result').style.display = 'block';
    document.getElementById('setup-screen').style.display = 'none';
}

function copyInlineCommand() {
    const command = document.getElementById('inline-query').textContent;
    navigator.clipboard.writeText(command).then(() => {
        alert('Команда скопирована! Вставьте её в чат Telegram');
    }).catch(err => {
        // Fallback для старых браузеров
        const tempInput = document.createElement('input');
        tempInput.value = command;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('Команда скопирована!');
    });
}

// Функции для работы колеса
function drawWheel(rotation = 0) {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = centerX - 8;
    
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    const anglePerOption = (2 * Math.PI) / options.length;
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', '#FB5607', '#8338EC', '#3A86FF'];
    
    wheelCtx.save();
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate(rotation);
    currentRotation = rotation;
    
    options.forEach((option, index) => {
        const startAngle = index * anglePerOption;
        const endAngle = (index + 1) * anglePerOption;
        
        // Рисуем сектор
        wheelCtx.beginPath();
        wheelCtx.moveTo(0, 0);
        wheelCtx.arc(0, 0, radius, startAngle, endAngle);
        wheelCtx.closePath();
        wheelCtx.fillStyle = colors[index % colors.length];
        wheelCtx.fill();
        wheelCtx.strokeStyle = '#fff';
        wheelCtx.lineWidth = 1;
        wheelCtx.stroke();
        
        // Добавляем текст
        wheelCtx.save();
        const textAngle = startAngle + anglePerOption / 2;
        wheelCtx.rotate(textAngle);
        wheelCtx.textAlign = 'right';
        wheelCtx.fillStyle = 'white';
        wheelCtx.font = 'bold 10px Arial';
        
        // Обрезаем длинный текст для inline-режима
        const displayText = option.length > 12 ? option.substring(0, 10) + '...' : option;
        wheelCtx.fillText(displayText, radius - 12, 4);
        wheelCtx.restore();
    });
    
    // Центр колеса
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, 8, 0, 2 * Math.PI);
    wheelCtx.fillStyle = '#fff';
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#007bff';
    wheelCtx.lineWidth = 2;
    wheelCtx.stroke();
    
    wheelCtx.restore();
}

function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    document.getElementById('spin-btn').disabled = true;
    document.getElementById('result').textContent = '';
    
    const spinDuration = 2000 + Math.random() * 1000; // Быстрее для inline
    const extraRotations = 3 + Math.random() * 2; // Меньше оборотов
    const targetRotation = currentRotation + (extraRotations * 2 * Math.PI);
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotationValue = startRotation + ((targetRotation - startRotation) * easeOut);
        
        drawWheel(currentRotationValue);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            finishSpin(currentRotationValue);
        }
    }
    
    animate();
}

function finishSpin(finalRotation) {
    isSpinning = false;
    document.getElementById('spin-btn').disabled = false;
    
    const anglePerOption = (2 * Math.PI) / options.length;
    
    let normalizedRotation = finalRotation % (2 * Math.PI);
    if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
    
    const pointerAngle = -Math.PI / 2;
    let sectorAngleUnderPointer = (pointerAngle - normalizedRotation) % (2 * Math.PI);
    if (sectorAngleUnderPointer < 0) sectorAngleUnderPointer += 2 * Math.PI;
    
    const winningIndex = Math.floor(sectorAngleUnderPointer / anglePerOption) % options.length;
    
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `🎉 <strong>${options[winningIndex]}</strong>`;
    
    // Для inline-режима можно сразу обновлять результат
    if (isInlineMode && typeof Telegram !== 'undefined') {
        updateInlineResult(options[winningIndex]);
    }
}

// Функция для обновления inline-результата (если нужно)
function updateInlineResult(winner) {
    // Эта функция может обновлять результат в inline-режиме
    console.log('Winner:', winner);
}