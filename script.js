const colors = [
    { name: 'red', hex: '#ff5e5e' },
    { name: 'blue', hex: '#5e8eff' },
    { name: 'green', hex: '#5eff8e' },
    { name: 'yellow', hex: '#ffea5e' },
    { name: 'purple', hex: '#bd5eff' }
];

let targetColor = null;
let scores = {};
let isGameOver = false;
let gameLoopId = null;

const gameArea = document.getElementById('game-area');
const targetColorName = document.getElementById('target-color-name');
const scoreGrid = document.getElementById('score-grid');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreDiv = document.getElementById('final-score');
const retryBtn = document.getElementById('retry-btn');
const explosion = document.getElementById('explosion');

// Initialize scores and UI
function init() {
    scores = {};
    scoreGrid.innerHTML = ''; // Clear existing scores
    colors.forEach(color => {
        scores[color.name] = 0;
        createScoreItem(color);
    });

    isGameOver = false;
    gameOverOverlay.classList.add('hidden');

    // Clear any existing balloons
    const balloons = document.querySelectorAll('.balloon');
    balloons.forEach(b => b.remove());

    setNewTarget();
    startGameLoop();
}

function createScoreItem(color) {
    const item = document.createElement('div');
    item.className = 'score-item';
    item.innerHTML = `
        <div class="score-bubble" style="--score-color: ${color.hex}">
            <span id="score-${color.name}">0</span>
        </div>
        <span class="score-label">${color.name}</span>
    `;
    scoreGrid.appendChild(item);
}

function setNewTarget() {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    targetColor = randomColor;
    targetColorName.textContent = targetColor.name;
    targetColorName.style.color = targetColor.hex;
    targetColorName.style.textShadow = `0 0 10px ${targetColor.hex}`;
}

function spawnBalloon() {
    if (isGameOver) return;

    const balloon = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];

    balloon.className = 'balloon';
    balloon.style.setProperty('--balloon-color', color.hex);
    balloon.dataset.color = color.name;

    // Random position and speed
    const left = Math.random() * 90; // Keep within 90% width to avoid overflow
    const duration = 4 + Math.random() * 4; // 4-8 seconds

    balloon.style.left = `${left}%`;
    balloon.style.animationDuration = `${duration}s`;

    balloon.addEventListener('click', (e) => handlePop(e, balloon, color));

    // Remove balloon when animation ends
    balloon.addEventListener('animationend', () => {
        if (balloon.parentNode) {
            balloon.remove();
        }
    });

    gameArea.appendChild(balloon);
}

function handlePop(event, balloon, color) {
    if (isGameOver) return;
    event.stopPropagation();

    if (color.name === targetColor.name) {
        // Correct pop!
        balloon.classList.add('popped');
        scores[color.name]++;
        updateScoreDisplay(color.name);
        setNewTarget();

        setTimeout(() => {
            if (balloon.parentNode) balloon.remove();
        }, 200);
    } else {
        // Wrong pop - GAME OVER!
        triggerGameOver(balloon);
    }
}

function triggerGameOver(balloon) {
    isGameOver = true;
    clearInterval(gameLoopId);

    // Trigger explosion at balloon position
    const rect = balloon.getBoundingClientRect();
    explosion.style.left = `${rect.left + rect.width / 2}px`;
    explosion.style.top = `${rect.top + rect.height / 2}px`;
    explosion.classList.remove('hidden');
    explosion.classList.add('active');

    // Remove the balloon immediately
    balloon.remove();

    // Show Game Over screen after a short delay
    setTimeout(() => {
        showGameOverScreen();
        explosion.classList.remove('active');
        explosion.classList.add('hidden');
    }, 600);
}

function showGameOverScreen() {
    // Calculate total score
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    finalScoreDiv.innerHTML = `
        <h3>Total Score: ${totalScore}</h3>
        <div class="final-scores-grid">
            ${colors.map(c => `
                <div class="final-score-item" style="color: ${c.hex}">
                    ${c.name}: ${scores[c.name]}
                </div>
            `).join('')}
        </div>
    `;

    gameOverOverlay.classList.remove('hidden');
}

function updateScoreDisplay(colorName) {
    const scoreElement = document.getElementById(`score-${colorName}`);
    if (scoreElement) {
        scoreElement.textContent = scores[colorName];
        scoreElement.parentElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            scoreElement.parentElement.style.transform = 'scale(1)';
        }, 100);
    }
}

function startGameLoop() {
    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(spawnBalloon, 800);
}

retryBtn.addEventListener('click', init);

// Start the game
init();
