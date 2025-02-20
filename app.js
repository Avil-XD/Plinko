// Initialize Matter.js with all required modules
const { 
    Engine, Render, World, Bodies, Body, 
    Events, Composite, Common, Vector
} = Matter;

// Audio setup with preloaded sounds
const sounds = {
    bounce: new Howl({ 
        src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], 
        volume: 0.2,
        pool: 5
    }),
    score: new Howl({ 
        src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], 
        volume: 0.4
    }),
    gameOver: new Howl({ 
        src: ['https://assets.mixkit.co/active_storage/sfx/1432/1432-preview.mp3'], 
        volume: 0.4 
    })
};

// Game configuration with optimized physics values
const CONFIG = {
    BALL_RADIUS: 8,
    MAX_BALLS: 5,
    PEG_RADIUS: 3,
    GRAVITY: 0.5,
    AIR_FRICTION: 0.001,
    BOUNCE_STRENGTH: 0.5,
    BALL_DENSITY: 0.02,
    PEG_SPACING: 35,
    MIN_VELOCITY: 0.2,
    INITIAL_DROP_HEIGHT: 50
};

// Game state management
const gameState = {
    score: 0,
    highScore: parseInt(localStorage.getItem('plinkoHighScore')) || 0,
    ballsRemaining: CONFIG.MAX_BALLS,
    isMuted: false,
    isGameOver: false,
    combo: 0,
    lastScoreTime: 0,
    droppedBalls: 0
};

const balls = [];
const multipliers = [2, 3, 5, 10, 5, 3, 2];
const pegRows = 15;
const pegCols = 19;

// Initialize physics engine with optimized settings
const engine = Engine.create({
    enableSleeping: true,
    constraintIterations: 4
});

engine.world.gravity.y = CONFIG.GRAVITY;
engine.timing.timeScale = 1;

// Create renderer with improved visuals
const render = Render.create({
    element: document.getElementById('gameCanvas'),
    engine: engine,
    options: {
        width: window.innerWidth < 1200 ? window.innerWidth - 40 : 1200,
        height: window.innerWidth < 768 ? 500 : 700,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
    }
});

// Error handling wrapper
function handleError(fn, errorMessage) {
    try {
        return fn();
    } catch (error) {
        console.error(`${errorMessage}: `, error);
        return null;
    }
}

// Create game elements
function createBoundaries() {
    const width = render.options.width;
    const height = render.options.height;
    const wallThickness = 20;

    return {
        left: Bodies.rectangle(wallThickness/2, height/2, wallThickness, height, {
            isStatic: true,
            render: {
                fillStyle: '#4834d4',
                strokeStyle: '#686de0',
                lineWidth: 1
            }
        }),
        right: Bodies.rectangle(width - wallThickness/2, height/2, wallThickness, height, {
            isStatic: true,
            render: {
                fillStyle: '#4834d4',
                strokeStyle: '#686de0',
                lineWidth: 1
            }
        }),
        bottom: Bodies.rectangle(width/2, height + 5, width, 10, {
            isStatic: true,
            isSensor: true
        })
    };
}

function createPegs() {
    const pegs = [];
    const width = render.options.width;
    const height = render.options.height;
    const spacing = CONFIG.PEG_SPACING;
    const startX = spacing * 2;
    const startY = spacing * 2;
    const columns = Math.floor((width - startX * 2) / spacing);

    for(let row = 0; row < pegRows; row++) {
        const offset = row % 2 === 0 ? 0 : spacing/2;
        for(let col = 0; col < columns - (row % 2); col++) {
            const x = startX + col * spacing + offset;
            const y = startY + row * spacing;
            
            if(x > 20 && x < width - 20) {
                const peg = Bodies.circle(x, y, CONFIG.PEG_RADIUS, {
                    isStatic: true,
                    restitution: CONFIG.BOUNCE_STRENGTH,
                    friction: 0.1,
                    render: {
                        fillStyle: '#686de0',
                        strokeStyle: '#4834d4',
                        lineWidth: 2
                    },
                    label: 'peg'
                });
                pegs.push(peg);
            }
        }
    }
    return pegs;
}

function createScoringZones() {
    const width = render.options.width;
    const height = render.options.height;
    const zoneWidth = width / multipliers.length;
    const zoneHeight = 60;

    return multipliers.map((mult, i) => {
        const x = zoneWidth * i + zoneWidth/2;
        const hue = (360/multipliers.length * i);
        
        return Bodies.rectangle(x, height - zoneHeight/2, zoneWidth, zoneHeight, {
            isStatic: true,
            isSensor: true,
            render: {
                fillStyle: `hsla(${hue}, 70%, 60%, 0.3)`,
                strokeStyle: `hsla(${hue}, 70%, 60%, 0.8)`,
                lineWidth: 2
            },
            label: `zone-${mult}`
        });
    });
}

// Ball creation with improved physics
function createBall() {
    if(gameState.ballsRemaining <= 0 || gameState.isGameOver) return;
    
    const width = render.options.width;
    const difficulty = parseFloat(document.getElementById('difficulty').value);
    const ball = Bodies.circle(width/2, CONFIG.INITIAL_DROP_HEIGHT, CONFIG.BALL_RADIUS, {
        density: CONFIG.BALL_DENSITY * difficulty,
        restitution: 0.5,
        friction: 0.001,
        frictionAir: CONFIG.AIR_FRICTION * difficulty,
        render: {
            fillStyle: '#ff6b81',
            strokeStyle: '#ff4757',
            lineWidth: 2
        },
        label: 'ball'
    });
    
    Body.setVelocity(ball, { 
        x: (Math.random() - 0.5) * 2, 
        y: 0 
    });
    
    balls.push(ball);
    Composite.add(engine.world, ball);
    gameState.ballsRemaining--;
    gameState.droppedBalls++;
    updateUI();
}

// Enhanced scoring system
function updateScore(multiplier) {
    if(gameState.isGameOver) return;
    
    const now = Date.now();
    if(now - gameState.lastScoreTime < 1500) {
        gameState.combo++;
    } else {
        gameState.combo = 1;
    }
    gameState.lastScoreTime = now;
    
    const baseScore = Math.floor(100 * multiplier);
    const comboBonus = gameState.combo > 1 ? gameState.combo * 50 : 0;
    const totalScore = baseScore + comboBonus;
    
    gameState.score += totalScore;
    gameState.highScore = Math.max(gameState.score, gameState.highScore);
    localStorage.setItem('plinkoHighScore', gameState.highScore.toString());
    
    if(!gameState.isMuted) {
        sounds.score.rate(1 + Math.min(gameState.combo * 0.1, 0.5));
        sounds.score.play();
    }
    
    showScorePopup(totalScore, multiplier, gameState.combo);
    createParticleEffect({ 
        x: balls[balls.length - 1].position.x, 
        y: balls[balls.length - 1].position.y 
    });
    updateUI();
}

// Visual feedback with enhanced score display
function showScorePopup(points, multiplier, combo) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.innerHTML = `
        <div>${points} pts</div>
        ${combo > 1 ? `<div class="combo">x${combo} COMBO!</div>` : ''}
        <div class="multiplier">${multiplier}x</div>
    `;
    
    const gameCanvas = document.getElementById('gameCanvas');
    const ball = balls[balls.length - 1];
    
    if (ball && gameCanvas) {
        popup.style.left = `${ball.position.x}px`;
        popup.style.top = `${ball.position.y - 30}px`;
        gameCanvas.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }
}

function createParticleEffect(position) {
    const colors = ['#ff6b81', '#ff4757', '#686de0', '#4834d4'];
    const numParticles = 12;
    const angleStep = (2 * Math.PI) / numParticles;
    
    for(let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${position.x}px`;
        particle.style.top = `${position.y}px`;
        particle.style.transform = `rotate(${i * angleStep}rad)`;
        document.getElementById('gameCanvas').appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function updateUI() {
    handleError(() => {
        document.getElementById('score').textContent = gameState.score;
        document.getElementById('highscore').textContent = gameState.highScore;
        document.getElementById('ballCount').textContent = gameState.ballsRemaining;
        document.getElementById('combo').textContent = `x${gameState.combo}`;
        
        if(gameState.ballsRemaining <= 0 && balls.length === 0 && gameState.droppedBalls > 0) {
            endGame();
        }
    }, 'Error updating UI');
}

function endGame() {
    if(!gameState.isGameOver) {
        gameState.isGameOver = true;
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('finalHighScore').textContent = gameState.highScore;
        if(!gameState.isMuted) sounds.gameOver.play();
        
        createParticleEffect({ 
            x: render.options.width/2, 
            y: render.options.height/2 
        });
    }
}

function resetGame() {
    gameState.score = 0;
    gameState.ballsRemaining = CONFIG.MAX_BALLS;
    gameState.isGameOver = false;
    gameState.combo = 0;
    gameState.lastScoreTime = 0;
    gameState.droppedBalls = 0;
    
    balls.forEach(ball => Composite.remove(engine.world, ball));
    balls.length = 0;
    
    document.getElementById('gameOver').classList.add('hidden');
    updateUI();
}

// Modal handling
function toggleRulesModal(show) {
    const modal = document.getElementById('rules');
    modal.classList.toggle('hidden', !show);
    gameState.isModalOpen = show;
}

// Initialize game
function initGame() {
    // Clear any existing world
    World.clear(engine.world);
    
    // Create new game elements
    const boundaries = createBoundaries();
    const pegs = createPegs();
    const scoringZones = createScoringZones();
    
    // Add all elements to world
    Composite.add(engine.world, [
        ...Object.values(boundaries),
        ...pegs,
        ...scoringZones
    ]);
    
    // Collision handling
    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach(pair => {
            // Get both bodies involved in collision
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            
            // Handle peg collisions for sound
            if(!gameState.isMuted && (bodyA.label === 'peg' || bodyB.label === 'peg')) {
                sounds.bounce.rate(0.8 + Math.random() * 0.4);
                sounds.bounce.play();
            }
            
            // Handle scoring zone collisions
            if(bodyA.label === 'ball' && bodyB.label?.includes('zone')) {
                const multiplier = parseFloat(bodyB.label.split('-')[1]);
                updateScore(multiplier);
            } else if(bodyB.label === 'ball' && bodyA.label?.includes('zone')) {
                const multiplier = parseFloat(bodyA.label.split('-')[1]);
                updateScore(multiplier);
            }
        });
    });
}

// Event listeners
document.getElementById('dropBtn').addEventListener('click', createBall);
document.getElementById('muteBtn').addEventListener('click', () => {
    gameState.isMuted = !gameState.isMuted;
    document.getElementById('muteBtn').textContent = gameState.isMuted ? '🔇' : '🔊';
});
document.getElementById('restartBtn').addEventListener('click', resetGame);
document.getElementById('playAgainBtn').addEventListener('click', resetGame);
document.getElementById('rulesBtn').addEventListener('click', () => toggleRulesModal(true));
document.querySelector('#rules .close-btn').addEventListener('click', () => toggleRulesModal(false));

// Mobile support
document.addEventListener('touchstart', (e) => {
    if(e.target.matches('#dropBtn, #muteBtn, #restartBtn, #playAgainBtn, #rulesBtn, .close-btn')) {
        e.preventDefault();
        e.target.click();
    }
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && gameState.isModalOpen) {
        toggleRulesModal(false);
    } else if(e.code === 'Space' && !gameState.isModalOpen) {
        e.preventDefault();
        createBall();
    }
});

// Performance optimization
setInterval(() => {
    balls.forEach((ball, index) => {
        if(ball.position.y > render.options.height + 50 || 
           (Math.abs(ball.velocity.x) < CONFIG.MIN_VELOCITY && 
            Math.abs(ball.velocity.y) < CONFIG.MIN_VELOCITY)) {
            Composite.remove(engine.world, ball);
            balls.splice(index, 1);
            updateUI();
        }
    });
}, 1000);

// Window resize handling
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth < 1200 ? window.innerWidth - 40 : 1200;
    render.canvas.height = window.innerWidth < 768 ? 500 : 700;
    Render.setPixelRatio(render, window.devicePixelRatio);
    
    // Reinitialize game with new dimensions
    initGame();
});

// Start the game
initGame();
Engine.run(engine);
Render.run(render);

// Initial UI update
updateUI();