/**
 * Main game controller class managing game state, scoring, powerups, and game modes.
 * @class Game
 */
class Game {
    /**
     * Creates a new Game instance and initializes game state.
     * @constructor
     */
    constructor() {
        this.scorePopups = [];
        this.achievements = [];
        this.reset();
        this.loadHighScores();
    }

    /**
     * Resets all game state variables to their default values.
     * @method reset
     * @private
     */
    reset() {
        this.score = 0;
        this.combo = 0;
        this.lastScoreTime = 0;
        this.timeLeft = 60;
        this.particlesLeft = 50;
        this.powerups = [];
        this.mode = 'classic';
        this.isActive = false;
        this.multiplier = 1;
    }

    /**
     * Loads high scores for all game modes from local storage.
     * @method loadHighScores
     * @private
     */
    loadHighScores() {
        this.highScores = {
            classic: parseInt(localStorage.getItem('plinkoHighScore_classic')) || 0,
            timeAttack: parseInt(localStorage.getItem('plinkoHighScore_timeAttack')) || 0,
            challenge: parseInt(localStorage.getItem('plinkoHighScore_challenge')) || 0
        };
        this.highScore = this.highScores[this.mode];
    }

    /**
     * Starts a new game with the specified mode.
     * @method start
     * @param {string} mode - Game mode ('classic', 'timeAttack', or 'challenge')
     * @public
     */
    start(mode) {
        this.reset();
        this.mode = mode;
        this.isActive = true;
        this.highScore = this.highScores[mode];

        switch(mode) {
            case 'timeAttack':
                this.timeLeft = 60;
                break;
            case 'challenge':
                this.particlesLeft = 50;
                break;
        }
    }

    /**
     * Updates game state, including mode-specific logic, powerups, and combo system.
     * Called every frame by the game loop.
     * @method update
     * @public
     */
    update() {
        if (!this.isActive) return;

        // Update game mode specific logic
        switch(this.mode) {
            case 'timeAttack':
                this.timeLeft -= deltaTime / 1000;
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
                break;
            case 'challenge':
                if (this.particlesLeft <= 0 && particles.length === 0) {
                    this.endGame();
                }
                break;
        }

        // Update powerups
        this.updatePowerups();

        // Update combo
        if (frameCount - this.lastScoreTime > 90) {
            this.combo = 0;
        }
    }

    /**
     * Adds points to the current score with combo multiplier and creates score popup.
     * @method addScore
     * @param {number} points - Base points to add
     * @param {Object} position - {x, y} coordinates for score popup
     * @public
     */
    addScore(points, position) {
        if (!this.isActive) return;

        // Calculate score with combo and multiplier
        const baseScore = points * this.multiplier;
        let finalScore = this.combo > 1 ? baseScore * (this.combo * 0.5) : baseScore;
        finalScore = Math.round(finalScore);

        // Update score
        this.score += finalScore;
        this.lastScoreTime = frameCount;
        this.combo++;

        // Create score popup
        this.createScorePopup(finalScore, position);

        // Check for high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScores[this.mode] = this.score;
            localStorage.setItem(`plinkoHighScore_${this.mode}`, this.score);
            ui.addNotification('New High Score!', 'achievement');
        }

        // Check for achievements
        this.checkScoreAchievements();
    }

    /**
     * Creates a floating score popup at the given position.
     * @method createScorePopup
     * @param {number} score - Score to display
     * @param {Object} position - {x, y} coordinates
     * @private
     */
    createScorePopup(score, position) {
        const color = this.combo > 1 ? color(255, 200, 0) : color(255);
        const text = this.combo > 1 ? `${score} (${this.combo}x)` : score.toString();
        
        this.scorePopups.push({
            text,
            color,
            x: position.x,
            y: position.y,
            alpha: 255,
            velocity: createVector(random(-1, 1), -2)
        });
    }

    /**
     * Updates and renders all active score popups.
     * @method updateScorePopups
     * @private
     */
    updateScorePopups() {
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.scorePopups[i];
            
            // Update position
            popup.x += popup.velocity.x;
            popup.y += popup.velocity.y;
            popup.velocity.y += 0.1; // gravity
            
            // Draw popup
            push();
            textAlign(CENTER);
            textSize(20);
            fill(popup.color.levels[0], popup.color.levels[1], popup.color.levels[2], popup.alpha);
            text(popup.text, popup.x, popup.y);
            pop();
            
            // Fade out
            popup.alpha -= 5;
            if (popup.alpha <= 0) {
                this.scorePopups.splice(i, 1);
            }
        }
    }

    /**
     * Randomly spawns a powerup on the game board.
     * @method spawnPowerup
     * @public
     */
    spawnPowerup() {
        if (random() < 0.1 && this.powerups.length < 3) {
            const types = ['multiplier', 'slowmo', 'magnet'];
            const type = random(types);
            const x = random(width * 0.2, width * 0.8);
            const y = random(height * 0.3, height * 0.7);
            
            this.powerups.push({
                type,
                x,
                y,
                radius: 20,
                alpha: 255,
                duration: 10,
                active: false,
                collected: false
            });
        }
    }

    /**
     * Updates all active powerups and checks for collisions with particles.
     * @method updatePowerups
     * @private
     */
    updatePowerups() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            if (!powerup.collected) {
                // Draw powerup
                this.drawPowerup(powerup);
                
                // Check for collection
                for (let particle of particles) {
                    const d = dist(particle.body.position.x, particle.body.position.y,
                                powerup.x, powerup.y);
                    if (d < powerup.radius + particle.r) {
                        this.collectPowerup(powerup);
                    }
                }
            } else {
                // Update active powerup
                powerup.duration -= deltaTime / 1000;
                if (powerup.duration <= 0) {
                    this.removePowerup(powerup);
                    this.powerups.splice(i, 1);
                }
            }
        }
    }

    /**
     * Renders a powerup with its visual effects.
     * @method drawPowerup
     * @param {Object} powerup - Powerup object to render
     * @private
     */
    drawPowerup(powerup) {
        push();
        translate(powerup.x, powerup.y);
        rotate(frameCount * 0.02);
        
        // Glow effect
        if (glowEnabled) {
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = this.getPowerupColor(powerup.type);
        }
        
        // Icon
        noStroke();
        fill(this.getPowerupColor(powerup.type));
        beginShape();
        for (let i = 0; i < 5; i++) {
            const angle = map(i, 0, 5, 0, TWO_PI);
            const r = powerup.radius * (i % 2 === 0 ? 1 : 0.6);
            vertex(cos(angle) * r, sin(angle) * r);
        }
        endShape(CLOSE);
        
        pop();
    }

    /**
     * Returns the color for a specific powerup type.
     * @method getPowerupColor
     * @param {string} type - Powerup type
     * @returns {p5.Color} Color object for the powerup
     * @private
     */
    getPowerupColor(type) {
        switch(type) {
            case 'multiplier': return color(255, 200, 0);
            case 'slowmo': return color(0, 200, 255);
            case 'magnet': return color(255, 0, 200);
        }
    }

    /**
     * Activates a powerup's effects when collected by a particle.
     * @method collectPowerup
     * @param {Object} powerup - Powerup object to activate
     * @private
     */
    collectPowerup(powerup) {
        powerup.collected = true;
        powerup.active = true;
        
        switch(powerup.type) {
            case 'multiplier':
                this.multiplier = 2;
                break;
            case 'slowmo':
                engine.timing.timeScale = 0.5;
                break;
            case 'magnet':
                // Add magnetic force to particles
                break;
        }
        
        ui.addNotification(`${powerup.type.toUpperCase()} activated!`, 'powerup');
    }

    /**
     * Removes a powerup's effects when it expires.
     * @method removePowerup
     * @param {Object} powerup - Powerup object to deactivate
     * @private
     */
    removePowerup(powerup) {
        switch(powerup.type) {
            case 'multiplier':
                this.multiplier = 1;
                break;
            case 'slowmo':
                engine.timing.timeScale = 1;
                break;
            case 'magnet':
                // Remove magnetic force
                break;
        }
    }

    /**
     * Checks and awards score-based achievements.
     * @method checkScoreAchievements
     * @private
     */
    checkScoreAchievements() {
        const scores = [1000, 5000, 10000, 50000, 100000];
        scores.forEach(score => {
            if (this.score >= score && !this.achievements.includes(score)) {
                this.achievements.push(score);
                ui.addAchievement(
                    `Score ${score}`,
                    `Reach ${score} points in ${this.mode} mode`
                );
            }
        });
    }

    /**
     * Handles game over state and transitions back to menu.
     * @method endGame
     * @public
     */
    endGame() {
        this.isActive = false;
        ui.addNotification(`Game Over! Final Score: ${this.score}`, 'info');
        setTimeout(() => {
            ui.gameState = 'menu';
        }, 2000);
    }
}

const game = new Game();
