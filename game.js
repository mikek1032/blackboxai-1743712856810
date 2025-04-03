// Game State
const gameState = {
    score: 0,
    timeLeft: 60,
    gameActive: false,
    rocket: {
        x: 0,
        y: 0,
        speed: 8,
        width: 60,
        height: 100
    },
    astronauts: [],
    asteroids: [],
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    }
};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const rocket = document.getElementById('rocket');
const astronautsSavedDisplay = document.getElementById('astronauts-saved');
const timeLeftDisplay = document.getElementById('time-left');
const resultMessage = document.getElementById('result-message');
const finalScore = document.getElementById('final-score');

// Initialize Game
function initGame() {
    // Set rocket starting position
    gameState.rocket.x = window.innerWidth / 2 - gameState.rocket.width / 2;
    gameState.rocket.y = window.innerHeight - gameState.rocket.height - 20;
    updateRocketPosition();

    // Create stars
    createStars(100);

    // Start game loop
    gameState.gameActive = true;
    gameLoop();
    astronautSpawner();
    asteroidSpawner();
    startTimer();
}

// Game Loop
function gameLoop() {
    if (!gameState.gameActive) return;

    // Move rocket based on key presses
    if (gameState.keys.ArrowUp && gameState.rocket.y > 0) {
        gameState.rocket.y -= gameState.rocket.speed;
    }
    if (gameState.keys.ArrowDown && gameState.rocket.y < window.innerHeight - gameState.rocket.height) {
        gameState.rocket.y += gameState.rocket.speed;
    }
    if (gameState.keys.ArrowLeft && gameState.rocket.x > 0) {
        gameState.rocket.x -= gameState.rocket.speed;
    }
    if (gameState.keys.ArrowRight && gameState.rocket.x < window.innerWidth - gameState.rocket.width) {
        gameState.rocket.x += gameState.rocket.speed;
    }

    updateRocketPosition();
    moveAstronauts();
    moveAsteroids();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// Helper Functions
function updateRocketPosition() {
    rocket.style.left = `${gameState.rocket.x}px`;
    rocket.style.top = `${gameState.rocket.y}px`;
}

function createStars(count) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        gameContainer.appendChild(star);
    }
}

function astronautSpawner() {
    if (!gameState.gameActive) return;

    if (gameState.astronauts.length < 5) {
        const astronaut = document.createElement('div');
        astronaut.className = 'astronaut';
        const x = Math.random() * (window.innerWidth - 40);
        const y = Math.random() * (window.innerHeight / 2);
        astronaut.style.left = `${x}px`;
        astronaut.style.top = `${y}px`;
        astronaut.dataset.x = x;
        astronaut.dataset.y = y;
        astronaut.dataset.speed = 1 + Math.random() * 2;
        gameContainer.appendChild(astronaut);
        gameState.astronauts.push(astronaut);
    }

    setTimeout(astronautSpawner, 3000);
}

function moveAstronauts() {
    gameState.astronauts.forEach(astronaut => {
        let y = parseFloat(astronaut.dataset.y);
        y += parseFloat(astronaut.dataset.speed);
        astronaut.dataset.y = y;
        astronaut.style.top = `${y}px`;

        // Remove if off screen
        if (y > window.innerHeight) {
            astronaut.remove();
            gameState.astronauts = gameState.astronauts.filter(a => a !== astronaut);
        }
    });
}

function asteroidSpawner() {
    if (!gameState.gameActive) return;

    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';
    const side = Math.random() > 0.5 ? 'top' : 'left';
    let x, y;

    if (side === 'top') {
        x = Math.random() * window.innerWidth;
        y = -50;
    } else {
        x = -50;
        y = Math.random() * window.innerHeight;
    }

    asteroid.style.left = `${x}px`;
    asteroid.style.top = `${y}px`;
    asteroid.dataset.x = x;
    asteroid.dataset.y = y;
    asteroid.dataset.speedX = (Math.random() - 0.5) * 4;
    asteroid.dataset.speedY = 2 + Math.random() * 3;
    gameContainer.appendChild(asteroid);
    gameState.asteroids.push(asteroid);

    setTimeout(asteroidSpawner, 1000 + Math.random() * 2000);
}

function moveAsteroids() {
    gameState.asteroids.forEach(asteroid => {
        let x = parseFloat(asteroid.dataset.x);
        let y = parseFloat(asteroid.dataset.y);
        x += parseFloat(asteroid.dataset.speedX);
        y += parseFloat(asteroid.dataset.speedY);
        asteroid.dataset.x = x;
        asteroid.dataset.y = y;
        asteroid.style.left = `${x}px`;
        asteroid.style.top = `${y}px`;

        // Remove if off screen
        if (y > window.innerHeight || x > window.innerWidth || x < -50) {
            asteroid.remove();
            gameState.asteroids = gameState.asteroids.filter(a => a !== asteroid);
        }
    });
}

function checkCollisions() {
    // Rocket-Astronaut collisions
    gameState.astronauts.forEach(astronaut => {
        const aRect = astronaut.getBoundingClientRect();
        const rRect = rocket.getBoundingClientRect();

        if (
            aRect.left < rRect.right &&
            aRect.right > rRect.left &&
            aRect.top < rRect.bottom &&
            aRect.bottom > rRect.top
        ) {
            // Rescue astronaut
            astronaut.remove();
            gameState.astronauts = gameState.astronauts.filter(a => a !== astronaut);
            gameState.score++;
            astronautsSavedDisplay.textContent = gameState.score;

            // Check win condition
            if (gameState.score >= 5) {
                endGame(true);
            }
        }
    });

    // Rocket-Asteroid collisions
    gameState.asteroids.forEach(asteroid => {
        const aRect = asteroid.getBoundingClientRect();
        const rRect = rocket.getBoundingClientRect();

        if (
            aRect.left < rRect.right &&
            aRect.right > rRect.left &&
            aRect.top < rRect.bottom &&
            aRect.bottom > rRect.top
        ) {
            // Collision with asteroid
            endGame(false);
        }
    });
}

function startTimer() {
    const timer = setInterval(() => {
        gameState.timeLeft--;
        timeLeftDisplay.textContent = gameState.timeLeft;

        if (gameState.timeLeft <= 0) {
            clearInterval(timer);
            endGame(false);
        }
    }, 1000);
}

function endGame(win) {
    gameState.gameActive = false;
    gameContainer.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');

    if (win) {
        resultMessage.textContent = "MISSION ACCOMPLISHED!";
        resultMessage.className = "text-4xl font-bold mb-6 text-green-400";
    } else {
        resultMessage.textContent = "MISSION FAILED";
        resultMessage.className = "text-4xl font-bold mb-6 text-red-400";
    }

    finalScore.textContent = `Astronauts Rescued: ${gameState.score}/5`;
}

// Event Listeners
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    initGame();
});

restartBtn.addEventListener('click', () => {
    // Reset game state
    gameState.score = 0;
    gameState.timeLeft = 60;
    gameState.astronauts = [];
    gameState.asteroids = [];
    astronautsSavedDisplay.textContent = '0';
    timeLeftDisplay.textContent = '60';

    // Clear game elements
    document.querySelectorAll('.astronaut, .asteroid').forEach(el => el.remove());

    // Show start screen
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        gameState.keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        gameState.keys[e.key] = false;
    }
});