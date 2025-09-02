// script.js - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ ВЕРХНЕГО УКАЗАТЕЛЯ
let options = [];
let isSpinning = false;
let wheelCanvas;
let wheelCtx;
let currentRotation = 0;

document.addEventListener('DOMContentLoaded', function() {
    wheelCanvas = document.getElementById('wheel');
    wheelCtx = wheelCanvas.getContext('2d');
    if (typeof Telegram !== 'undefined') {
        Telegram.WebApp.ready();
    }
});

function addInput() {
    const container = document.getElementById('inputs-container');
    const inputCount = container.children.length;
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'option-input';
    newInput.placeholder = `Вариант ${inputCount + 1}`;
    container.appendChild(newInput);
}

function startGame() {
    const inputs = document.querySelectorAll('.option-input');
    options = Array.from(inputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');

    if (options.length < 2) {
        alert('Добавьте хотя бы 2 варианта!');
        return;
    }

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    drawWheel();
}

function drawWheel(rotation = 0) {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = centerX - 10;
    
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
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();
        
        // Добавляем текст (повернутый правильно)
        wheelCtx.save();
        const textAngle = startAngle + anglePerOption / 2;
        wheelCtx.rotate(textAngle);
        wheelCtx.textAlign = 'right';
        wheelCtx.fillStyle = 'white';
        wheelCtx.font = 'bold 12px Arial';
        wheelCtx.fillText(option, radius - 15, 5);
        wheelCtx.restore();
    });
    
    // Рисуем центр колеса
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, 10, 0, 2 * Math.PI);
    wheelCtx.fillStyle = '#fff';
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#007bff';
    wheelCtx.lineWidth = 3;
    wheelCtx.stroke();
    
    wheelCtx.restore();
}

function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    document.getElementById('spin-btn').disabled = true;
    document.getElementById('result').textContent = '';
    
    const spinDuration = 3000 + Math.random() * 2000;
    const extraRotations = 5 + Math.random() * 3;
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
    
    // ПРАВИЛЬНЫЙ РАСЧЕТ ДЛЯ ВЕРХНЕГО УКАЗАТЕЛЯ
    // Нормализуем угол вращения
    let normalizedRotation = finalRotation % (2 * Math.PI);
    if (normalizedRotation < 0) {
        normalizedRotation += 2 * Math.PI;
    }
    
    // Указатель находится вверху (угол -π/2 в системе координат canvas)
    // Но поскольку мы вращаем все колесо, нам нужно найти какой сектор сейчас под указателем
    const pointerAngle = -Math.PI / 2; // Указатель смотрит вверх (-90 градусов)
    
    // Вычисляем угол сектора под указателем
    let sectorAngleUnderPointer = (pointerAngle - normalizedRotation) % (2 * Math.PI);
    if (sectorAngleUnderPointer < 0) {
        sectorAngleUnderPointer += 2 * Math.PI;
    }
    
    // Определяем индекс выигрышного сектора
    const winningIndex = Math.floor(sectorAngleUnderPointer / anglePerOption) % options.length;
    
    const resultElement = document.getElementById('result');
    resultElement.textContent = `🎉 Делать будет: ${options[winningIndex]}`;
    resultElement.style.color = '#ff4757';
    
    // Анимация результата
    resultElement.style.opacity = '0';
    resultElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        resultElement.style.transition = 'all 0.5s ease';
        resultElement.style.opacity = '1';
        resultElement.style.transform = 'translateY(0)';
    }, 100);
    
    // Подсвечиваем выигрышный сектор
    highlightWinningSector(winningIndex);
}

function highlightWinningSector(index) {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = centerX - 10;
    const anglePerOption = (2 * Math.PI) / options.length;
    
    wheelCtx.save();
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate(currentRotation);
    
    const startAngle = index * anglePerOption;
    const endAngle = (index + 1) * anglePerOption;
    
    // Рисуем подсветку
    wheelCtx.beginPath();
    wheelCtx.moveTo(0, 0);
    wheelCtx.arc(0, 0, radius, startAngle, endAngle);
    wheelCtx.closePath();
    wheelCtx.fillStyle = 'rgba(255, 215, 0, 0.4)';
    wheelCtx.fill();
    
    wheelCtx.restore();
    
    setTimeout(() => {
        drawWheel(currentRotation);
    }, 2000);
}

// Дебаг функция для проверки (можно удалить после тестов)
function debugSector() {
    const anglePerOption = (2 * Math.PI) / options.length;
    console.log('Текущее вращение:', currentRotation);
    console.log('Угол на сектор:', anglePerOption);
    console.log('Варианты:', options);
}