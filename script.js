let options = [];
let isSpinning = false;
let wheelCanvas;
let wheelCtx;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    wheelCanvas = document.getElementById('wheel');
    wheelCtx = wheelCanvas.getContext('2d');
    Telegram.WebApp.ready();
});

// Добавление поля для ввода
function addInput() {
    const container = document.getElementById('inputs-container');
    const inputCount = container.children.length;
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'option-input';
    newInput.placeholder = `Вариант ${inputCount + 1}`;
    container.appendChild(newInput);
}

// Начало игры
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

// Отрисовка колеса
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
        wheelCtx.font = '12px Arial';
        wheelCtx.fillText(option, radius - 10, 5);
        wheelCtx.restore();
    });
    
    wheelCtx.restore();
}

// Вращение колеса
function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    document.getElementById('spin-btn').disabled = true;
    document.getElementById('result').textContent = '';
    
    const spinDuration = 3000 + Math.random() * 2000;
    const targetRotation = 5 * Math.PI + Math.random() * 2 * Math.PI;
    const startTime = Date.now();
    const startRotation = 0;
    
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Easing function для smooth-анимации
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation = startRotation + (targetRotation * easeOut);
        
        drawWheel(currentRotation);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            finishSpin(currentRotation);
        }
    }
    
    animate();
}

// Завершение вращения
function finishSpin(finalRotation) {
    isSpinning = false;
    document.getElementById('spin-btn').disabled = false;
    
    // Определяем выигрышный сектор
    const normalizedRotation = finalRotation % (2 * Math.PI);
    const anglePerOption = (2 * Math.PI) / options.length;
    const winningIndex = Math.floor((2 * Math.PI - normalizedRotation) / anglePerOption) % options.length;
    
    const resultElement = document.getElementById('result');
    resultElement.textContent = `Делать будет: ${options[winningIndex]}`;
    resultElement.style.color = '#ff4757';
    
    // Анимация результата
    resultElement.style.opacity = '0';
    resultElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        resultElement.style.transition = 'all 0.5s ease';
        resultElement.style.opacity = '1';
        resultElement.style.transform = 'translateY(0)';
    }, 100);
}