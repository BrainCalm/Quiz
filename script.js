// script.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
        wheelCtx.stroke();
        
        // Добавляем текст
        wheelCtx.save();
        wheelCtx.rotate(startAngle + anglePerOption / 2);
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
    const extraRotations = 5 + Math.random() * 3; // 5-8 дополнительных оборотов
    const targetRotation = currentRotation + (extraRotations * 2 * Math.PI);
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Easing function для smooth-анимации
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
    
    // ПРАВИЛЬНЫЙ расчет выигрышного сектора
    const anglePerOption = (2 * Math.PI) / options.length;
    
    // Нормализуем угол (приводим к диапазону 0 - 2π)
    let normalizedAngle = finalRotation % (2 * Math.PI);
    if (normalizedAngle < 0) {
        normalizedAngle += 2 * Math.PI;
    }
    
    // Учитываем, что указатель находится вверху (угол 0)
    // Вычитаем π/2 потому что 0 радиан = справа, а нам нужно чтобы 0 был вверху
    let pointerAngle = (2 * Math.PI - normalizedAngle + Math.PI/2) % (2 * Math.PI);
    
    // Определяем индекс выигрышного сектора
    const winningIndex = Math.floor(pointerAngle / anglePerOption) % options.length;
    
    const resultElement = document.getElementById('result');
    resultElement.textContent = `🎉 Выпало: ${options[winningIndex]}`;
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
    // Временно изменяем цвет выигрышного сектора
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
    wheelCtx.fillStyle = 'rgba(255, 215, 0, 0.3)'; // Золотая подсветка
    wheelCtx.fill();
    
    wheelCtx.restore();
    
    // Через 2 секунды убираем подсветку
    setTimeout(() => {
        drawWheel(currentRotation);
    }, 2000);
}