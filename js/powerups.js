class PowerupSystem {
    constructor() {
        this.types = {
            multiplier: {
                color: '#FFD700',
                duration: 10,
                effect: () => { game.multiplier = 2; },
                revert: () => { game.multiplier = 1; }
            },
            slowmo: {
                color: '#00FFFF',
                duration: 8,
                effect: () => { 
                    engine.timing.timeScale = 0.5;
                    document.body.classList.add('slowmo');
                },
                revert: () => { 
                    engine.timing.timeScale = 1;
                    document.body.classList.remove('slowmo');
                }
            },
            magnet: {
                color: '#FF00FF',
                duration: 12,
                effect: () => {
                    this.magnetActive = true;
                    this.magnetStrength = 0.5;
                },
                revert: () => {
                    this.magnetActive = false;
                }
            },
            rainbow: {
                color: '#FF0000',
                duration: 15,
                effect: () => {
                    this.rainbowMode = true;
                    this.rainbowSpeed = 0.02;
                },
                revert: () => {
                    this.rainbowMode = false;
                }
            },
            explosion: {
                color: '#FF4500',
                duration: 5,
                effect: () => {
                    this.explosionMode = true;
                    this.explosionRadius = 100;
                },
                revert: () => {
                    this.explosionMode = false;
                }
            }
        };

        this.active = new Map();
        this.available = [];
        this.magnetActive = false;
        this.rainbowMode = false;
        this.explosionMode = false;
    }

    spawn() {
        if (this.available.length >= 3) return;

        const typeKeys = Object.keys(this.types);
        const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const x = random(width * 0.2, width * 0.8);
        const y = random(height * 0.3, height * 0.7);

        this.available.push({
            type,
            x,
            y,
            scale: 1,
            rotation: 0,
            collected: false
        });
    }

    update() {
        // Update available powerups
        for (let i = this.available.length - 1; i >= 0; i--) {
            const powerup = this.available[i];
            powerup.rotation += 0.02;
            powerup.scale = 1 + sin(frameCount * 0.05) * 0.1;

            // Check for collection
            if (!powerup.collected) {
                for (const particle of particles) {
                    const d = dist(particle.body.position.x, particle.body.position.y,
                                powerup.x, powerup.y);
                    if (d < 30) {
                        this.collect(powerup);
                        this.available.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // Update active powerups
        for (const [id, powerup] of this.active.entries()) {
            powerup.timeLeft -= deltaTime / 1000;
            if (powerup.timeLeft <= 0) {
                this.types[powerup.type].revert();
                this.active.delete(id);
            }
        }

        // Apply magnet effect
        if (this.magnetActive) {
            const center = createVector(width/2, height/2);
            for (const particle of particles) {
                const force = p5.Vector.sub(center, createVector(particle.body.position.x, particle.body.position.y));
                force.normalize();
                force.mult(this.magnetStrength);
                Body.applyForce(particle.body, particle.body.position, force);
            }
        }

        // Apply rainbow mode
        if (this.rainbowMode) {
            const hue = (frameCount * this.rainbowSpeed) % 360;
            currentColor = color(`hsb(${hue}, 100%, 100%)`);
        }

        // Apply explosion effect
        if (this.explosionMode) {
            for (const particle of particles) {
                for (const other of particles) {
                    if (particle !== other) {
                        const d = dist(particle.body.position.x, particle.body.position.y,
                                    other.body.position.x, other.body.position.y);
                        if (d < this.explosionRadius) {
                            const force = p5.Vector.sub(
                                createVector(particle.body.position.x, particle.body.position.y),
                                createVector(other.body.position.x, other.body.position.y)
                            );
                            force.normalize();
                            force.mult(0.1);
                            Body.applyForce(other.body, other.body.position, force);
                        }
                    }
                }
            }
        }
    }

    collect(powerup) {
        const type = this.types[powerup.type];
        const id = Date.now();
        
        // Remove existing powerup of same type
        for (const [existingId, existing] of this.active.entries()) {
            if (existing.type === powerup.type) {
                type.revert();
                this.active.delete(existingId);
            }
        }

        // Activate new powerup
        type.effect();
        this.active.set(id, {
            type: powerup.type,
            timeLeft: type.duration
        });

        // Visual feedback
        ui.addNotification(`${powerup.type.toUpperCase()} activated!`, 'powerup');
        this.createCollectionEffect(powerup);
    }

    display() {
        // Draw available powerups
        for (const powerup of this.available) {
            push();
            translate(powerup.x, powerup.y);
            rotate(powerup.rotation);
            scale(powerup.scale);
            
            // Glow effect
            if (glowEnabled) {
                drawingContext.shadowBlur = 20;
                drawingContext.shadowColor = this.types[powerup.type].color;
            }
            
            // Draw powerup icon
            noStroke();
            fill(this.types[powerup.type].color);
            beginShape();
            for (let i = 0; i < 5; i++) {
                const angle = map(i, 0, 5, 0, TWO_PI);
                const r = 15 * (i % 2 === 0 ? 1 : 0.6);
                vertex(cos(angle) * r, sin(angle) * r);
            }
            endShape(CLOSE);
            pop();
        }

        // Draw active powerup timers
        let y = 50;
        for (const [id, powerup] of this.active.entries()) {
            push();
            fill(this.types[powerup.type].color);
            noStroke();
            rect(10, y, map(powerup.timeLeft, 0, this.types[powerup.type].duration, 0, 100), 10);
            text(powerup.type, 120, y + 8);
            y += 20;
            pop();
        }
    }

    createCollectionEffect(powerup) {
        for (let i = 0; i < 20; i++) {
            const angle = random(TWO_PI);
            const speed = random(2, 5);
            particles.push({
                position: createVector(powerup.x, powerup.y),
                velocity: createVector(cos(angle) * speed, sin(angle) * speed),
                alpha: 255,
                color: this.types[powerup.type].color
            });
        }
    }
}