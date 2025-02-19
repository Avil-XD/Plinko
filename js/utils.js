// Utility functions for game mechanics, animations, and effects

// Animation System
class AnimationSystem {
    constructor() {
        this.particles = [];
        this.trails = [];
        this.effects = [];
    }

    createParticleExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = random(TWO_PI);
            const speed = random(2, 5);
            const lifetime = random(30, 60);
            
            this.particles.push({
                pos: createVector(x, y),
                vel: createVector(cos(angle) * speed, sin(angle) * speed),
                color: color,
                alpha: 255,
                size: random(3, 8),
                lifetime: lifetime,
                age: 0
            });
        }
    }

    createTrail(x, y, color) {
        this.trails.push({
            points: [{x, y}],
            color: color,
            alpha: 255,
            maxLength: 10
        });
    }

    createRipple(x, y, color) {
        this.effects.push({
            type: 'ripple',
            x, y,
            radius: 0,
            maxRadius: 50,
            color: color,
            alpha: 255
        });
    }

    update() {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.pos.add(p.vel);
            p.vel.y += 0.1; // gravity
            p.age++;
            p.alpha = map(p.age, 0, p.lifetime, 255, 0);
            
            if (p.age >= p.lifetime) {
                this.particles.splice(i, 1);
            }
        }

        // Update trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.alpha -= 5;
            
            if (trail.alpha <= 0) {
                this.trails.splice(i, 1);
            }
            
            if (trail.points.length > trail.maxLength) {
                trail.points.shift();
            }
        }

        // Update effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            if (effect.type === 'ripple') {
                effect.radius += 2;
                effect.alpha = map(effect.radius, 0, effect.maxRadius, 255, 0);
                
                if (effect.radius >= effect.maxRadius) {
                    this.effects.splice(i, 1);
                }
            }
        }
    }

    draw() {
        // Draw particles
        this.particles.forEach(p => {
            push();
            noStroke();
            fill(p.color.levels[0], p.color.levels[1], p.color.levels[2], p.alpha);
            circle(p.pos.x, p.pos.y, p.size);
            pop();
        });

        // Draw trails
        this.trails.forEach(trail => {
            if (trail.points.length > 1) {
                push();
                noFill();
                stroke(trail.color.levels[0], trail.color.levels[1], 
                       trail.color.levels[2], trail.alpha);
                beginShape();
                trail.points.forEach(p => vertex(p.x, p.y));
                endShape();
                pop();
            }
        });

        // Draw effects
        this.effects.forEach(effect => {
            if (effect.type === 'ripple') {
                push();
                noFill();
                stroke(effect.color.levels[0], effect.color.levels[1], 
                       effect.color.levels[2], effect.alpha);
                circle(effect.x, effect.y, effect.radius * 2);
                pop();
            }
        });
    }

    clear() {
        this.particles = [];
        this.trails = [];
        this.effects = [];
    }
}

// Sound Management
class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.muted = false;
    }

    load(name, path) {
        loadSound(path, sound => {
            this.sounds.set(name, sound);
        });
    }

    play(name, volume = 1) {
        if (this.muted) return;
        const sound = this.sounds.get(name);
        if (sound) {
            sound.setVolume(volume);
            sound.play();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        this.sounds.forEach(sound => {
            sound.setVolume(this.muted ? 0 : 1);
        });
    }
}

// Global animation and sound systems
const animations = new AnimationSystem();
const sounds = new SoundManager();

// Helper Functions
function lerp(start, end, amt) {
    return start * (1 - amt) + end * amt;
}

function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    return color(random(colors));
}

function createGradient(c1, c2, steps) {
    const colors = [];
    for (let i = 0; i < steps; i++) {
        const amt = i / (steps - 1);
        colors.push(lerpColor(c1, c2, amt));
    }
    return colors;
}