// Matter.js physics engine setup
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;

// Game variables
let divisons = [];
let divisonsHeight = 300;
let particles = [];
let plinkos = [];
let currentColor = '#FF5722';
let particlesCreated = 0;
let world, engine, ground;

// Game state
let score = 0;
let highScore = localStorage.getItem('plinkoHighScore') || 0;
let isAutoDropping = false;
let gameSpeed = 1;
let soundEnabled = true;
let glowEnabled = true;

// DOM elements
let particleCountEl, fpsEl, scoreEl, highScoreEl;

function preload() {
}

function setup() {
  // Create container elements if they don't exist
  if (!document.querySelector('main')) {
    const main = document.createElement('main');
    document.body.appendChild(main);
  }
  if (!document.getElementById('simulation-container')) {
    const simContainer = document.createElement('div');
    simContainer.id = 'simulation-container';
    document.querySelector('main').appendChild(simContainer);
  }

  // Setup canvas
  const canvasWidth = Math.min(windowWidth - 40, 800);
  const canvasHeight = Math.min(windowHeight * 0.7, 700);
  
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('simulation-container');
  canvas.attribute('aria-label', 'Plinko board simulation');
  canvas.mousePressed(handleCanvasClick);
  
  // Initialize physics
  engine = Engine.create();
  world = engine.world;
  engine.world.gravity.y = 1;
  
  // Create game elements
  ground = new Ground(width/2, height-10, width, 20);
  initializeGame();

  // Add event listeners for controls
  setupEventListeners();

  Engine.run(engine);
  frameRate(60);
}

function initializeGame() {
  // Initialize divisions
  for (let i = 0; i <= width; i += 80) {
    divisons.push(new Division(i, height-divisonsHeight/2, 10, divisonsHeight));
  }

  // Initialize plinkos
  initializePlinkos();

  // Initialize score zones
  setupScoreZones();
}

function setupScoreZones() {
  const zoneWidth = width / 8;
  scoreZones = [100, 50, 25, 10, 10, 25, 50, 100].map((points, i) => ({
    x: i * zoneWidth,
    width: zoneWidth,
    points: points
  }));
}

function setupEventListeners() {
  // Controls
  const resetBtn = document.getElementById('reset-btn');
  const colorBtn = document.getElementById('color-btn');
  const autoBtn = document.getElementById('auto-btn');
  const soundToggle = document.getElementById('sound-toggle');
  const glowToggle = document.getElementById('glow-toggle');
  const speedSlider = document.getElementById('game-speed');

  if (resetBtn) resetBtn.addEventListener('click', resetSimulation);
  if (colorBtn) colorBtn.addEventListener('click', changeParticleColor);
  if (autoBtn) autoBtn.addEventListener('click', toggleAutoDrop);
  if (soundToggle) soundToggle.addEventListener('change', e => soundEnabled = e.target.checked);
  if (glowToggle) glowToggle.addEventListener('change', e => glowEnabled = e.target.checked);
  if (speedSlider) speedSlider.addEventListener('input', e => {
    gameSpeed = parseFloat(e.target.value);
    engine.timing.timeScale = gameSpeed;
  });

  // Stats elements
  scoreEl = document.getElementById('current-score');
  highScoreEl = document.getElementById('high-score');
  particleCountEl = document.getElementById('particle-count');
  fpsEl = document.getElementById('fps');

  // Update high score display
  if (highScoreEl) highScoreEl.textContent = highScore;
}

function handleCanvasClick(event) {
  const rect = canvas.elt.getBoundingClientRect();
  const x = event.clientX - rect.left;
  createParticle(x, 10);
}

function createParticle(x, y) {
  if (particles.length >= 50) return;
  
  const particle = new Particle(x, y, 8, currentColor);
  particles.push(particle);
  particlesCreated++;
}

function updateScore(points) {
  score += points;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('plinkoHighScore', highScore);
    if (highScoreEl) highScoreEl.textContent = highScore;
  }
  if (scoreEl) scoreEl.textContent = score;
}

function toggleAutoDrop() {
  isAutoDropping = !isAutoDropping;
  const autoBtn = document.getElementById('auto-btn');
  if (autoBtn) {
    autoBtn.classList.toggle('active');
    autoBtn.textContent = isAutoDropping ? 'Stop Auto' : 'Auto Drop';
  }
}

function windowResized() {
  const canvasWidth = Math.min(windowWidth - 40, 800);
  const canvasHeight = Math.min(windowHeight * 0.7, 700);
  resizeCanvas(canvasWidth, canvasHeight);
  
  // Recreate game elements for new size
  divisons = [];
  plinkos = [];
  initializeGame();
}

function initializePlinkos() {
  for (let j = 75; j <= width; j += 50) plinkos.push(new Plinko(j, 75));
  for (let j = 50; j <= width-10; j += 50) plinkos.push(new Plinko(j, 175));
  for (let j = 75; j <= width; j += 50) plinkos.push(new Plinko(j, 275));
  for (let j = 50; j <= width-10; j += 50) plinkos.push(new Plinko(j, 375));
}

function resetSimulation() {
  particles.forEach(p => World.remove(world, p.body));
  particles = [];
  particlesCreated = 0;
  score = 0;
  if (scoreEl) scoreEl.textContent = '0';
  currentColor = '#FF5722';
  isAutoDropping = false;
  const autoBtn = document.getElementById('auto-btn');
  if (autoBtn) {
    autoBtn.classList.remove('active');
    autoBtn.textContent = 'Auto Drop';
  }
}

function changeParticleColor() {
  currentColor = color(random(50, 200), random(50, 200), random(50, 200));
}

function draw() {
  rectMode(CENTER);
  background(0);
  
  // Draw score zones
  drawScoreZones();
  
  // Update stats display
  if (frameCount % 30 === 0) {
    if (particleCountEl) particleCountEl.textContent = particles.length;
    if (fpsEl) fpsEl.textContent = Math.floor(frameRate());
  }

  // Auto drop particles
  if (isAutoDropping && frameCount % 60 === 0 && particles.length < 50) {
    createParticle(random(width/2 - 100, width/2 + 100), 10);
  }

  // Draw game elements
  drawGameElements();
  
  // Update particles with scoring and cleanup
  updateParticles();

  ground.display();
}

function drawScoreZones() {
  noStroke();
  scoreZones.forEach((zone, i) => {
    const alpha = map(i % 2, 0, 1, 30, 50);
    fill(zone.points >= 50 ? color(200, 100, 0, alpha) : color(100, 100, 100, alpha));
    rect(zone.x + zone.width/2, height - divisonsHeight/4, zone.width, divisonsHeight/2);
    
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text(zone.points, zone.x + zone.width/2, height - divisonsHeight/2);
  });
}

function drawGameElements() {
  divisons.forEach(division => division.display());
  plinkos.forEach(plinko => plinko.display());
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    
    // Check for scoring
    if (particle.body.position.y > height - divisonsHeight/2) {
      const zoneIndex = floor(particle.body.position.x / (width/8));
      if (zoneIndex >= 0 && zoneIndex < scoreZones.length) {
        updateScore(scoreZones[zoneIndex].points);
      }
    }
    
    // Remove off-screen particles
    if (particle.body.position.y > height + 50 ||
        particle.body.position.x < -50 ||
        particle.body.position.x > width + 50) {
      World.remove(world, particle.body);
      particles.splice(i, 1);
      continue;
    }
    
    // Update and display particle
    particle.setColor(currentColor);
    particle.display();
  }
}
